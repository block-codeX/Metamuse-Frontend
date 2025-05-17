import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera, X } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../../contexts/canvas-context";
import { useCanvasSync } from "../../contexts/canvas-sync-context";
// fabric.FabricImage.filters.Sepia()

const filters = [
  { name: "Grayscale", preview: "grayscale(100%)" },
  { name: "Sepia", preview: "sepia(100%)" },
  { name: "Invert", preview: "invert(100%)" },
  { name: "Brightness", preview: "brightness(150%)" },
  { name: "Contrast", preview: "contrast(150%)" },
];

const blendModes = [
  { name: "Multiply", preview: "multiply" },
  { name: "Screen", preview: "screen" },
  { name: "Overlay", preview: "overlay" },
  { name: "Darken", preview: "darken" },
  { name: "Lighten", preview: "lighten" },
];

const PictureFormatting: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>("None");
  const [selectedBlendMode, setSelectedBlendMode] = useState<string | null>(
    "None"
  );
  const { canvas } = useCanvas();
  const { updateYjsObject} = useCanvasSync()
  const applyFilter = (filterName: string) => {
    setSelectedFilter(filterName);
    console.log("canv", canvas);
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    console.log("Active", activeObject);
    if (!activeObject || activeObject.type !== "image") return;
    console.log("DEaling with images", activeObject);

    // Remove any existing filters
    activeObject.filters = [];

    // Apply the selected filter
    switch (filterName) {
      case "Grayscale":
        activeObject.filters.push(new fabric.filters.Grayscale());
        break;
      case "Sepia":
        activeObject.filters.push(new fabric.filters.Sepia());
        break;
      case "Invert":
        activeObject.filters.push(new fabric.filters.Invert());
        break;
      case "Brightness":
        activeObject.filters.push(
          new fabric.filters.Brightness({
            brightness: 0.3,
          })
        );
        break;
      case "Contrast":
        activeObject.filters.push(
          new fabric.filters.Contrast({ contrast: 0.3 })
        );
        break;
      case "None" :
        activeObject.filters = []
        break;
    }

    // Apply the filters and render
    activeObject.applyFilters();
    updateYjsObject(activeObject)
    canvas.renderAll();
  };

  const applyBlendMode = (blendMode: string) => {
    setSelectedBlendMode(blendMode);

    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;

    // Apply the blend mode
    activeObject.globalCompositeOperation = blendMode.toLowerCase();
    updateYjsObject(activeObject)
    canvas.renderAll();
  };

  return (
    <Tabs defaultValue="filters">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="filters" className="w-1/2">
          Filters
        </TabsTrigger>
        <TabsTrigger value="blendModes" className="w-1/2">
          Blend Modes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="filters">
        <div
          onClick={() => applyFilter("None")}
          className={`w-13 h-13 border flex flex-row items-center justify-center border rounded cursor-pointer active:scale-95 bg-background/10 transition-all duration-200 hover:bg-background/90 ${
            selectedFilter === "None"
              ? "shadow-sm transform ring-1 ring-secondary"
              : "bg-background/10"
          }`}
        >
          <X size={72} strokeWidth={1} />
        </div>
        <div className="grid grid-cols-3 gap-3 space-x-3 mt-4">
          {filters.map((filter) => (
            <div
              key={filter.name}
              onClick={() => applyFilter(filter.name)}
              className={`relative w-18 h-18 p-1 mb-2 overflow-hidden border rounded cursor-pointer active:scale-95 bg-background/10 transition-all duration-200 hover:bg-background/90 ${
                selectedFilter === filter.name
                  ? "shadow-sm transform ring-1 ring-secondary"
              : "bg-background/10"
              }`}
            >
              {/* Preview thumbnail with filter applied */}
              <div
                className="absolute inset-0 flex flex-col items-center cursor-pointer justify-center border-none bg-transparent gap-2"
                style={{ filter: filter.preview }}
              >
                <Camera size={32} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300" >
                  {filter.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="blendModes">
      <div
          onClick={() => applyBlendMode("None")}
          className={`w-13 h-13 border flex flex-row items-center justify-center border rounded cursor-pointer active:scale-95 bg-background/10 transition-all duration-200 hover:bg-background/90 ${
            selectedBlendMode === "None"
              ? "shadow-sm transform ring-1 ring-secondary"
              : "bg-background/10"
          }`}
        >
          <X size={72} strokeWidth={1} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {blendModes.map((mode) => (
            <div
              key={mode.name}
              onClick={() => applyBlendMode(mode.name)}
              className={`flex flex-col items-center p-2 border rounded cursor-pointer  active:scale-95 bg-background/10 transition-all duration-200 hover:bg-background/90 ${
                selectedBlendMode === mode.name
                  ? "shadow-sm transform ring-1 ring-secondary"
              : "bg-background/10"
              }`}
            >
              <div className="relative w-10 h-10 mb-2 overflow-hidden bg-white rounded border">
                {/* Preview thumbnail with blend mode applied */}
                <div className="absolute inset-0 bg-background/90"></div>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-[#f0e0e1] opacity-70"
                  style={{ mixBlendMode: mode.preview as any }}
                >
                  <Camera size={32} className="text-gray-700" />
                </div>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {mode.name}
              </span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PictureFormatting;
