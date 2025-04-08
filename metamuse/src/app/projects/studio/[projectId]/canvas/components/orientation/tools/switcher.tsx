// src/components/canvas/CanvasOrientationSwitcher.tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvasOrientation } from "../hooks/orientation";
import { Label } from "@/components/ui/label";
import { useCanvas } from "../../contexts/canvas-context";

export const CanvasOrientationSwitcher = () => {
  const {
    currentPreset,
    customDimensions,
    unit,
    setUnit,
    applyPreset,
    updateCustomDimensions,
    presets,
  } = useCanvasOrientation();
  const { preset } = useCanvas()

  const calculateAspectRatio = () => {
    const { width, height } = currentPreset.dimensions;
    if (height === 0) {
      return 1; // Avoid division by zero, default to square
    }
    return width / height;
  };

  const aspectRatio = calculateAspectRatio();
  return (
    <div className="flex flex-row gap-2 px-5 h-full items-center h-full border-r">
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          className="h-5 bg-white border border-gray-400" // Fixed height (h-5 = 20px), basic styling
          style={{
            aspectRatio: aspectRatio, // Apply calculated aspect ratio
            // Add max width to prevent it getting too wide for landscape ratios
            maxWidth: "28px", // Adjust as needed
          }}
          title={`Aspect Ratio: ${aspectRatio.toFixed(2)}`} // Tooltip for info
        >
          {/* Content inside is optional, it's just for visual shape */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-7 rounded-none  w-20 truncate-text justify-start p-1 overflow-x-auto cursor-pointer">
              {currentPreset.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none">
            {presets.map((preset) => (
              <DropdownMenuItem
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{ backgroundColor: currentPreset.name == preset.name? "gray-100": "inherit" }}
              >
                {preset.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col items-center justify-center w-30 gap-2">
        <Label className={`flex flex-row gap-2 items-center ${preset !== "Custom" ? "text-gray-400": "text-pri"} justify-between`}>
          <span className="w-10">Width:</span>
          <Input
            type="number"
            value={customDimensions.width}
            onChange={(e) =>
              updateCustomDimensions(
                Number(e.target.value),
                customDimensions.height
              )
            }
            placeholder="Width"
            className="h-6 px-1 focus:ring-none rounded-sm"
            disabled={preset!=="Custom"}
          />
        </Label>
        <Label className={`flex flex-row gap-2 ${preset !== "Custom" ? "text-gray-400": "text-pri"} items-center justify-between`}>
          <span className="w-10">Height:</span>
          <Input
            type="number"
            value={customDimensions.height}
            onChange={(e) =>
              updateCustomDimensions(
                customDimensions.width,
                Number(e.target.value)
              )
            }
            placeholder="Height"
            disabled={preset!=="Custom"}
            className="h-6 px-1 focus:ring-none rounded-sm"
          />
        </Label>
      </div>
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{unit.toUpperCase()}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setUnit("px")}>PX</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUnit("in")}>IN</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUnit("cm")}>CM</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
};
