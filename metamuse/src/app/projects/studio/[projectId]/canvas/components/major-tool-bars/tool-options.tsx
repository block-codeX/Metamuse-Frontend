import { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming shadcn/ui utility
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Assuming shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvas } from "../contexts/canvas-context";
import { ArrowDownRight, ChevronDown, Triangle } from "lucide-react"; // Import the dropdown icon

// Interface definitions remain the same
interface Tool {
  icon: React.ReactNode;
  toolName: string;
  function: (...args: any[]) => void;
  function_args: any[];
}
interface IToolOption {
  tools: Tool[];
  group: string;
  current: string; // Currently active group identifier from parent
  use: (group: string) => void; // Function to set active group in parent
}

export default function ToolOption({
  tools,
  group,
  current,
  use,
}: IToolOption) {
  const [activeTool, setActiveTool] = useState<Tool>(tools[0]);
  const { canvas } = useCanvas();
  // State to control the popover visibility
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const clearCanvasEvents = () => {
    if (!canvas) return;
    // Basic cleanup (same as before)
    canvas.isDrawingMode = false;
    canvas.defaultCursor = "default";
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:over");
    canvas.off("mouse:out");
    canvas.selection = true;
    canvas.forEachObject((obj) => (obj.selectable = true));
  };

  // Activates the given tool's logic
  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool); // Update the displayed icon on the main button
    clearCanvasEvents();
    tool.function(...tool.function_args);
    use(group); // Notify parent that this group is now active
    console.log("Active", tool.toolName);
  };

  // Handles selecting a tool *from the popover*
  const selectToolFromPopover = (tool: Tool) => {
    handleToolClick(tool); // Activate the tool's functionality
    setIsPopoverOpen(false); // Close the popover after selection
  };

  if (!activeTool) {
    return null; // Render nothing if no tools provided
  }

  return (
    // Container div to group the two buttons and apply overall highlight/styling
    <div
      className={cn(
        "relative w-8 h-8 shadow-md p-0", // Group styling like a single unit
        // Apply active group highlight to the container
        group === current
          ? "bg-btn-primary dark:bg-btn-primary text-white"
          : "bg-background",
        "overflow-hidden" // Ensures border-radius clips internal elements properly
      )}
    >
      {/* Button 1: Main Tool Activation (Icon Area) */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              // No border radius on the right side to merge visually
              className={cn(
                "flex items-center rounded-none justify-center w-full h-full m-0 p-0", // Adjust padding as needed
                // Different hover style based on whether the group is active
                group === current
                  ? "hover:bg-btn-primary/90 hover:text-white"
                  : "hover:bg-accent"
              )}
              onClick={() => {
                // Clicking this button DIRECTLY activates the currently displayed tool
                handleToolClick(activeTool);
              }}
            >
              {activeTool.icon}
            </Button>
          </TooltipTrigger>
          {/* Tooltip showing the name of the currently active tool */}
          <TooltipContent side="right">
            <p>{activeTool.toolName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Button 2: Popover Trigger (Chevron Area) */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* The PopoverTrigger is ONLY this small button */}
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "absolute bottom-[2px] right-[2px] cursor-pointer", // Positioning and cursor
                    "w-0 h-0", // Base dimensions for border trick
                    // Define border widths - equal widths create a 45-degree angle hypotenuse
                    // Adjust size as needed (e.g., 6px forms a 6x6 corner triangle)
                    "border-t-[5px]",
                    "border-l-[5px]",
                    "border-b-[5px]",
                    current === group ? "border-b-white border-r-white" : "border-b-btn-primary border-r-btn-primary",
                    "border-r-[5px]",
                    // Set adjacent borders transparent, the other two colored
                    "border-t-transparent", // Top border is transparent
                    "border-l-transparent", // Left border is transparent
                    "hover:opacity-80" // Add slight hover effect
                  )}
                  // No onClick needed here, PopoverTrigger handles opening
                />
              </PopoverTrigger>
            </TooltipTrigger>
            {/* Tooltip indicating more options */}
            <TooltipContent side="right">
              <p>More {group} tools</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Popover Content: Shows all tools */}
        <PopoverContent
          side="right"
          align="center"
          className="p-1 bg-white dark:bg-gray-800 rounded-md shadow-lg w-auto h-auto"
        >
          <div className="flex flex-row gap-1">
            {tools.map((tool, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center justify-center w-8 h-8 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
                        // Highlight the tool in the popover if it matches the main active one
                        tool.toolName === activeTool.toolName &&
                          "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => {
                        // Selects the tool AND closes the popover
                        selectToolFromPopover(tool);
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
    </div>
  );
}
