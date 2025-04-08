import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCanvas } from "../../contexts/canvas-context";
import * as fabric from "fabric";
import { Blend, Box, RectangleEllipsis, SlidersHorizontal, SlidersHorizontalIcon, Square } from "lucide-react";
export default function OutlineFilters() {
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
    <div className="flex flex-col items-start border-r h-full justify-evenly p-2 has-[>svg]:px-0">
    <Popover>
      <PopoverTrigger asChild>
        <div  className="font-normal px-1 flex active:scale-98 transition-ease-200 cursor-pointer active:bg-whitesmoke active:rounded-sm gap-1 items-center flex-row  justify-start ">
          <Square size={16} strokeWidth={1}/>
          <span className="text-[14px]">Outline</span>
        </div>
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
    <Popover>
      <PopoverTrigger asChild>
        <div  className="w-full font-normal px-1 flex active:scale-98 transition-ease-200 cursor-pointer active:bg-whitesmoke active:rounded-sm gap-1 items-center flex-row  justify-start ">
          <Blend size={16} strokeWidth={1}/>
          <span className="text-[14px]">Blend</span>
        </div>
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
    <Popover>
      <PopoverTrigger asChild>
        <div  className="w-full font-normal px-1 flex active:scale-98 transition-ease-200 cursor-pointer active:bg-whitesmoke active:rounded-sm gap-1 items-center flex-row  justify-start ">
          <SlidersHorizontalIcon size={16} strokeWidth={1}/>
          <span className="text-[14px]">Filters</span>
        </div>
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
    </div>
  );
}
