import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvas } from "../contexts/canvas-context"; // Adjust path if needed
import useYjs from "./hooks/useYjs"; // Adjust path if needed
import * as Y from "yjs";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash-es"; // Use lodash-es for better tree-shaking

// Define properties to sync for Fabric objects
// Add any custom properties you use here!
const SYNC_PROPERTIES = [
    'type', 'originX', 'originY', 'left', 'top', 'width', 'height', 'scaleX', 'scaleY',
    'flipX', 'flipY', 'angle', 'skewX', 'skewY',
    'stroke', 'strokeWidth', 'strokeDashArray', 'strokeLineCap', 'strokeLineJoin', 'strokeUniform',
    'fill', 'opacity', 'visible', 'backgroundColor',
    'shadow', 'clipPath', // Note: clipPath might be complex to sync reliably if not serialized properly
    // Text specific
    'text', 'fontSize', 'fontWeight', 'fontStyle', 'textAlign', 'underline', 'overline', 'linethrough',
    'fontFamily', 'lineHeight', 'charSpacing', 'styles', 'deltaY',
    // Path specific
    'path',
    // Image specific
    'src', 'crossOrigin', 'filters',
    // Custom properties
    'id', 'customType', 'isEditing', // Add any other custom props you need persisted
];

// Define the type for the hook's return value including exported functions
export interface CanvasSyncReturnType {
    yDoc: React.RefObject<Y.Doc | null>;
    updateYjsObject: (obj: fabric.Object) => void;
    updateCanvasProperty: (key: string, value: any) => void;
    deleteYjsObject: (obj: fabric.Object) => void;
}

