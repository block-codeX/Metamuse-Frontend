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
import { error } from "console";

export interface CanvasSyncContextType {
  updateYjsObject: (obj: any) => void;
  updateYjsCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  deleteYjsObject: (obj: any) => void;
  yDoc: RefObject<Y.Doc | null>;
}

const CanvasSyncContext = createContext<CanvasSyncContextType | null>(null);
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

  // --- Exported Sync Function ---
  // In canvas-sync-context.tsx, update the updateYjsObject function:
  const updateYjsObject = useCallback(
    (obj: any) => {
      if (!obj || !objectsMapRef.current || !yDoc.current) {
        return;
      }

      // Ensure object has an ID
      if (!obj.id) {
        (obj as any).id = uuidv4();
        console.log(`Assigned new ID during sync: ${obj.id} to ${obj.type}`);
      }
      const objId = obj.id;

      // Skip if already processing this object
      if (processingQueue.current.has(objId)) {
        return;
      }

      try {
        processingQueue.current.add(objId);
        isLocal.current = true;
        // Custom serialization for special fill types
        const jsonData = obj.toJSON();
        jsonData.id = objId;

        // Handle gradient fill
        if (obj.fill instanceof fabric.Gradient) {
          jsonData.fill = {
            type: "gradient",
            gradient: obj.fill.toObject(),
          };
        }

        // Handle pattern fill
        if (obj.fill instanceof fabric.Pattern) {
          console.log("Source", obj.fill.toObject());
          jsonData.fill = {
            type: "pattern",
            pattern: obj.fill.toObject(["color", "name"]),
          };
        }

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
    (obj: any) => {
      if (!obj || !obj.id || !objectsMapRef.current || !yDoc.current) {
        return;
      }

      const objId = obj.id;

      // Skip if already processing
      if (processingQueue.current.has(objId)) {
        return;
      }

      try {
        // Mark as processing
        processingQueue.current.add(objId);

        // Set local change flag
        isLocal.current = true;

        console.log(`Sync: Deleting YJS object ${objId}`);

        // Remove from local ref map first

        yDoc.current.transact(() => {
          objectsMapRef.current!.delete(objId);
        }, LOCAL_ORIGIN);
      } finally {
        // Reset flag and remove from processing queue
        setTimeout(() => {
          isLocal.current = false;
          processingQueue.current.delete(objId);
        }, 0);
      }
    },
    [yDoc]
  );

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
        console.log("Sync: Skipping Yjs settings update (no change detected).");
        return;
      }

      try {
        // Set local change flag
        isLocal.current = true;

        console.log("Sync: Updating Yjs canvas settings", settings);

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

  // Initialize canvas and YJS
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
        const canvasJson = {
          version: fabric.version,
          objects: Object.values(initialObjectsData),
        };

        await canvas
          .loadFromJSON(canvasJson, (o, fabricObject: any) => {
            let fill = o.fill;
            if (o.fill?.type == "gradient") {
              //  fill = new fabric.Gradient()
              fill = "red";
            } else if (o.fill?.type == "pattern") {
              // fill = new fabric.Pattern()
              fill = "red";
            }
            fabricObject.set({
              fill,
              transparentCorners: false,
              dirty: true,
            });
            fabricObject.id = o.id;
          })
          .then((canvas) => {
            canvas.renderAll();
            console.log("✅ Initial objects loaded.");
          })
          .catch((error) => {
            console.error("💥 Initialization failed: for canvas", error);
          });
      } catch (error) {
        console.error("💥 Initialization failed:", error);
      } finally {
        setInitialized(true);
      }
    };

    loadInitialState();
  }, [isInitialized, yDoc, canvas, initialized, isYjsSettingsUpdate]);

  // Sync LOCAL canvas setting changes TO YJS
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

  // YJS observers for REMOTE changes -> Fabric
  useEffect(() => {
    if (
      !initialized ||
      !canvas ||
      !canvasMapRef.current ||
      !objectsMapRef.current
    )
      return;

    // In canvas-sync-context.tsx, update the objectObserver:
    const objectObserver = (event: Y.YMapEvent<any>) => {
      if (
        !initialized ||
        event.transaction.origin === LOCAL_ORIGIN ||
        isLocal.current
      ) {
        return;
      }

      event.changes.keys.forEach(async (change, id) => {
        if (processingQueue.current.has(id)) return;
        const existing = canvas.getObjects().find((o: any) => o.id === id);
        if (existing) {
          canvas.remove(existing);
          console.log("Removed object from canvas", id);
        }
        try {
          processingQueue.current.add(id);
          isLocal.current = true;
          if (change.action === "add" || change.action === "update") {
            const objData = objectsMapRef.current!.get(id);
            if (!objData) return;
            applyObjectUpdate(id, objData);
          } else if (change.action === "delete") {
            // Ignore, we've already removed existing objects..
          }
        } finally {
          setTimeout(() => {
            isLocal.current = false;
            processingQueue.current.delete(id);
          }, 0);
        }
      });
    };

    // Helper function to apply updates
    const applyObjectUpdate = (id: string, objData: any) => {
      fabric.util.enlivenObjects([objData]).then((objects) => {
        if (objects[0]) {
          const fabricObj = objects?.[0] as any;
          if (fabricObj) {
            fabricObj.set({
              id,
              left: objData.left || 0,
              top: objData.top || 0,
              visible: objData.visible ?? true,
            });
            // Handle pattern and gradient
            canvas.add(fabricObj);
          }
        }
        canvas.renderAll();
      });
    };

    const canvasSettingsObserver = (
      event: Y.YMapEvent<any>,
      transaction: Y.Transaction
    ) => {
      // Skip if change originated locally
      if (transaction.origin === LOCAL_ORIGIN || isLocal.current) {
        return;
      }

      console.log("📬 Remote canvas setting changes");

      try {
        isYjsSettingsUpdate.current = true;

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
  ]);

  // Fabric event handlers -> YJS
  useEffect(() => {
    if (!initialized || !canvas) return;

    const handleModify = (e: any) => {
      if (isLocal.current || !e.target) return;
      updateYjsObject(e.target);
    };

    const handleAdd = (e: any) => {
      // if (isLocal.current) {
      //   console.log("Sync: Skipping local object addition.");
      //   return; // Remove this return to allow local additions to sync
      // }
      const target = e.target || (e as any).path;
      if (!target) return;
      if (!target.id) {
        target.id = uuidv4();
      }
      updateYjsObject(target);
    };

    const handleRemove = (e: any) => {
      if (isLocal.current || !e.target) return;
      deleteYjsObject(e.target);
    };

    const handleTextEdit = (e: any) => {
      if (isLocal.current || !e.target) return;
      updateYjsObject(e.target);
    };

    const handleClear = () => {
      if (isLocal.current || !yDoc.current || !objectsMapRef.current) return;

      console.log("Sync: Clearing YJS objects map");

      try {
        isLocal.current = true;

        yDoc.current.transact(() => {
          objectsMapRef.current!.clear();
        }, LOCAL_ORIGIN);
      } finally {
        setTimeout(() => {
          isLocal.current = false;
        }, 0);
      }
    };

    // Attach Listeners
    canvas.on("object:added", handleAdd);
    canvas.on("object:modified", handleModify);
    canvas.on("object:removed", handleRemove);
    canvas.on("path:created", handleAdd);
    canvas.on("text:editing:exited", handleTextEdit);
    canvas.on("canvas:cleared", handleClear);

    return () => {
      // Detach Listeners
      canvas.off("object:added", handleAdd);
      canvas.off("object:modified", handleModify);
      canvas.off("object:removed", handleRemove);
      canvas.off("path:created", handleAdd);
      canvas.off("text:editing:exited", handleTextEdit);
      canvas.off("canvas:cleared", handleClear);
    };
  }, [initialized, canvas, updateYjsObject, deleteYjsObject]);

  const contextValue: CanvasSyncContextType = {
    updateYjsObject,
    updateYjsCanvasSettings,
    deleteYjsObject,
    yDoc,
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
