"use client";
import { useState, useEffect } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from "fabric";
import { useCanvasSync } from "../contexts/canvas-sync-context";
export function preserveCustomPatternProps(
  sourceObj: fabric.Object,
  targetObj: fabric.Object
) {
  const srcFill = sourceObj.fill as any;
  const tgtFill = targetObj.fill as any;

  if (
    srcFill &&
    srcFill.source &&
    typeof srcFill === "object" &&
    tgtFill &&
    tgtFill.source
  ) {
    if (srcFill.name) tgtFill.name = srcFill.name;
    if (srcFill.color) tgtFill.color = srcFill.color;
  }
}

const useEditFunctions = () => {
  const [clipboard, setClipboard] = useState<any>(null);
  const { canvas, undoStack, redoStack } = useCanvas();
  const { updateYjsObject, deleteYjsObject } = useCanvasSync();

  const copy = () => {
    canvas
      ?.getActiveObject()
      ?.clone()
      .then((cloned) => {
        setClipboard(cloned as any);
      });
  };
  const cut = async () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const cloned = await obj.clone();
    setClipboard(cloned);
    canvas.remove(obj);
    canvas.renderAll();
  };
  const paste = async () => {
    if (!canvas || !clipboard) return;
    const clonedObj = await clipboard.clone();
    console.log("Clipboard", clipboard);
    console.log(clonedObj);
    preserveCustomPatternProps(clipboard, clonedObj);
    canvas.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    });
    if (clonedObj instanceof fabric.ActiveSelection) {
      // active selection needs a reference to the canvas.
      clonedObj.canvas = canvas;
      clonedObj.forEachObject((obj) => {
        canvas.add(obj);
        updateYjsObject(obj);
      });
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
      updateYjsObject(clonedObj);
    }
    clipboard.top += 10;
    clipboard.left += 10;
    setClipboard(clipboard);
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  };
  const duplicate = async () => {
    canvas
      ?.getActiveObject()
      ?.clone()
      .then(async (cloned) => {
        const clonedObj = await cloned.clone();
        preserveCustomPatternProps(cloned, clonedObj); // 👈 this line
        canvas.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 10,
          top: clonedObj.top + 10,
          evented: true,
        });
        if (clonedObj instanceof fabric.ActiveSelection) {
          // active selection needs a reference to the canvas.
          clonedObj.canvas = canvas;
          clonedObj.forEachObject((obj) => {
            canvas.add(obj);
            updateYjsObject(obj);
          });
          // this should solve the unselectability
          clonedObj.setCoords();
        } else {
          canvas.add(clonedObj);
          updateYjsObject(clonedObj);
        }
        cloned.top += 10;
        cloned.left += 10;
        setClipboard(clipboard);
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
      });
  };
  // const deleteObj = () => {
  //   if (!canvas) return;
  //   const obj = canvas.getActiveObject();
  //   if (obj) {
  //     canvas.remove(obj);
  //     canvas.renderAll();
  //   }
  // };
  const deleteObj = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    
    // If multiple objects are selected
    if (activeObjects.length > 1) {
      // Get the active selection object
      const selection = canvas.getActiveObject();
      
      // First delete the selection group itself if it has an ID
      if (selection && selection.id) {
        deleteYjsObject(selection);
      }
      
      // Then delete each individual object
      activeObjects.forEach(obj => {
        deleteYjsObject(obj);
      });
    } else if (activeObjects.length === 1) {
      // Single object deletion
      deleteYjsObject(activeObjects[0]);
    }
    
    // Update local canvas view
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };
    

  const group = () => {
    if (!canvas) return;
    const group = new fabric.Group(canvas.getActiveObjects()?.removeAll());
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };
  const ungroup = () => {
    if (!canvas) return;
    const group = canvas.getActiveObject();
    if (!group || group.type !== "group") {
      return;
    }
    canvas.remove(group);
    var sel = new fabric.ActiveSelection(group.removeAll(), {
      canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
  };
  const sendToFront = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.bringObjectForward(obj);
      canvas.renderAll();
    }
  };
  const bringToBack = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.sendObjectBackwards(obj);
      canvas.renderAll();
    }
  };

  const undo = () => {
    if (!canvas) return;
    if (undoStack.current.length <= 1) return;
    const currentState = undoStack.current.pop();
    if (currentState) redoStack.current.push(currentState);

    const previousState = undoStack.current[undoStack.current.length - 1];
    canvas.loadFromJSON(
      JSON.parse(previousState),
      canvas.renderAll.bind(canvas)
    );
  };

  const redo = () => {
    if (redoStack.current.length === 0 || !canvas) return;
    const nextState = redoStack.current.pop();
    undoStack.current.push(nextState as string);
    canvas.loadFromJSON(
      JSON.parse(nextState as string),
      canvas.renderAll.bind(canvas)
    );
  };
  const lock = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.selectable = false;
      obj.currentLock = `lock ${obj.getX()} ${obj.getY()}`;
      obj.evented = false;
      canvas.renderAll();
    }
  };
  const unlock = (e) => {
    if (!canvas) return;
    // Get pointer coordinates relative to canvas
    // const pointer = canvas.getScenePoint(e.e);
    // // Find object under pointer

    const targetObject = canvas.findTarget(e.e);
    // Only unlock if we found an object and it's locked
    if (targetObject && targetObject.selectable === false) {
      targetObject.selectable = true;
      targetObject.hoverCursor = "move";
      targetObject.evented = true;
      // Only rendering the specific object is more efficient
      canvas.requestRenderAll();
    }
  };

  return {
    copy,
    paste,
    duplicate,
    deleteObj,
    group,
    ungroup,
    sendToFront,
    bringToBack,
    undo,
    redo,
    lock,
    unlock,
    cut,
  };
};
export default useEditFunctions;
