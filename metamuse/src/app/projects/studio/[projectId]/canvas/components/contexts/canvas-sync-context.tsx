import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
} from "react";
import { CanvasSettings, useCanvas } from "./canvas-context"; // Adjust path if needed
import useYjs from "../hooks/useYjs"; // Adjust path if needed
import * as Y from "yjs";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash-es";

export interface CanvasSyncContextType {
  updateYjsObject: (obj: any) => void;
  updateYjsCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  deleteYjsObject: (obj: any) => void;
  yDoc: RefObject<Y.Doc | null>;
  processingQueue: RefObject<Set<string> | null>;
  objectsMapRef: RefObject<Y.Map<any> | null>;
}

const CanvasSyncContext = createContext<CanvasSyncContextType | null>(null);

// Helper function to get pattern URL from pattern name
const getPatternUrl = async (patternName: string, foreColor: string) => {
  if (!patternName) return null;
  try {
    const response = await fetch(`/patterns/${patternName}.svg`);
    let svgText = await response.text();

    // Replace only the foreground color (assuming SVG uses #000000 for pattern elements)
    svgText = svgText
      .replace(/#000000/g, foreColor) // Replace black with current foreground
      .replace(/#000/g, foreColor) // Replace short hex black
      .replace(/black/gi, foreColor); // Replace named black colors

    // Create blob URL from modified SVG
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading pattern:", error);
    return null;
  }
};

export const CanvasSyncProvider = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) => {
  const {
    canvas,
    dimensions,
    preset,
    setDimensions,
    setPreset,
    isYjsSettingsUpdate,
  } = useCanvas();

  const { yDoc, isInitialized } = useYjs(projectId);
  const objectsMapRef = useRef<Y.Map<any> | null>(null);
  const canvasMapRef = useRef<Y.Map<any> | null>(null);
  const isLocal = useRef(false);
  const [initialized, setInitialized] = useState(false);

  // More specific origin identifier
  const LOCAL_ORIGIN = "local_canvas_sync";

  // Track previous dimensions and preset to detect changes
  const prevDimensionsRef = useRef(dimensions);
  const prevPresetRef = useRef(preset);

  // Processing queue to prevent duplicates
  const processingQueue = useRef<Set<string>>(new Set());

  // --- Helper Functions for Complex Object Types ---

  // Serialize a gradient object for YJS storage
  const serializeGradient = (gradient: fabric.Gradient) => {
    if (!gradient) return null;

    return {
      type: "gradient",
      data: gradient.toObject(),
      gradientType: gradient.type, // 'linear' or 'radial'
    };
  };

  // Deserialize a gradient from YJS back to fabric.Gradient
  const deserializeGradient = (serializedGradient: any) => {
    if (!serializedGradient || !serializedGradient.data) return null;

    return new fabric.Gradient(serializedGradient.data);
  };

  // Serialize a pattern object for YJS storage
  const serializePattern = (pattern: any) => {
    if (!pattern) return null;

    // Enhanced pattern serialization
    const patternData = {
      type: "pattern",
      data: {
        repeat: pattern.repeat || "repeat",
        name: pattern.name || "",
        color: pattern.color || "#000000",
        // Add additional properties if available
        width: pattern.width,
        height: pattern.height,
        offsetX: pattern.offsetX,
        offsetY: pattern.offsetY,
        patternTransform: pattern.patternTransform,
      },
    };

    // Remove undefined values
    Object.keys(patternData.data).forEach((key) => {
      if (patternData.data[key] === undefined) {
        delete patternData.data[key];
      }
    });

    return patternData;
  };

  // Create a pattern from serialized data
  const createPatternFromSerialized = async (serializedPattern: any) => {
    if (!serializedPattern || !serializedPattern.data) return null;

    const { name, color } = serializedPattern.data;
    if (!name || !color) return null;

    try {
      const patternUrl = await getPatternUrl(name, color);
      if (!patternUrl) return null;

      const img = await fabric.util.loadImage(patternUrl);

      const pattern = new fabric.Pattern({
        source: img,
        repeat: serializedPattern.data.repeat || "repeat",
      });

      // Store the name and color as custom properties
      (pattern as any).name = name;
      (pattern as any).color = color;

      return pattern;
    } catch (error) {
      console.error("Error recreating pattern:", error);
      return null;
    }
  };

  // --- Exported Sync Functions ---

  // These are the key changes needed to the CanvasSyncProvider

  // Update the updateYjsObject function to better handle complex objects:
  const updateYjsObject = useCallback(
    (obj: any) => {
      if (!obj || !objectsMapRef.current || !yDoc.current) return;
      if (obj.customType == "guideline") return;

      // Ensure object has an ID
      if (!obj.id) {
        (obj as any).id = uuidv4();
      }
      const objId = obj.id;
      // Check if object is a group or active selection
      if (obj instanceof fabric.ActiveSelection || obj instanceof fabric.Group) {
        obj.setCoords();
        console.log("ActiveSelection", obj);
        for (const childObj of obj.getObjects()) {
          if (childObj.id) {
            // delete the child object from YJS
            yDoc.current.transact(() => {
              objectsMapRef.current!.delete(childObj.id);
            }, LOCAL_ORIGIN);
          }
        }
      }
      // Skip if already processing this object
      if (processingQueue.current.has(objId)) {
        return;
      }

      try {
        processingQueue.current.add(objId);
        isLocal.current = true;

        // Serialize the object to JSON
        const jsonData = obj.toJSON();
        jsonData.id = objId;

        // Handle selection objects specially
        if (
          obj instanceof fabric.ActiveSelection ||
          obj instanceof fabric.Group
        ) {
          // For selections and groups, also update their child objects' positions
          // This ensures that when they're ungrouped, they appear in the correct positions
          if (obj.getObjects) {
            obj.getObjects().forEach((childObj: any) => {
              // Update child object positions
              childObj.setCoords();
            });
          }
        }

        // Handle gradient fill
        if (obj.fill instanceof fabric.Gradient) {
          jsonData.fill = serializeGradient(obj.fill);
        }
        // Handle clipPath caused by erasing
        if (obj.clipPath) {
          jsonData.clipPath = serializeClipPath(obj.clipPath);
        }

        // Handle pattern fill
        if (obj.fill && typeof obj.fill === "object" && obj.fill.source) {
          jsonData.fill = serializePattern(obj.fill);
        }

        // Update YJS map
        yDoc.current.transact(() => {
          objectsMapRef.current!.set(objId, jsonData);
        }, LOCAL_ORIGIN);
      } finally {
        setTimeout(() => {
          isLocal.current = false;
          processingQueue.current.delete(objId);
        }, 0);
      }
    },
    [yDoc]
  );

  const deleteYjsObject = useCallback(
    (obj: any | any[]) => {
      if (!obj || !objectsMapRef.current || !yDoc.current) {
        return;
      }
      if (obj instanceof Array) {
        console.log("Omo e");
      } else obj = [obj];

      obj.forEach((o: any) => {
        const oId = o.id;
        if (!oId) {
          console.warn("Attempted to delete object without ID");
          return;
        }
        // Skip if already processing
        if (processingQueue.current.has(oId)) {
          return;
        }
        try {
          // Mark as processing
          processingQueue.current.add(oId);
          isLocal.current = true;

          console.log(`Sync: Deleting YJS object ${oId}`);

          // Handle selection objects specially - we only delete the group, not its contents
          if (
            (o instanceof fabric.ActiveSelection ||
              o instanceof fabric.Group) &&
            o.getObjects()
          ) {
            console.log("Omo ee");
            // When deleting a selection/group, we need to delete each member object as well
            if (o.type === "activeSelection") {
              // For active selection, delete each member
              o.getObjects().forEach((childObj: any) => {
                if (childObj.id) {
                  yDoc.current!.transact(() => {
                    objectsMapRef.current!.delete(childObj.id);
                  }, LOCAL_ORIGIN);
                }
              });
            }
          }

          // Delete from YJS map
          yDoc.current.transact(() => {
            objectsMapRef.current!.delete(oId);
          }, LOCAL_ORIGIN);
        } finally {
          // Reset flag and remove from processing queue
          setTimeout(() => {
            isLocal.current = false;
            processingQueue.current.delete(oId);
          }, 0);
        }
      });
    },
    [yDoc]
  );

  // Update canvas settings in YJS
  const updateYjsCanvasSettings = useCallback(
    (settings: Partial<CanvasSettings>) => {
      if (!canvasMapRef.current || !yDoc.current || !settings) {
        return;
      }

      // Check if settings actually changed
      let changed = false;
      if (
        settings.dimensions &&
        JSON.stringify(settings.dimensions) !==
          JSON.stringify(prevDimensionsRef.current)
      ) {
        changed = true;
        prevDimensionsRef.current = settings.dimensions;
      }

      if (settings.preset && settings.preset !== prevPresetRef.current) {
        changed = true;
        prevPresetRef.current = settings.preset;
      }

      if (!changed) {
        return;
      }

      try {
        // Set local change flag
        isLocal.current = true;

        // Update YJS map
        yDoc.current.transact(() => {
          if (settings.dimensions) {
            canvasMapRef.current!.set("dimensions", settings.dimensions);
          }
          if (settings.preset) {
            canvasMapRef.current!.set("preset", settings.preset);
          }
        }, LOCAL_ORIGIN);
      } finally {
        // Reset flag
        setTimeout(() => {
          isLocal.current = false;
        }, 0);
      }
    },
    [yDoc]
  );
  const serializeClipPath = (clipPath: fabric.Object) => {
    return clipPath.toObject([
      "type",
      "path",
      "fill",
      "stroke",
      "strokeWidth",
      "top",
      "left",
      "scaleX",
      "scaleY",
      "angle",
    ]);
  };

  // --- Initialize Canvas and YJS ---
  useEffect(() => {
    if (!isInitialized || !yDoc.current || !canvas || initialized) return;

    console.log("🔄 Initializing canvas sync...");
    objectsMapRef.current = yDoc.current.getMap("fabricObjects");
    canvasMapRef.current = yDoc.current.getMap("fabricCanvas");

    const loadInitialState = async () => {
      try {
        // --- Load Canvas Settings ---
        const settingsData = canvasMapRef.current?.toJSON() || {};
        const initialDimensions = settingsData.dimensions as
          | { width: number; height: number }
          | undefined;
        const initialPreset = settingsData.preset as string | undefined;

        console.log("🎨 Initial settings from Yjs:", {
          dimensions: initialDimensions,
          preset: initialPreset,
        });

        let settingsApplied = false;
        if (initialDimensions || initialPreset) {
          isYjsSettingsUpdate.current = true;
          if (initialDimensions) {
            setDimensions(initialDimensions);
            prevDimensionsRef.current = initialDimensions;
            settingsApplied = true;
          }
          if (initialPreset) {
            setPreset(initialPreset);
            prevPresetRef.current = initialPreset;
            settingsApplied = true;
          }
        } else {
          console.log("🔧 No initial settings in Yjs, using local defaults.");
        }

        // --- Load Objects ---
        canvas.clear();
        const initialObjectsData = objectsMapRef.current?.toJSON() || {};

        // Prepare JSON for fabric.Canvas.loadFromJSON
        const canvasJson = {
          version: fabric.version,
          objects: Object.values(initialObjectsData),
        };

        // Load objects with proper handling of complex fill types
        await canvas.loadFromJSON(
          canvasJson,
          async (o: any, fabricObject: any) => {
            if (!fabricObject) return;

            try {
              // Handle gradient fill
              if (o.fill && o.fill.type === "gradient") {
                const gradient = deserializeGradient(o.fill);
                if (gradient) {
                  fabricObject.set("fill", gradient);
                }
              }

              // Handle pattern fill
              else if (o.fill && o.fill.type === "pattern") {
                const pattern = await createPatternFromSerialized(o.fill);
                if (pattern) {
                  fabricObject.set("fill", pattern);
                }
              }

              // Ensure ID is set
              fabricObject.set({
                id: o.id,
                transparentCorners: false,
                dirty: true,
                selectable: true,
                evented: true,
              });
            } catch (error) {
              console.error("Error restoring object:", error);
            }
          }
        );
        canvas.selection = true;
        canvas.renderAll();
        console.log("✅ Initial objects loaded.");
      } catch (error) {
        console.error("💥 Initialization failed:", error);
      } finally {
        setInitialized(true);
      }
    };

    loadInitialState();
  }, [
    isInitialized,
    yDoc,
    canvas,
    initialized,
    isYjsSettingsUpdate,
    setDimensions,
    setPreset,
  ]);

  // --- Sync LOCAL canvas setting changes TO YJS ---
  useEffect(() => {
    if (!initialized || isYjsSettingsUpdate.current) {
      if (isYjsSettingsUpdate.current) {
        isYjsSettingsUpdate.current = false;
      }
      return;
    }

    if (!dimensions || !preset) return;
    updateYjsCanvasSettings({ dimensions, preset });
  }, [
    dimensions,
    preset,
    initialized,
    isYjsSettingsUpdate,
    updateYjsCanvasSettings,
  ]);

  // --- Apply remote object changes to fabric canvas ---
  const applyObjectUpdate = useCallback(
    async (id: string, objData: any) => {
      if (!canvas) return;

      try {
        // Create a clean copy of the object data for fabric
        const objectData = { ...objData };

        // Handle special fill types before enlivening
        let fillToApply = objectData.fill;
        let hasSpecialFill = false;

        // Handle gradient fill
        if (objectData.fill && objectData.fill.type === "gradient") {
          hasSpecialFill = true;
          // We'll apply gradient after object creation
        }

        // Handle pattern fill
        if (objectData.fill && objectData.fill.type === "pattern") {
          hasSpecialFill = true;
          // We'll apply pattern after object creation
        }

        // If we have a special fill, temporarily set to a simple color
        if (hasSpecialFill) {
          objectData.fill = "rgba(0,0,0,0)"; // Transparent
        }

        // Create the fabric object
        const fabricObjects = await fabric.util.enlivenObjects([objectData]);
        const fabricObj = fabricObjects[0];
        if (fabricObj) {
          // Apply original position and ID
          fabricObj.set({
            id,
            left: objData.left !== undefined ? objData.left : 0,
            top: objData.top !== undefined ? objData.top : 0,
            visible: objData.visible !== undefined ? objData.visible : true,
          });
          // if (objData.clipPath) {
          //   const clipPath =
          // Apply special fill types if needed
          if (hasSpecialFill) {
            if (fillToApply && fillToApply.type === "gradient") {
              const gradient = deserializeGradient(fillToApply);
              if (gradient) {
                fabricObj.set("fill", gradient);
              }
            } else if (fillToApply && fillToApply.type === "pattern") {
              const pattern = await createPatternFromSerialized(fillToApply);
              if (pattern) {
                fabricObj.set("fill", pattern);
              }
            }
          }

          // Add to canvas
          canvas.add(fabricObj);
          canvas.renderAll();
        }
      } catch (error) {
        console.error(`Error applying object update for ${id}:`, error);
      }
    },
    [canvas]
  );

  // --- YJS observers for REMOTE changes -> Fabric ---
  useEffect(() => {
    if (
      !initialized ||
      !canvas ||
      !canvasMapRef.current ||
      !objectsMapRef.current
    )
      return;

    // Observer for remote object changes
    const objectObserver = (event: Y.YMapEvent<any>) => {
      // Skip if change originated locally
      if (event.transaction.origin === LOCAL_ORIGIN || isLocal.current) {
        return;
      }

      // Process each changed key
      event.changes.keys.forEach(async (change, id) => {
        // Skip if already processing this object
        if (processingQueue.current.has(id)) return;

        try {
          // Add to processing queue
          processingQueue.current.add(id);
          isLocal.current = true;

          if (change.action === "add" || change.action === "update") {
            // Find and remove existing object with same ID
            const existing = canvas.getObjects().find((o: any) => o.id === id);
            if (existing) {
              canvas.remove(existing);
            }

            // Get updated object data
            const objData = objectsMapRef.current!.get(id);
            if (!objData) return;

            // Apply the update
            await applyObjectUpdate(id, objData);
          } else if (change.action === "delete") {
            console.log("Obj to be deleted", id);
            // Find and remove existing object
            const existing = canvas.getObjects().find((o: any) => o.id === id);
            if (existing) {
              canvas.remove(existing);
              canvas.renderAll();
            }
          }
        } finally {
          // Reset processing flags
          setTimeout(() => {
            isLocal.current = false;
            processingQueue.current.delete(id);
          }, 0);
        }
      });
    };

    // Observer for remote canvas settings changes
    const canvasSettingsObserver = (event: Y.YMapEvent<any>) => {
      // Skip if change originated locally
      if (event.transaction.origin === LOCAL_ORIGIN || isLocal.current) {
        return;
      }

      try {
        isYjsSettingsUpdate.current = true;

        // Handle dimensions change
        if (event.changes.keys.has("dimensions")) {
          const newDimensions = canvasMapRef.current?.get("dimensions");
          if (
            newDimensions &&
            JSON.stringify(newDimensions) !== JSON.stringify(dimensions)
          ) {
            console.log("Applying remote dimensions:", newDimensions);
            setDimensions(newDimensions);
          }
        }

        // Handle preset change
        if (event.changes.keys.has("preset")) {
          const newPreset = canvasMapRef.current?.get("preset");
          if (newPreset && newPreset !== preset) {
            console.log("Applying remote preset:", newPreset);
            setPreset(newPreset);
          }
        }
      } finally {
        // Reset flag with delay
        setTimeout(() => {
          isYjsSettingsUpdate.current = false;
        }, 0);
      }
    };

    // Attach observers
    objectsMapRef.current.observe(objectObserver);
    canvasMapRef.current.observe(canvasSettingsObserver);

    return () => {
      // Detach observers
      objectsMapRef.current?.unobserve(objectObserver);
      canvasMapRef.current?.unobserve(canvasSettingsObserver);
    };
  }, [
    initialized,
    canvas,
    setDimensions,
    setPreset,
    isYjsSettingsUpdate,
    dimensions,
    preset,
    applyObjectUpdate,
  ]);

  // --- Fabric event handlers -> YJS ---
  useEffect(() => {
    if (!initialized || !canvas) return;

    // Enhanced object modification handler
    const handleModify = (e: any) => {
      if (isLocal.current || !e.target) return;

      // Also update the selection/group itself
      updateYjsObject(e.target);
    };

    // Handle object addition
    const handleAdd = (e: any) => {
      if (isLocal.current) return;
      console.log(e);
      const target = e.target || e.path;
      if (!target) return;

      // Ensure object has ID
      if (!target.id) {
        target.id = uuidv4();
      }
      // Update in YJS
      updateYjsObject(target);
    };

    // Handle object removal

    const handleRemove = (e: any) => {
      if (isLocal.current || !e.target) return;
      console.log("to be deleted", e.target);
      deleteYjsObject(e.target);
    };

    // Handle text editing
    const handleTextEdit = (e: any) => {
      if (isLocal.current || !e.target) return;
      updateYjsObject(e.target);
    };

    // Handle canvas clearing
    const handleClear = () => {
      if (isLocal.current || !yDoc.current || !objectsMapRef.current) return;

      try {
        isLocal.current = true;

        // Clear YJS objects map
        yDoc.current.transact(() => {
          objectsMapRef.current!.clear();
        }, LOCAL_ORIGIN);
      } finally {
        setTimeout(() => {
          isLocal.current = false;
        }, 0);
      }
    };

    // Attach fabric event listeners
    canvas.on("object:modified", handleModify);
    canvas.on("object:added", handleAdd);
    canvas.on("object:removed", handleRemove);
    canvas.on("path:created", handleAdd);
    canvas.on("text:editing:exited", handleTextEdit);
    canvas.on("canvas:cleared", handleClear);
    return () => {
      // Detach fabric event listeners
      canvas.off("object:modified", handleModify);
      canvas.off("object:added", handleAdd);
      canvas.off("object:removed", handleRemove);
      canvas.off("path:created", handleAdd);
      canvas.off("text:editing:exited", handleTextEdit);
      canvas.off("canvas:cleared", handleClear);
    };
  }, [initialized, canvas, updateYjsObject, deleteYjsObject]);

  // Expose context value
  const contextValue: CanvasSyncContextType = {
    updateYjsObject,
    updateYjsCanvasSettings,
    deleteYjsObject,
    yDoc,
    processingQueue,
    objectsMapRef
  };

  return (
    <CanvasSyncContext.Provider value={contextValue}>
      {children}
    </CanvasSyncContext.Provider>
  );
};

export function useCanvasSync(): CanvasSyncContextType {
  const context = useContext(CanvasSyncContext);
  if (!context) {
    throw new Error("useCanvasSync must be used within a CanvasSyncProvider");
  }
  return context;
}
