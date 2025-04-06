import { useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brush, Eraser, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WIDTH_OPTIONS = [
  1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72,
];

export default function Strokes() {
  const { pencilWidth, setPencilWidth, eraserWidth, setEraserWidth } =
    useCanvas();

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
          <span className="w-10">Width:</span>
          <Input
            type="number"
            className="h-6 px-1 focus:ring-none rounded-sm"
          />
        </Label>
        <Label className="flex flex-row gap-2 items-center justify-between">
          <span className="w-10">Height:</span>
          <Input
            type="number"
            className="h-6 px-1 focus:ring-none rounded-sm"
          />
        </Label>
      </div>
    </div>
  );
}
