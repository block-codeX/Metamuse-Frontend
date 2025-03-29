import { useEffect, useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from 'fabric'
import { set } from "lodash";
export function useKeyBindingTools() {
  const { canvas } = useCanvas();
  const [clipboard, setClipboard] = useState(null);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return; // Prevent conflicts with input fields
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        copySelection();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        pasteSelection();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        duplicateSelection();
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvas, clipboard]);

  const deleteSelection = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const copySelection = () => {
    canvas
    .getActiveObject()
    .clone()
    .then((cloned) => {
      setClipboard(cloned)
    });
}

  const pasteSelection = async () => {
  const clonedObj = await clipboard.clone();
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
    });
    // this should solve the unselectability
    clonedObj.setCoords();
  } else {
    canvas.add(clonedObj);
  }
  clipboard.top += 10;
  clipboard.left += 10;
  setClipboard(clipboard)
  canvas.setActiveObject(clonedObj);
  canvas.requestRenderAll();
  };

  const duplicateSelection = async () => {
    setClipboard(null)
    copySelection()
    await pasteSelection()
}
}
