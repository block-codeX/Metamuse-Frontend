import { useCanvas } from "./contexts/canvas-context";
import { useState } from "react";
import ColorPalette from "./formatting/color-palette";
import Strokes from "./formatting/strokes";
import TextFormatting from "./formatting/text";
import ImageEditor from "./formatting/pictures";

export default function TopSideTools() {
  const {
    canvas,
    setForegroundColor,
    setBackgroundColor,
    setEraserWidth,
    setPencilWidth,
  } = useCanvas();
  const [fontSize, setFontSize] = useState(20);
  const [fontStyle, setFontStyle] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

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

  // Update Foreground & Background Color
  const updateForeColor = (color) => {
    if (!canvas) return;
    setForegroundColor(color);
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const updateBackColor = (color) => {
    setBackgroundColor(color);
  };

  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full">
      {/* Color Palette Component */}
      <ColorPalette
        onSelectFore={updateForeColor}
        onSelectBack={updateBackColor}
      />

      {/* Pencil & Eraser Width Controls */}
      <div className="p-1 flexflex-col space-y-2 space-x-2 w-65 border-r ">
        <Strokes />
        <TextFormatting />
      </div>

      {/* Pictures */}
      <div className="flex flex-col items-center justify-center space-y-2 p-2">
        <ImageEditor/>
      </div>
    </div>
  );
}
