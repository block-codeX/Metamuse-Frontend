"use client";
import { useState, useEffect } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from "fabric";
import { useCanvasSync } from "../contexts/canvas-sync-context";
import { v4 as uuidv4 } from "uuid";

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
  const [targetObject, setTargetObject] = useState<any>(null);
  const { canvas, undoStack, redoStack } = useCanvas();
  const { updateYjsObject, deleteYjsObject, sendCommand } = useCanvasSync();

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
        preserveCustomPatternProps(cloned, clonedObj);
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

  const deleteObj = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    deleteYjsObject(activeObjects);
    // Update local canvas view
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const group = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length < 2) return;

    try {
      // Create a unique ID for the group
      const groupId = uuidv4();
      
      // Create the group locally
      const group = new fabric.Group(activeObjects);
      group.id = groupId;
      
      // Add it to canvas and make it active
      canvas.add(group);
      canvas.setActiveObject(group);
      
      // Update Yjs with the group object
      updateYjsObject(group);
      
      // Remove original objects from Yjs
      deleteYjsObject(activeObjects);
      
      // Send group command to sync with other clients
      sendCommand("group", {
        groupId: groupId,
        objectIds: activeObjects.map((obj: any) => obj.id)
      });
      
      canvas.renderAll();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const ungroup = () => {
    if (!canvas) return;
    const group = canvas.getActiveObject();
    if (!group || group.type !== "group") {
      return;
    }

    // First, delete the group from YJS
    deleteYjsObject(group);

    // Create a selection with the ungrouped objects and track their IDs
    const items = group.getObjects();
    const objectIds: string[] = [];
    
    const sel = new fabric.ActiveSelection(group.removeAll(), {
      canvas: canvas,
    });

    // Remove the group from canvas
    canvas.remove(group);
    canvas.setActiveObject(sel);

    // Now add each ungrouped object to YJS
    items.forEach((obj) => {
      // Ensure each object has an ID
      if (!obj.id) {
        obj.id = uuidv4();
      }
      objectIds.push(obj.id);
      updateYjsObject(obj);
    });
    
    // Send ungroup command to sync with other clients
    sendCommand("ungroup", {
      groupId: group.id,
      objectIds: objectIds
    });

    canvas.requestRenderAll();
  };

  const sendToFront = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject() || targetObject;
    if (obj) {
      canvas.bringObjectForward(obj);
      canvas.renderAll();
      sendCommand("bringToFront", {
        objectId: obj.id
      });
      setTargetObject(null);
    }
  };

  const bringToBack = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject() || targetObject;
    if (obj) {
      canvas.sendObjectBackwards(obj);
      canvas.renderAll();      
      sendCommand("sendToBack", {
        objectId: obj.id
      });
      
      setTargetObject(null);
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
    const obj = canvas.getActiveObject() || targetObject;
    if (obj) {
      obj.selectable = false;
      
      // Update Yjs with the locked state
      updateYjsObject(obj);
      
      // Also send lock command for others
      sendCommand("lock", {
        objectId: obj.id
      });
      
      canvas.renderAll();
    }
    setTargetObject(null);
  };

  const unlock = () => {
    if (!canvas || !targetObject) return;
    
    // Only unlock if we found an object and it's locked
    if (targetObject && targetObject.selectable === false) {
      targetObject.selectable = true;
      targetObject.hoverCursor = "move";
      targetObject.evented = true;
      
      // Update Yjs with the unlocked state
      updateYjsObject(targetObject);
      
      // Also send unlock command for others
      sendCommand("unlock", {
        objectId: targetObject.id
      });
      
      setTargetObject(null);
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
    setTargetObject,
  };
};

export default useEditFunctions;