import { useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Brush, Eraser, ChevronDown } from "lucide-react";

const WIDTH_OPTIONS = [1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72];

export default function Strokes() {
  const { pencilWidth, setPencilWidth, eraserWidth, setEraserWidth  } = useCanvas();

  return (
    <div className="flex gap-2 grid grid-cols-2 w-full pr-1">
      {/* Pencil Popover */}
      <Popover>
        <PopoverTrigger className="p-2 h-7 rounded-none border border-gray-300 flex items-center space-x-2">
          <Brush size={20} />
          <span>{`${pencilWidth}px`}</span>
          <ChevronDown size={16} />
        </PopoverTrigger>
        <PopoverContent className=" p-2 flex flex-col space-y-2">
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
        <PopoverTrigger className="p-2 h-7 rounded-none border border-gray-300 flex items-center space-x-2">
          <Eraser size={20} />
          <span>{`${eraserWidth}px`}</span>
          <ChevronDown size={16} />
        </PopoverTrigger>
        <PopoverContent className=" p-2 flex flex-col space-y-2">
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
  );
}