import { useEffect } from "react";
import { useCanvas } from "../canvas-context";

export function useDeleteTool() {
  const { canvas } = useCanvas();

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (event) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          activeObjects.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);
}
