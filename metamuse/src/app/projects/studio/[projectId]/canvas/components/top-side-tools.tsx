import { useCanvas } from "./canvas-context";
import { useState } from "react";
import ColorPalette from "./formatting/color-palette";

export default function TopSideTools() {
  const { canvas } = useCanvas();

  const [pencilWidth, setPencilWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(10);
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

  // Update Color
  const updateColor = (color) => {
    if (!canvas) return;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  return (
    <div className=" flex flex-row items-center justify-start bg-background shadow-md space-y-2 border h-full ">
           <ColorPalette onSelectColor={updateColor} />
 
      {/* Pencil & Eraser Width Controls */}
      <div className="flex space-x-2">
        <label>Pencil Width</label>
        <input
          type="range"
          min="1"
          max="20"
          value={pencilWidth}
          onChange={(e) => updateBrushWidth(parseInt(e.target.value), "pencil")}
        />
        <label>Eraser Width</label>
        <input
          type="range"
          min="5"
          max="50"
          value={eraserWidth}
          onChange={(e) => updateBrushWidth(parseInt(e.target.value), "eraser")}
        />
      </div>

      {/* Color Palette Component */}

      {/* Text Formatting */}
      <div className="flex space-x-2">
        <select onChange={(e) => setFontStyle(e.target.value)}>
          <option>Arial</option>
          <option>Courier New</option>
          <option>Georgia</option>
          <option>Times New Roman</option>
          <option>Verdana</option>
        </select>
        <input
          type="number"
          min="10"
          max="100"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        />
        <button onClick={() => setIsBold(!isBold)}>B</button>
        <button onClick={() => setIsItalic(!isItalic)}>I</button>
        <button onClick={() => setIsUnderline(!isUnderline)}>U</button>
      </div>
      
    </div>
  );
}
