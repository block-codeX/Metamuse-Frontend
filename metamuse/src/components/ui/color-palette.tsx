import { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { SketchPicker } from "react-color";

export default function ColorPalette({ onSelectColor }: { onSelectColor: (color: string) => void }) {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [colors, setColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const generatedColors = generateColors(width);
      setColors(generatedColors);
    }
  }, [containerRef.current]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onSelectColor(color);
  };

  const generateColors = (width: number) => {
    const numColors = Math.floor(width / 20); // Adjust the divisor to control the number of colors
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i / numColors) * 360; // Hue value between 0 and 360
      const color = `hsl(${hue}, 100%, 50%)`; // Full saturation and 50% lightness
      colors.push(color);
    }
    return colors;
  };

  return (
    <div ref={containerRef} className="flex flex-row items-center justify-start space-x-2">
      <button
        className="w-8 h-8 flex items-center justify-center border rounded-full bg-white shadow-md"
        onClick={() => setShowColorPicker(!showColorPicker)}
        style={{ backgroundColor: selectedColor }}
      >
        <Palette size={20} fill={selectedColor} strokeWidth={1} />
      </button>
      {showColorPicker && (
        <div className="absolute z-10">
          <SketchPicker
            color={selectedColor}
            onChangeComplete={(color) => handleColorChange(color.hex)}
          />
        </div>
      )}
      {/* Generated Colors */}
      {colors.map((color) => (
        <div
          key={color}
          className={`w-5 h-5 border cursor-pointer rounded-full ${
            selectedColor === color ? "ring-2 ring-primary" : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => handleColorChange(color)}
        />
      ))}
    </div>
  );
}