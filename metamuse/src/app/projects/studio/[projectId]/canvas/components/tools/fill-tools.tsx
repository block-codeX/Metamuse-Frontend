import * as fabric from "fabric";
import { useCanvas } from "../canvas-context";
import { PaintBucket, SquareRoundCorner, Paintbrush, PaintbrushVertical, Image } from "lucide-react";
export function useFillTools () {
  const { canvas } = useCanvas();

    const applyFillStroke = (type, value) => {
        if (!canvas) return;
      
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
      
        if (type === "fill") {
          activeObject.set("fill", value);
        } else if (type === "stroke") {
          activeObject.set("stroke", value);
        }
      
        canvas.renderAll();
      };
      const applyLinearGradient = (colors) => {
        if (!canvas) return;
      
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
      
        const gradient = new fabric.Gradient({
          type: "linear",
          gradientUnits: "percentage",
          coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
          colorStops: colors.map((color, index) => ({
            offset: index / (colors.length - 1),
            color: color,
          })),
        });
      
        activeObject.set("fill", gradient);
        canvas.renderAll();
      };
const applyRadialGradient = (colors) => {
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  const gradient = new fabric.Gradient({
    type: "radial",
    gradientUnits: "percentage",
    coords: { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 1 },
    colorStops: colors.map((color, index) => ({
      offset: index / (colors.length - 1),
      color: color,
    })),
  });

  activeObject.set("fill", gradient);
  canvas.renderAll();
};
      
const applyPatternFill = (imageURL) => {
    if (!canvas) return;
  
    fabric.util.loadImage(imageURL, (img) => {
      if (!img) return;
  
      const pattern = new fabric.Pattern({
        source: img,
        repeat: "repeat",
      });
  
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("fill", pattern);
        canvas.renderAll();
      }
    });
  };
  
    return [
        { icon: <PaintBucket />, toolName: "Solid Fill", function: applyFillStroke, function_args: ["fill", "#ff0000"] },
        { icon: <SquareRoundCorner />, toolName: "Stroke Color", function: applyFillStroke, function_args: ["stroke", "#000000"] },
        { icon: <Paintbrush />, toolName: "Linear Gradient", function: applyLinearGradient, function_args: [["#ff0000", "#0000ff"]] },
        { icon: <PaintbrushVertical />, toolName: "Radial Gradient", function: applyRadialGradient, function_args: [["#ff0000", "#ffff00"]] },
        { icon: <Image />, toolName: "Pattern Fill", function: applyPatternFill, function_args: ["https://example.com/pattern.jpg"] },
      ];
      
}