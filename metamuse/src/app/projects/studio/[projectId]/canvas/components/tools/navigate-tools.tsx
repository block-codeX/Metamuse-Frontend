import { MousePointer, Hand } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../canvas-context";

export function useNavigateTools() {
  const { canvas } = useCanvas();

  const handleSelect = () => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = "default";
  };

  const handlePan = () => {
    if (!canvas) return;
    canvas.defaultCursor = "grab";
    canvas.on("mouse:down", () => (canvas.defaultCursor = "grabbing"));
    canvas.on("mouse:up", () => (canvas.defaultCursor = "grab"));
    canvas.on("mouse:move", (opt) => {
      if (opt.e.buttons !== 1) return;
      let delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
      canvas.relativePan(delta);
    });
  };

  return [
    { icon: <MousePointer />, toolName: "Select", function: handleSelect, function_args: [] },
    { icon: <Hand />, toolName: "Pan", function: handlePan, function_args: [] },
  ];
}
