import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCanvas } from "./canvas-context";

interface Tool {
  icon: React.ReactNode;
  toolName: string;
  function: (...args: any[]) => void;
  function_args: any[];
}

export default function ToolOption({ tools }: { tools: Tool[] }) {
  const [activeTool, setActiveTool] = useState<Tool | null>(tools[0]);
  const { canvas } = useCanvas();

  const clearCanvasEvents = () => {
    if (!canvas) return;
    
    canvas.isDrawingMode = false;  // Disable drawing mode
    canvas.defaultCursor = "default";
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:over");
    canvas.off("mouse:out");
  };

  const handleToolClick = (tool: Tool) => {
    clearCanvasEvents();  // Ensure previous tool doesn't interfere
    tool.function(...tool.function_args);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center justify-center h-10 p-2 rounded-md"
              >
                <span className="p-2 rounded-md cursor-pointer bg-background shadow-md">
                  {activeTool?.icon}
                </span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          
          <PopoverContent side="right" align="center" className="p-1 bg-white dark:bg-gray-800 rounded-md shadow-lg w-auto h-auto">
            <div className="flex flex-row gap-2">
              {tools.map((tool, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center justify-center w-7 h-7 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
                          tool.toolName === activeTool?.toolName && "bg-gray-300 dark:bg-gray-600"
                        )}
                        onClick={() => {
                          setActiveTool(tool);
                          handleToolClick(tool);
                        }}
                      >
                        {tool.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{tool.toolName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
}


