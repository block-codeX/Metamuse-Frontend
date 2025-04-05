import { Scissors, Crop, Layers } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";

export function useClipTools() {
  const { canvas } = useCanvas();

  const cleanupEventListeners = () => {
    if (!canvas) return;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
  };

  // Clipping Tool - Defines a clipping region using a rectangle
  const activateClipTool = () => {
    if (!canvas) return;
    cleanupEventListeners();

    let clipRect;
    let isDrawing = false;

    canvas.on("mouse:down", (opt) => {
      if (isDrawing) return;

      const pointer = canvas.getPointer(opt.e);
      clipRect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: "rgba(0,0,0,0.3)", // Transparent region
        stroke: "black",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });

      canvas.add(clipRect);
      isDrawing = true;
    });

    canvas.on("mouse:move", (opt) => {
      if (!isDrawing || !clipRect) return;

      const pointer = canvas.getPointer(opt.e);
      clipRect.set({
        width: Math.abs(pointer.x - clipRect.left),
        height: Math.abs(pointer.y - clipRect.top),
      });

      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      if (!clipRect) return;

      canvas.clipPath = clipRect;
      canvas.renderAll();
      isDrawing = false;
    });
  };

  // Masking Tool - Uses an image as a mask
  const activateMaskTool = (imageURL) => {
    if (!canvas) return;
    cleanupEventListeners();

    fabric.Image.fromURL(imageURL, (img) => {
      img.scaleToWidth(canvas.width / 2);
      img.scaleToHeight(canvas.height / 2);
      img.set({ left: 50, top: 50, selectable: true });

      // Apply as mask
      canvas.getObjects().forEach((obj) => {
        obj.clipPath = img;
      });

      canvas.add(img);
      canvas.renderAll();
    });
  };

  return [
    { icon: <Scissors />, toolName: "Clip", function: activateClipTool, function_args: [] },
    { icon: <Layers />, toolName: "Mask", function: activateMaskTool, function_args: ["path/to/your/image.jpg"] },
  ];
}
