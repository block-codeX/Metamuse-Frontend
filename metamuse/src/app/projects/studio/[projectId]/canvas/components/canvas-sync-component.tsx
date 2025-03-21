import {  useEffect, useRef, useState } from "react";
import { useCanvas } from "./contexts/canvas-context";
import useYjs from "./hooks/useYjs";
import * as Y from "yjs";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

const useCanvasSync = (projectId: string) => {
  const { canvas, setBackgroundColor } = useCanvas();
  const { yDoc, isInitialized } = useYjs(projectId);
  const objectsMapRef = useRef<Y.Map<any> | null>(null);
  const canvasMapRef = useRef<Y.Map<any> | null>(null);
  const isLocal = useRef(false);
  const [initialized, setInitialized] = useState(false);
  const LOCAL_ORIGIN = "local";

  useEffect(() => { 
    console.log(isInitialized, "nene")
    if (!yDoc.current || !canvas || !isInitialized || initialized) return;

    console.log("🔄 Initializing canvas sync");
    setInitialized(true);

    // Initialize Yjs maps
    objectsMapRef.current = yDoc.current.getMap("objects");
    canvasMapRef.current = yDoc.current.getMap("canvas");
    console.log(
      "🔍 Yjs maps initialized:",
      objectsMapRef.current,
      canvasMapRef.current
    )

    const loadInitialState = async () => {
      try {
        const initialObjects = objectsMapRef.current?.toJSON() || {};
        const initialCanvasSettings = canvasMapRef.current?.toJSON() || {};

        console.log("🎨 Initial canvas settings:", initialCanvasSettings);
        setBackgroundColor(initialCanvasSettings.backgroundColor || "#ffffff");

        // Load objects with proper async/await
        const loadPromises = Object.values(initialObjects).map(
          async (obj: any) => {
            return new Promise<void>((resolve) => {
              // if (!obj?.type) {
              //   console.warn("⚠️ Invalid object format:", obj);
              //   return resolve();
              // }
              fabric.util
                .enlivenObjects([obj])
                .then((objects) => {
                  if (!objects?.[0]) {
                    return resolve();
                  }

                  const fabricObj = objects[0];

                  // Ensure required properties
                  fabricObj.set({
                    id: obj.id || uuidv4(),
                    left: obj.left || 0,
                    top: obj.top || 0,
                    visible: obj.visible ?? true,
                  });

                  canvas.add(fabricObj);
                  // fabricObj.setCoords();
                  resolve();
                })
                .catch((error) => {
                  console.error("🔥 Enliven error:", error);
                  resolve();
                });
            });
          }
        );

        await Promise.all(loadPromises);

        console.log("🚀 All objects loaded:", canvas.getObjects().length);
        canvas.renderAll();

        // Verify canvas state
        console.log("📐 Canvas dimensions:", {
          width: canvas.getWidth(),
          height: canvas.getHeight(),
          zoom: canvas.getZoom(),
        });
      } catch (error) {
        console.error("💥 Initialization failed:", error);
      }
    };

    loadInitialState();
  }, [isInitialized, setBackgroundColor]); // Proper dependencies

  // Canvas handlers
  useEffect(() => {
    if (!initialized || !yDoc.current) return;

    const handleAction = (e: fabric.TEvent, action: string) => {
      if (isLocal.current) {
        console.log("Skipping remote update in handler");
        return;
      }
      switch (action) {
        case "add": {
          if (!e.target) return;
          const obj = e.target;
          obj.id = obj.id || uuidv4();
          yDoc.current.transact(() => {
            if (objectsMapRef.current) {
              if (!objectsMapRef.current.has(obj.id)) {
                console.log("Has this, ", obj.id)
                objectsMapRef.current.set(obj.id, obj.toJSON());
              }
            }
          }, LOCAL_ORIGIN);
          break;
        }
        case "modify": {
          if (!e.target) return;
          const obj = e.target;
          obj.id = obj.id || uuidv4();
          yDoc.current.transact(() => {
            if (objectsMapRef.current) {
                objectsMapRef.current.set(obj.id, obj.toJSON());
            }
          }, LOCAL_ORIGIN);
          break;
        }
        case "remove": {
          if (!e.target) return;
          const obj = e.target;
          // obj.id = obj.id || uuidv4();
          if (!obj.id) {
            console.error("Cannot delete object: missing id");
            return;
          }        
          yDoc.current.transact(() => {
            if (objectsMapRef.current) {
              objectsMapRef.current.delete(obj.id);
              console.log("Deleted object with id:", obj.id);
              }
          }, LOCAL_ORIGIN);
          break;
        }
      }
      console.log("🔎 Current Yjs state:",objectsMapRef.current?.size);
    };
    

    const handlers = {
      added: (e: fabric.TEvent) => handleAction(e, 'add'),
      modified: (e: fabric.TEvent) => handleAction(e, 'modify'),
      removed: (e: fabric.TEvent) => handleAction(e, 'remove'),
      pathCreated: (e: fabric.TEvent) => handleAction(e as fabric.TEvent, 'add'),
    };
    canvas.on("object:added", handlers.added);
    canvas.on("object:modified", handlers.modified);
    canvas.on("object:removed", handlers.removed);
    canvas.on("path:created", handlers.pathCreated);
        return () => {
      canvas.off("object:added", handlers.added);
      canvas.off("object:modified", handlers.modified);
      canvas.off("object:removed", handlers.removed);
      canvas.off("path:created", handlers.pathCreated);
    }
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;

    const objectObserver = (event: Y.YMapEvent<any>) => {
      console.log("Transaction origin:", event.transaction.origin);  
      if (event.transaction.origin === LOCAL_ORIGIN) {
        console.log("Skipping local update in observer");
        return;
      }    
      isLocal.current = true;
      event.changes.keys.forEach((change, id) => {
        if (change.action === "delete") {
          const existing = canvas.getObjects().find((o: any) => o.id === id);
          if (existing) {
            canvas.remove(existing);
            console.log("Removed object from canvas", id);
            canvas.renderAll();
          }
          return; // Skip further processing for deletions.
        }
        const obj = objectsMapRef.current?.get(id);
        fabric.util.enlivenObjects([obj]).then((objects) => {
          const fabricObj = objects?.[0];
          console.log(id, fabricObj)
          if (fabricObj) {
            fabricObj.set({ id, left: obj.left || 0, top: obj.top || 0, visible: obj.visible ?? true });
          const existing = canvas.getObjects().find((o: any) => o.id === id);
          if (existing)
            canvas.remove(existing);
          if (change.action === "add" || change.action === "update") {
            // if (existing) {
            //   console.log("Removing existing object", id);
            //   canvas.remove(existing);
            // }
            if (fabricObj) {
              canvas.add(fabricObj);
              console.log("Added/updated object from Yjs", id);
            }
          } else if (change.action === "delete") {
            console.log("Deleting object", id);

              console.log("Removed object from canvas", id);
          }
          
        }
          canvas.renderAll();
          isLocal.current = false;
        });
      });
    
    };
    
    const canvasSettingsObserver = (event: Y.YMapEvent<any>) => {
      event.changes.keys.forEach((_, key) => {
        if (key === "backgroundColor" && canvasMapRef.current) {
          const bgColor = canvasMapRef.current.get(key) || "#ffffff";
          setBackgroundColor(bgColor);
          console.log("Updated canvas background from Yjs", bgColor);
        }
      });
    };

    if (objectsMapRef.current) {
      console.log("🔍 Observing Yjs objects map");
      objectsMapRef.current.observe(objectObserver);
    }
     else {
      console.error("⚠️ Objects map not initialized");
    }
    
    if (canvasMapRef.current) {
      canvasMapRef.current.observe(canvasSettingsObserver);
      console.log("🔍 Observing Yjs canvas settings map");
    } else {
      console.error("⚠️ Canvas settings map not initialized");
    }
    return () => {
      if (objectsMapRef.current) {
        objectsMapRef.current.unobserve(objectObserver);
      }
      if (canvasMapRef.current) {
        canvasMapRef.current.unobserve(canvasSettingsObserver);
      }
    }
  }, [initialized]);

  return { yDoc };
};

export default useCanvasSync;
