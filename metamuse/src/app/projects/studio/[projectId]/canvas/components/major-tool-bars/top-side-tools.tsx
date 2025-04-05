import { useCanvas } from "../contexts/canvas-context";
import { useState } from "react";
import ColorPalette from "../formatting/color-palette";
import Strokes from "../formatting/strokes";
import TextFormatting from "../formatting/text";
import OutlineFilters from "../formatting/pictures";
import Commands from "../commands/command";
import { CanvasOrientationSwitcher } from "../orientation/tools/switcher";
import { Button } from "@/components/ui/button";
import { useZoomPan } from "../orientation/tools/zoom";

export default function TopSideTools() {
  const {
    canvas,
    setEraserWidth,
    setPencilWidth,
  } = useCanvas();
  const {resetToFit} = useZoomPan()
  // Update Brush Width
  const updateBrushWidth = (width, type) => {
    if (!canvas) return;
    if (type === "pencil" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width;
      setPencilWidth(width);
    }
    if (type === "eraser" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width;
      setEraserWidth(width);
    }
  };

  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full">
      {/* Color Palette Component */}
      {/* Pencil & Eraser Width Controls */}
      <div className="p-1 flexflex-col space-y-2 space-x-2 w-65 border-r ">
        <Strokes />
      </div>

      {/* Pictures */}
        <OutlineFilters/>
      {/* Commands */}
      <Commands/>
      <CanvasOrientationSwitcher/>
      <div className="flex items-center gap-4 p-2 border-b">
      <Button onClick={resetToFit} variant="outline">
        Fit to Screen
      </Button>
      {/* Other tools... */}
    </div>
    </div>
  );
}
