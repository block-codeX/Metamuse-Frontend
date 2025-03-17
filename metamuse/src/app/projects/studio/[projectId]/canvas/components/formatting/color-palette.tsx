import { Droplet, Palette } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ColorPalette({ onSelectFore, onSelectBack }) {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [colors, setColors] = useState<string[]>([]);
  const [activeDroplet, setActiveDroplet] = useState<
    "foreground" | "background"
  >("foreground");
  const [foregroundColor, setForegroundColor] = useState("#ff0000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const generatedColors = generateColors();
    setColors(generatedColors);
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (activeDroplet === "foreground") {
      setForegroundColor(color);
      onSelectFore(color);
    } else {
      setBackgroundColor(color);
      onSelectBack(color);
    }
  };

  const generateColors = () => {
    return [
      "#FF0000",
      "#00FF00",
      "#0000FF", // Primary colors
      "#FFFF00",
      "#FF00FF",
      "#00FFFF", // Secondary colors
      "#800000",
      "#808000",
      "#008000",
      "#800080",
      "#808080",
      "#000080", // Tertiary colors
      "#000000",
      "#FFFFFF",
      "#C0C0C0", // Black, White, Gray
      "#FFA500",
      "#A52A2A",
      "#8A2BE2", // Additional colors
    ];
  };

  return (
    <div
      ref={containerRef}
      className="mx-2 flex flex-row items-center justify-start space-x-2 h-full border-r border-gray-400"
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Droplet
          className={` flex items-center justify-center border rounded-full cursor-pointer ${
            activeDroplet === "foreground" ? "ring-1 ring-gray-400" : ""
          }`}
          size={activeDroplet === "foreground" ? 32 : 24}
          fill={foregroundColor}
          strokeWidth={0.5}
          onClick={() => setActiveDroplet("foreground")}
        />
        <Droplet
          className={`flex items-center justify-center border rounded-full cursor-pointer ${
            activeDroplet === "background" ? "ring-1 ring-gray-400" : ""
          }`}
          size={activeDroplet === "background" ? 32 : 24}
          fill={backgroundColor}
          strokeWidth={0.5}
          onClick={() => setActiveDroplet("background")}
        />
      </div>
      {/* Generated Colors */}
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-4 h-4 border border-gray-600 cursor-pointer rounded-full ${
              selectedColor === color ? "ring-2 ring-gray-600" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>
      {/* Custom Color Picker */}
      <button
        className="w-8 h-14 flex items-center justify-center border rounded-md shadow-md cursor-pointer"
        onClick={() => colorInputRef.current?.click()}
        style={{
            background: "linear-gradient(to right, red, orange, green, indigo, violet)",
        }}
      ></button>
      <input
        type="color"
        ref={colorInputRef}
        className="hidden"
        value={selectedColor}
        onChange={(e) => handleColorChange(e.target.value)}
      />
    </div>
  );
}