const useCanvasSync = (projectId: string): CanvasSyncReturnType => {
    const { canvas, setBackgroundColor } = useCanvas();
    const { yDoc, isInitialized } = useYjs(projectId); // Assuming useYjs provides yDoc ref and init status

    const objectsMapRef = useRef<Y.Map<any> | null>(null);
    const canvasMapRef = useRef<Y.Map<any> | null>(null);
    // Ref to track if the current change originated locally to prevent echo
    const isLocalChange = useRef(false);
    // Ref to prevent processing initial objects load as remote changes
    const isLoadingInitialState = useRef(false);
    // Ref to store object references by ID for quick lookup in observer
    const fabricObjectsRef = useRef<Map<string, fabric.Object>>(new Map());


    // --- Initialization ---
    useEffect(() => {
        if (!isInitialized || !yDoc.current || !canvas ) return;
        // Prevent double initialization
        if (objectsMapRef.current && canvasMapRef.current) return;

        console.log("🔄 Initializing canvas sync...");

        // Initialize Yjs maps
        objectsMapRef.current = yDoc.current.getMap("fabricObjects"); // Renamed for clarity
        canvasMapRef.current = yDoc.current.getMap("fabricCanvas"); // Renamed for clarity
        console.log("맵 초기화 완료:", objectsMapRef.current, canvasMapRef.current);

        isLoadingInitialState.current = true; // Set flag before loading

        // --- Load Initial State from Yjs ---
        const loadInitialState = async () => {
            try {
                const initialObjectsData = objectsMapRef.current?.toJSON() || {};
                const initialCanvasData = canvasMapRef.current?.toJSON() || {};

                console.log("🎨 Initial canvas settings:", initialCanvasData);
                // Apply canvas settings (only background for now)
                 if (initialCanvasData.backgroundColor) {
                     // Use setBackgroundColor from context IF it updates the actual canvas
                     // Otherwise, set directly and update Yjs if needed (though it came from Yjs)
                     canvas.setBackgroundColor(initialCanvasData.backgroundColor, () => {
                         setBackgroundColor(initialCanvasData.backgroundColor); // Update context state too
                         canvas.renderAll();
                     });
                 } else {
                    // Set default if nothing in Yjs map
                    canvas.setBackgroundColor("#ffffff", () => {
                         setBackgroundColor("#ffffff");
                         canvas.renderAll();
                         // Optionally set default in Yjs if it was empty
                         // updateCanvasProperty('backgroundColor', '#ffffff');
                    });
                 }


                console.log(`⏳ Loading ${Object.keys(initialObjectsData).length} initial objects...`);
                canvas.clear(); // Clear existing canvas objects before loading
                fabricObjectsRef.current.clear(); // Clear local ref map

                // Use Fabric's loadFromJSON for potentially better performance and handling complex objects
                // Prepare a structure Fabric understands: { version: ..., objects: [...] }
                const canvasJson = { version: fabric.version, objects: Object.values(initialObjectsData) };

                await canvas.loadFromJSON(canvasJson, () => {
                    canvas.renderAll();
                    console.log("✅ Initial objects loaded via loadFromJSON.");
                    // Populate local ref map after loading
                    canvas.getObjects().forEach(obj => {
                        if ((obj as any).id) {
                             fabricObjectsRef.current.set((obj as any).id, obj);
                        } else {
                             // Assign ID if missing after load (shouldn't happen if saved correctly)
                             const id = uuidv4();
                             (obj as any).id = id;
                             fabricObjectsRef.current.set(id, obj);
                             console.warn("Object loaded without ID, assigned new one:", id, obj);
                             // Optionally update Yjs map with the new ID? Risky if others loaded it differently.
                        }
                    });
                    console.log("🗺️ Local Fabric object map populated:", fabricObjectsRef.current.size);
                    isLoadingInitialState.current = false; // Loading finished
                });

            } catch (error) {
                console.error("💥 Initialization failed:", error);
                isLoadingInitialState.current = false; // Ensure flag is reset on error
            }
        };

        loadInitialState();

        // No cleanup needed here as this effect should run only once per canvas/yDoc init

    }, [isInitialized, yDoc, canvas, setBackgroundColor]); // Dependencies for initialization


    // --- Yjs -> Fabric Sync (Observer) ---
    useEffect(() => {
        if (!canvas || !objectsMapRef.current || !canvasMapRef.current) return;

        const objectObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
            if (isLoadingInitialState.current || transaction.origin === LOCAL_ORIGIN) {
                // console.log("Observer skipping local change or initial load");
                return; // Ignore changes made by self or during initial load
            }
            console.log("📬 Received remote object changes:", event.changes.keys.size);
            isLocalChange.current = true; // Prevent echo from canvas events triggered by these changes

            yDoc.current?.transact(() => { // Group fabric changes for performance? Maybe not needed here.
                event.changes.keys.forEach((change, id) => {
                    try {
                        if (change.action === "add" || change.action === "update") {
                            const objData = objectsMapRef.current!.get(id);
                            if (!objData) return;

                            const existingObj = fabricObjectsRef.current.get(id);

                            if (existingObj) {
                                // Update existing object
                                console.log(`🔄 Updating object ${id}`);
                                // Apply only changed properties? More complex. For now, set all synced props.
                                const updateProps = { ...objData };
                                delete updateProps.id; // Don't try to set ID again
                                existingObj.set(updateProps);
                                existingObj.setCoords(); // Update controls
                            } else {
                                // Add new object
                                console.log(`➕ Adding new object ${id}`);
                                // Use enlivenObjects to handle different object types correctly
                                fabric.util.enlivenObjects([objData], (objects) => {
                                    const fabricObj = objects[0];
                                    if (fabricObj) {
                                         // Ensure ID is set correctly
                                         (fabricObj as any).id = id;
                                         canvas.add(fabricObj);
                                         fabricObjectsRef.current.set(id, fabricObj); // Add to local map
                                         fabricObj.setCoords();
                                         // canvas.requestRenderAll(); // Render will happen after loop
                                    } else {
                                         console.error(`Failed to enliven object ${id}`);
                                    }
                                }, 'fabric'); // Namespace needed? Usually not for plain objects.
                            }
                        } else if (change.action === "delete") {
                            console.log(`➖ Deleting object ${id}`);
                            const existingObj = fabricObjectsRef.current.get(id);
                            if (existingObj) {
                                canvas.remove(existingObj);
                                fabricObjectsRef.current.delete(id); // Remove from local map
                            }
                        }
                    } catch (error) {
                         console.error(`Error processing observer change for ${id}:`, error);
                    }
                });
            }, null); // No origin needed for fabric updates triggered by remote

            canvas.requestRenderAll(); // Render once after processing all changes in the event
            // Reset flag after a short delay to allow Fabric events to fire and be ignored
            setTimeout(() => { isLocalChange.current = false; }, 0);
        };

        const canvasSettingsObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
             if (isLoadingInitialState.current || transaction.origin === LOCAL_ORIGIN) return;

             console.log("📬 Received remote canvas setting changes");
             isLocalChange.current = true; // Prevent echo

             event.changes.keys.forEach((_, key) => {
                 if (key === "backgroundColor" && canvasMapRef.current) {
                     const bgColor = canvasMapRef.current.get(key) || "#ffffff";
                     canvas.setBackgroundColor(bgColor, () => {
                         setBackgroundColor(bgColor); // Update context state
                         canvas.renderAll();
                         console.log("Updated canvas background from Yjs", bgColor);
                     });
                 }
                 // Handle other canvas settings here (e.g., dimensions if synced)
             });
             setTimeout(() => { isLocalChange.current = false; }, 0);
        };

        // Attach observers
        objectsMapRef.current.observe(objectObserver);
        canvasMapRef.current.observe(canvasSettingsObserver);
        console.log("👀 Yjs Observers attached.");

        // Cleanup observers
        return () => {
            console.log("🧹 Cleaning up Yjs observers.");
            objectsMapRef.current?.unobserve(objectObserver);
            canvasMapRef.current?.unobserve(canvasSettingsObserver);
        };
    }, [canvas, yDoc, setBackgroundColor]); // Rerun if canvas/yDoc changes


    // --- Fabric -> Yjs Sync (Event Handlers + Exported Functions) ---

    // Debounced handler for modifications to avoid flooding Yjs
    const debouncedModifyHandler = useCallback(
        debounce((obj: fabric.Object) => {
            if (!objectsMapRef.current || !obj.id) return;
            console.log(`🔄 [Debounced] Syncing modified object ${obj.id}`);
            const jsonData = obj.toJSON(SYNC_PROPERTIES); // Use defined properties
            // Ensure ID is included if not default
            if (!SYNC_PROPERTIES.includes('id')) {
                 jsonData.id = obj.id;
            }

            yDoc.current?.transact(() => {
                objectsMapRef.current!.set(obj.id!, jsonData);
            }, LOCAL_ORIGIN);
        }, 300), // Debounce time in ms (adjust as needed)
    [yDoc, objectsMapRef.current] // Ensure debounce uses the correct refs
    );


    // Generic handler for Fabric events -> Yjs updates
    const handleCanvasEvent = useCallback((e: fabric.IEvent, action: 'add' | 'remove' | 'modify' | 'text_edit') => {
        if (isLocalChange.current || !yDoc.current || !objectsMapRef.current) {
            // console.log("Skipping local change propagation");
            return; // Prevent echo
        }

        // Target can be on e.target (most events) or e.path (path:created)
        const target = e.target || (e as any).path;
        if (!target) return;

        // Ensure object has an ID (assign if missing)
        if (!target.id) {
            target.id = uuidv4();
            console.log(`Assigned new ID: ${target.id} to ${target.type}`);
        }
        const id = target.id;

         // Add object to local ref map immediately if added
         if (action === 'add') {
             fabricObjectsRef.current.set(id, target);
         }

        console.log(`⚡ Fabric event: ${action} on ${id}`);

        yDoc.current.transact(() => {
            if (!objectsMapRef.current) return; // Guard again
            switch (action) {
                case 'add':
                case 'modify':
                case 'text_edit': // Treat final text edit as modify
                    // For modify events, use the debounced handler
                    if (action === 'modify') {
                        debouncedModifyHandler(target);
                    } else {
                         // For add/text_edit, update immediately
                         console.log(`🔄 Syncing added/edited object ${id}`);
                         const jsonData = target.toJSON(SYNC_PROPERTIES);
                         if (!SYNC_PROPERTIES.includes('id')) { jsonData.id = id; }
                         objectsMapRef.current.set(id, jsonData);
                    }
                    break;
                case 'remove':
                     console.log(`➖ Syncing removed object ${id}`);
                    objectsMapRef.current.delete(id);
                     fabricObjectsRef.current.delete(id); // Remove from local map
                    break;
            }
        }, LOCAL_ORIGIN); // Mark transaction as local

    }, [yDoc, debouncedModifyHandler]); // Ensure handlers have access to current refs/state


    // Attach Fabric event listeners
    useEffect(() => {
        if (!canvas) return;
        console.log(" attaching fabric event listeners.");

        const handlers = {
            object_added: (e: fabric.IEvent) => handleCanvasEvent(e, 'add'),
            object_modified: (e: fabric.IEvent) => handleCanvasEvent(e, 'modify'),
            object_removed: (e: fabric.IEvent) => handleCanvasEvent(e, 'remove'),
            path_created: (e: fabric.IEvent) => handleCanvasEvent(e, 'add'), // Treat path:created as add
            text_editing_exited: (e: fabric.IEvent) => handleCanvasEvent(e, 'text_edit'), // Capture final text
        };

        canvas.on("object:added", handlers.object_added);
        canvas.on("object:modified", handlers.object_modified);
        canvas.on("object:removed", handlers.object_removed);
        canvas.on("path:created", handlers.path_created);
        canvas.on("text:editing:exited", handlers.text_editing_exited);

        // Cleanup listeners on component unmount or canvas change
        return () => {
            console.log("🧹 Cleaning up Fabric event listeners.");
            canvas.off("object:added", handlers.object_added);
            canvas.off("object:modified", handlers.object_modified);
            canvas.off("object:removed", handlers.object_removed);
            canvas.off("path:created", handlers.path_created);
            canvas.off("text:editing:exited", handlers.text_editing_exited);
        };
    }, [canvas, handleCanvasEvent]); // Re-attach if canvas or handler changes


    // --- Exported Functions for Programmatic Updates ---

    const updateYjsObject = useCallback((obj: fabric.Object) => {
        if (!obj || !objectsMapRef.current || !yDoc.current) return;
        // Ensure object has ID
        if (!obj.id) {
            obj.id = uuidv4();
            console.log(`Assigned new ID for programmatic update: ${obj.id}`);
        }
         // Update local ref map as well
         fabricObjectsRef.current.set(obj.id, obj);

        console.log(`🔄 Programmatically syncing object ${obj.id}`);
        const jsonData = obj.toJSON(SYNC_PROPERTIES);
        if (!SYNC_PROPERTIES.includes('id')) { jsonData.id = obj.id; }

        yDoc.current.transact(() => {
            objectsMapRef.current!.set(obj.id!, jsonData);
        }, LOCAL_ORIGIN);
    }, [yDoc]); // Dependency on yDoc

    const deleteYjsObject = useCallback((obj: fabric.Object) => {
         if (!obj || !obj.id || !objectsMapRef.current || !yDoc.current) return;

         console.log(`➖ Programmatically deleting object ${obj.id}`);
          fabricObjectsRef.current.delete(obj.id); // Remove from local map

         yDoc.current.transact(() => {
             objectsMapRef.current!.delete(obj.id!);
         }, LOCAL_ORIGIN);
    }, [yDoc]); // Dependency on yDoc


    const updateCanvasProperty = useCallback((key: string, value: any) => {
        if (!canvasMapRef.current || !yDoc.current) return;
        console.log(`🔄 Programmatically syncing canvas property ${key}`);
        yDoc.current.transact(() => {
            canvasMapRef.current!.set(key, value);
        }, LOCAL_ORIGIN);
    }, [yDoc]); // Dependency on yDoc


    return { yDoc, updateYjsObject, updateCanvasProperty, deleteYjsObject };
};

export default useCanvasSync;