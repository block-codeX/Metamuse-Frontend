import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCanvas } from "../canvas-context";
import * as fabric from "fabric";
export default function ImageEditor() {
  const { canvas } = useCanvas();

  // Apply Filters
  const applyFilter = (filterType) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;

    let filter;
    switch (filterType) {
      case "grayscale":
        filter = new fabric.FabricImage.filters.Grayscale();
        break;
      case "sepia":
        filter = new fabric.FabricImage.filters.Sepia();
        break;
      case "invert":
        filter = new fabric.FabricImage.filters.Invert();
        break;
      case "brightness":
        filter = new fabric.FabricImage.filters.Brightness({ brightness: 0.2 });
        break;
      case "contrast":
        filter = new fabric.FabricImage.filters.Contrast({ contrast: 0.3 });
        break;
      default:
        return;
    }

    activeObject.filters.push(filter);
    activeObject.applyFilters();
    canvas.renderAll();
  };

  // Apply Blend Modes
  const applyBlendMode = (mode) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    
    activeObject.globalCompositeOperation = mode;
    canvas.renderAll();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit Image</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <h3 className="text-lg font-bold">Filters</h3>
          {["grayscale", "sepia", "invert", "brightness", "contrast"].map((filter) => (
            <Button key={filter} variant="ghost" onClick={() => applyFilter(filter)}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
          <h3 className="text-lg font-bold mt-2">Blend Modes</h3>
          {["multiply", "screen", "overlay", "darken", "lighten"].map((mode) => (
            <Button key={mode} variant="ghost" onClick={() => applyBlendMode(mode)}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
