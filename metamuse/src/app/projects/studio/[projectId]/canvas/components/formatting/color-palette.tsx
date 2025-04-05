import { ColorPicker } from "@/components/ui/color-picker";
import { Droplet, Palette, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ColorPaletteProps {
  onSelectFore: (color: string) => void;
  onSelectBack: (color: string) => void;
}
const ColorPalette: React.FC<ColorPaletteProps> = ({
  onSelectFore,
  onSelectBack,
}) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [cls, setCls] = useState("#000000");
  const [colors, setColors] = useState<string[]>([]);
  const [activeDroplet, setActiveDroplet] = useState<
    "foreground" | "background"
  >("foreground");
  const [foregroundColor, setForegroundColor] = useState("#000000");
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
      className="flex flex-col items-center justify-start space-y-2 h-full"
    >
      <div className="flex flex-row items-center gap-1 justify-between py-2 border-b">
        <ColorPicker
          onChange={(v) => {
            setSelectedColor(v);
            setForegroundColor(v);
            setCls(v);
            onSelectFore(v);
          }}
          value={cls}
        />
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
      </div>

      {/* Generated Colors */}
      <div className="grid grid-cols-2 flex-wrap items-center justify-center gap-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 border border-gray-600 rounded-md cursor-pointer ${
              selectedColor === color ? "ring-2 ring-gray-500" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
        <div
          className={`w-6 h-6 border border-gray-600 p-0 flex items-center justify-center rounded-md cursor-pointer ${
            selectedColor === "transparent" ? "ring-2 ring-gray-500" : ""
          }`}
          style={{ backgroundColor: "transparent" }}
          onClick={() => handleColorChange("transparent")}
        >
          <X strokeWidth={1} size={28}/>
        </div>
      </div>
    </div>
  );
};
export default ColorPalette;
