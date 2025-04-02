// src/components/canvas/CanvasOrientationSwitcher.tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvasOrientation } from "../hooks/orientation";

export const CanvasOrientationSwitcher = () => {
  const {
    currentPreset,
    customDimensions,
    unit,
    setUnit,
    applyPreset,
    updateCustomDimensions,
    presets
  } = useCanvasOrientation();

  return (
    <div className="flex gap-4 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {currentPreset.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {presets.map((preset) => (
            <DropdownMenuItem 
              key={preset.name}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentPreset.name === "Custom" && (
        <div className="flex gap-2">
          <Input
            type="number"
            value={customDimensions.width}
            onChange={(e) => updateCustomDimensions(
              Number(e.target.value),
              customDimensions.height
            )}
            placeholder="Width"
          />
          <Input
            type="number"
            value={customDimensions.height}
            onChange={(e) => updateCustomDimensions(
              customDimensions.width,
              Number(e.target.value)
            )}
            placeholder="Height"
          />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{unit.toUpperCase()}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setUnit("px")}>PX</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUnit("in")}>IN</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUnit("cm")}>CM</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};