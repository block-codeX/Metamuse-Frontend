import { useEffect, useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from 'fabric';
import useEditFunctions from "./edit-functions";

export function useKeyBindingTools() {
  const { canvas } = useCanvas();
  const { 
    copy, 
    paste, 
    undo, 
    redo, 
    deleteObj, 
    duplicate, 
    group, 
    ungroup, 
    sendToFront, 
    bringToBack,
    lock,
    unlock,
    cut
  } = useEditFunctions();

  // States for tracking active object properties
  const {activeObjDimensions, setActiveObjDimensions, foregroundColor} = useCanvas()

  useEffect(() => {
    if (!canvas) return;

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if focus is on input elements
      if (event.target instanceof HTMLElement && 
          (event.target.tagName === "INPUT" || 
           event.target.tagName === "TEXTAREA")) {
        return;
      }

      // Copy (Ctrl/Cmd + C)
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        copy();
      }

      // Cut (Ctrl/Cmd + X)
      if ((event.ctrlKey || event.metaKey) && event.key === "x") {
        event.preventDefault();
        cut();
      }

      // Paste (Ctrl/Cmd + V)
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        paste();
      }

      // Duplicate (Ctrl/Cmd + D)
      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        duplicate();
      }

      // Undo (Ctrl/Cmd + Z)
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "z") ||
          ((event.ctrlKey || event.metaKey) && event.key === "y")) {
        event.preventDefault();
        redo();
      }

      // Group (Ctrl/Cmd + G)
      if ((event.ctrlKey || event.metaKey) && event.key === "g" && !event.shiftKey) {
        event.preventDefault();
        group();
      }

      // Ungroup (Ctrl/Cmd + Shift + G)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "g") {
        event.preventDefault();
        ungroup();
      }

      // Delete (Delete or Backspace)
      if (event.key === "Delete" || event.key === "Backspace") {
        // Only prevent default if we're not in an input field
        if (!(event.target instanceof HTMLInputElement || 
              event.target instanceof HTMLTextAreaElement)) {
          event.preventDefault();
          deleteObj();
        }
      }

      // Bring Forward (Ctrl/Cmd + ])
      if ((event.ctrlKey || event.metaKey) && event.key === "]") {
        event.preventDefault();
        sendToFront();
      }

      // Send Backward (Ctrl/Cmd + [)
      if ((event.ctrlKey || event.metaKey) && event.key === "[") {
        event.preventDefault();
        bringToBack();
      }

      // Lock (Ctrl/Cmd + L)
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        lock();
      }

      // Unlock (Ctrl/Cmd + Shift + L) - unlocks currently active object
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "l") {
        event.preventDefault();
        const activeObj = canvas.getActiveObject();
        if (activeObj && !activeObj.selectable) {
          activeObj.selectable = true;
          activeObj.hoverCursor = 'move';
          activeObj.evented = true;
          canvas.requestRenderAll();
        }
      }
    };

    // Handle object selection to update state
    const handleObjectSelected = (e: fabric.IEvent) => {
      const activeObj = e.selected[0];

      if (activeObj) {
        const width = activeObj.getScaledWidth();
        const height = activeObj.getScaledHeight();
        const objType = activeObj.type === "image" ? "picture" : "object"
        const res = {width, height, objType}
        setActiveObjDimensions(res)
      }
    };

    // Handle selection cleared to reset state
    const handleSelectionCleared = () => {
      setActiveObjDimensions({width: 0, height: 0, objType: ""})
    };

    // Mouse down handler for unlocking objects
    const handleMouseDown = (e: fabric.IEvent) => {
      // Call the unlock function from useEditFunctions
      if (e.e && e.e instanceof MouseEvent) {
        unlock(e);
      }
    };

    // Apply event listeners
    document.addEventListener("keydown", handleKeyDown);
    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("mouse:down", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("mouse:down", handleMouseDown);
    };
  }, [canvas, copy, paste, cut, undo, redo, deleteObj, duplicate, group, ungroup, sendToFront, bringToBack, lock, unlock]);

  // Effect to update active object dimensions when state changes
  useEffect(() => {
    if (!canvas) return;
    console.log("Adiemuse")
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObjDimensions.width > 0 || activeObjDimensions.height > 0)) {
      const currentWidth = activeObject.getScaledWidth();
      const currentHeight = activeObject.getScaledHeight();
        
      // Only update if values actually changed to prevent infinite loops
      if (activeObjDimensions.width !== currentWidth || activeObjDimensions.height !== currentHeight) {
        // Calculate scale factors
        const scaleX = activeObjDimensions.width / activeObject.width;
        const scaleY = activeObjDimensions.height / activeObject.height;
        
        activeObject.set({
          scaleX: scaleX,
          scaleY: scaleY
        });
        
        canvas.requestRenderAll();
      }
      
      // Update border color if it changed
      if (activeObject.stroke !== foregroundColor) {
        activeObject.set({ stroke: foregroundColor });
        canvas.requestRenderAll();
      }
    }
  }, [canvas, activeObjDimensions, foregroundColor]);

  return {
    // Additional functions can be returned here if needed for direct usage in components
  };
}