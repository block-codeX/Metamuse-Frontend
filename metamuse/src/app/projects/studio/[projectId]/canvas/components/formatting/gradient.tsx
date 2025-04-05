import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanvas } from "../contexts/canvas-context";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";

const colors1 = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F1C40F",
    "#8E44AD",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F39C12",
    "#D35400",
    "#C0392B",
    "#2980B9",
]
const colors2 = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F1C40F",
    "#8E44AD",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F39C12",
    "#D35400",
    "#C0392B",
    "#2980B9",
]
const GradientFormatting: React.FC = () => {
  const { canvas, setGradientType, setAngle, setFromColor, setToColor, gradientType, fromColor, toColor, angle } =
    useCanvas();
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Gradient</h3>
      <div className="flex flex-col gap-2">
        <Select
          value={gradientType}
          onValueChange={(value) => setGradientType(value)}
        >
          <SelectTrigger className="p-1  w-full shadow-none">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear Gradient</SelectItem>
            <SelectItem value="radial">Radial Gradient</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium">Angle</label>
      </div>
      <Input
        type="number"
        value={angle}
        onChange={(e) => setAngle(parseInt(e.target.value))}
        max={360}
        className="w-full"
        placeholder="Angle"
      />
      <Label className="text-xs font-medium">From</Label>

      <div className="flex flex-row">
        <div className="flex flex-row gap-1 flex-wrap">
          {colors1.map((color) => (
            <span
              key={color}
              className="w-6 h-6 rounded-sm cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setFromColor(color)}
            ></span>
          ))}
        </div>
        <ColorPicker value={fromColor} onChange={(color) => setFromColor(color)} />
      </div>
      <Label className="text-xs font-medium">To</Label>
      <div className="flex flex-row">
        <div className="flex flex-row gap-1 flex-wrap">
          {colors2.map((color) => (
            <span
              key={color}
              className="w-6 h-6 rounded-sm cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setFromColor(color)}
            ></span>
          ))}
        </div>
        <ColorPicker value={toColor} onChange={(color) => setToColor(color)} />
      </div>
    </div>
  );
};
export default GradientFormatting;
