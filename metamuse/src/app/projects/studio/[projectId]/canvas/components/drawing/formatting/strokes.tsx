import { useEffect, useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Brush,
  Eraser,
  ChevronDown,
  SprayCan,
  PaintbrushIcon,
  Circle,
  Pencil,
  Ghost,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const WIDTH_OPTIONS = [
  1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72,
];
const BRUSH_OPTIONS = {
  pencil: Pencil,
  brush: Brush,
  spray: SprayCan,
  pattern: PaintbrushIcon,
  circle: Circle,
};

export default function Strokes() {
  const {
    pencilWidth,
    setPencilWidth,
    eraserWidth,
    setEraserWidth,
    activeObjDimensions,
    setActiveObjDimensions,
    brushType,
    foregroundColor,
    setBrushType,
  } = useCanvas();
  const [width, setWidth] = useState(activeObjDimensions.width);
  const [height, setHeight] = useState(activeObjDimensions.height);
  const [fromUs, setFromUs] = useState(true);
  const [objType, setObjType] = useState("");
  useEffect(() => {
    if (fromUs) {
      setFromUs(false);
      return;
    }
    setObjType(activeObjDimensions.objType);
    setWidth(activeObjDimensions.width);
    setHeight(activeObjDimensions.height);
    console.log("Width", width, "height", height, objType);
  }, [activeObjDimensions]);
  useEffect(() => {
    const res = { width, height, objType };
    setFromUs(true);
    setActiveObjDimensions(res);
  }, [width, height]);
  return (
    <div className="flex flex-row gap-2 px-2 h-full items-center h-full border-r">
      {/* Pencil Popover */}
      <div className="flex flex-col items-center p-0 justify-center w-30 gap-2">
        <Popover>
          <PopoverTrigger className="p-2 h-7 w-25 rounded-none border border-gray-300 flex items-center space-x-2">
            <Brush size={20} />
            <span>{`${pencilWidth}px`}</span>
            <ChevronDown size={16} />
          </PopoverTrigger>
          <PopoverContent className="rounded-none w-25 h-90 overflow-auto p-2 flex flex-col space-y-2">
            {/* Width Selection */}
            <div className="flex flex-col space-y-1">
              {WIDTH_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={`p-2 rounded-md text-left ${
                    size === pencilWidth ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setPencilWidth(size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Eraser Popover */}
        <Popover>
          <PopoverTrigger className="p-2 h-7 w-25  rounded-none border border-gray-300 flex items-center space-x-2">
            <Eraser size={20} />
            <span>{`${eraserWidth}px`}</span>
            <ChevronDown size={16} />
          </PopoverTrigger>
          <PopoverContent className=" rounded-none w-25 h-90 overflow-auto p-2 flex flex-col space-y-2">
            {/* Width Selection */}
            <div className="flex flex-col space-y-1">
              {WIDTH_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={`p-2 rounded-md text-left ${
                    size === eraserWidth ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setEraserWidth(size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center justify-center w-30 gap-2">
        <Label className="flex flex-row gap-2 items-center justify-between">
          <span
            className={`w-10 ${objType == "" ? "text-gray-400" : "text-pri"}`}
          >
            Width:
          </span>
          <Input
            type="number"
            className="h-6 px-1 focus:ring-none rounded-sm"
            disabled={objType == ""}
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </Label>
        <Label className="flex flex-row gap-2 items-center justify-between">
          <span
            className={`w-10 ${objType == "" ? "text-gray-400" : "text-pri"}`}
          >
            Height:
          </span>
          <Input
            type="number"
            className="h-6 px-1 focus:ring-none rounded-sm"
            disabled={objType == ""}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </Label>
      </div>
      <Popover>
        <PopoverTrigger className="p-2 h-16 w-10 cursor-pointer active:scale-95 transition-scale transition-200 rounded-md shadow-sm border border-gray-300 flex items-center space-x-2">
          {(() => {
            const IconComponent = BRUSH_OPTIONS[brushType as "pencil"];
            return <IconComponent fill={foregroundColor} color={"gray"} strokeWidth={1} />;
          })()}
        </PopoverTrigger>
        <PopoverContent className=" rounded-none w-25  overflow-auto p-2 flex flex-col space-y-2">
          {/* Width Selection */}
          <div className="flex flex-col space-y-1">
            {Object.keys(BRUSH_OPTIONS).map((key) => {
              const IconComponent = BRUSH_OPTIONS[key as "pencil"];
              return (
                <Button
                  variant={"ghost"}
                  key={key}
                  className={`p-2 justify-start rounded-md text-left ${
                    brushType == key ? "bg-gray-200" : "hover:bg-gray-100"
                  } active:scale-95 cursor-pointer`}
                  onClick={() => setBrushType(key)}
                >
                  <IconComponent size={18} /> {key}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
