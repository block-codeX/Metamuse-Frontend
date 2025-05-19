import { useEffect, useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from "fabric";
import useEditFunctions from "./edit-functions";
import { useCanvasSync } from "../contexts/canvas-sync-context";

export function useKeyBindingTools() {
  const { canvas } = useCanvas();
  const [prevFore, setPrevFore] = useState("");
  const [prevBack, setPrevBack] = useState("");
  const {
    copy,
    paste,
    deleteObj,
    duplicate,
    group,
    ungroup,
    sendToFront,
    bringToBack,
    lock,
    unlock,
    cut,
  } = useEditFunctions();
  const { updateYjsObject } = useCanvasSync();

  // States for tracking active object properties
  const {
    activeObjDimensions,
    setActiveObjDimensions,
    foregroundColor,
    backgroundColor,
  } = useCanvas();
  useEffect(() => {
    if (!canvas) return;

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if focus is on input elements
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA")
      ) {
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

      // Group (Ctrl/Cmd + G)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "g" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        group();
      }

      // Ungroup (Ctrl/Cmd + Shift + G)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "g"
      ) {
        event.preventDefault();
        ungroup();
      }

      // Delete (Delete or Backspace)
      if (event.key === "Delete" || event.key === "Backspace") {
        // Only prevent default if we're not in an input field
        if (
          !(
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
          )
        ) {
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
    };

    // Handle object selection to update state
    const handleObjectSelected = (e: any) => {
      const activeObj = e.selected[0];

      if (activeObj) {
        const width = activeObj.getScaledWidth();
        const height = activeObj.getScaledHeight();
        const objType = activeObj.type === "image" ? "picture" : "object";
        const res = { width, height, objType };
        setActiveObjDimensions(res);
      }
    };

    // Handle selection cleared to reset state
    const handleSelectionCleared = () => {
      setActiveObjDimensions({ width: 0, height: 0, objType: "" });
    };

    // Apply event listeners
    document.addEventListener("keydown", handleKeyDown);
    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [
    canvas,
    copy,
    paste,
    cut,
    deleteObj,
    duplicate,
    group,
    ungroup,
    sendToFront,
    bringToBack,
    lock,
    unlock,
  ]);

  // Effect to update active object dimensions when state changes
  // Effect to update active object dimensions when state changes
  useEffect(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) return;
    const activeObject = activeObjects[0];
    if (
      activeObject &&
      (activeObjDimensions.width > 0 || activeObjDimensions.height > 0)
    ) {
      // Only update if values actually changed to prevent infinite loops
      if (
        activeObject &&
        !(
          activeObject.type === "group" ||
          activeObject.type === "activeSelection"
        ) &&
        (activeObjDimensions.width > 0 || activeObjDimensions.height > 0)
      ) {
        // Calculate scale factors
        const scaleX = activeObjDimensions.width / activeObject.width;
        const scaleY = activeObjDimensions.height / activeObject.height;

        activeObject.set({
          scaleX: scaleX,
          scaleY: scaleY,
        });
        updateYjsObject(activeObject);
        canvas.requestRenderAll();
      }
    }
  }, [canvas, activeObjDimensions]);

  // Add a separate effect to handle color changes only
  // This will run only when foregroundColor or backgroundColor changes, not when objects are selected
  useEffect(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      !(
        activeObject.type === "group" || activeObject.type === "activeSelection"
      )
    ) {
      // Check if the object has stroke property and update it
      if ("stroke" in activeObject && activeObject.stroke !== undefined && prevFore !== foregroundColor) {
        setPrevFore(foregroundColor)
        activeObject.set({ stroke: foregroundColor });
        updateYjsObject(activeObject);
      }

      // Check if the object has fill property and update it
      if ("fill" in activeObject && activeObject.fill !== undefined && prevBack !== backgroundColor) {
        setPrevBack(backgroundColor)
        activeObject.set({ fill: backgroundColor });
        updateYjsObject(activeObject);
      }

      canvas.requestRenderAll();
      updateYjsObject(activeObject);
    }
  }, [canvas, foregroundColor, backgroundColor]);
  return {
    // Additional functions can be returned here if needed for direct usage in components
  };
}
