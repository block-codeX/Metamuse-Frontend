import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import * as fabric from 'fabric';
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
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedBlendMode, setSelectedBlendMode] = useState<string | null>(
    null
  );
  const [canvas, setCanvas] = useState<any>(null);

  // Mock useCanvas hook implementation
  useEffect(() => {
    // In a real implementation, this would be provided by your useCanvas hook
    const { canvas } = window as any;
    if (canvas) {
      setCanvas(canvas);
    }
  }, []);

  const applyFilter = (filterName: string) => {
    setSelectedFilter(filterName);

    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;

    // Remove any existing filters
    activeObject.filters = [];

    // Apply the selected filter
    switch (filterName) {
      case "Grayscale":
        activeObject.filters.push(
          new (window as any).fabric.Image.filters.Grayscale()
        );
        break;
      case "Sepia":
        activeObject.filters.push(
          new (window as any).fabric.Image.filters.Sepia()
        );
        break;
      case "Invert":
        activeObject.filters.push(
          new (window as any).fabric.Image.filters.Invert()
        );
        break;
      case "Brightness":
        activeObject.filters.push(
          new (window as any).fabric.Image.filters.Brightness({
            brightness: 0.3,
          })
        );
        break;
      case "Contrast":
        activeObject.filters.push(
          new (window as any).fabric.Image.filters.Contrast({ contrast: 0.3 })
        );
        break;
    }

    // Apply the filters and render
    activeObject.applyFilters();
    canvas.renderAll();
  };

  const applyBlendMode = (blendMode: string) => {
    setSelectedBlendMode(blendMode);

    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;

    // Apply the blend mode
    activeObject.globalCompositeOperation = blendMode.toLowerCase();
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
        <div className="grid grid-cols-3 gap-3 space-x-3 mt-4">
          {filters.map((filter) => (
            <div
              key={filter.name}
              onClick={() => applyFilter(filter.name)}
              className={`relative w-18 h-18 p-1 mb-2 overflow-hidden border rounded cursor-pointer active:scale-95 transition-all duration-200 hover:bg-gray-50 ${
                selectedFilter === filter.name
                  ? "shadow-sm transform ring-1 ring-btn-primary"
                  : "bg-gray-50"
              }`}
            >
              {/* Preview thumbnail with filter applied */}
              <div
                className="absolute inset-0 flex flex-col items-center cursor-pointer justify-center border-none bg-transparent gap-2"
                style={{ filter: filter.preview }}
              >
                <Camera size={32} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  {filter.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="blendModes">
        <div className="grid grid-cols-3 gap-3 mt-4">
          {blendModes.map((mode) => (
            <div
              key={mode.name}
              onClick={() => applyBlendMode(mode.name)}
              className={`flex flex-col items-center p-2 border rounded cursor-pointer  active:scale-95 transition-all duration-200 hover:bg-gray-50 ${
                selectedBlendMode === mode.name
                  ? "shadow-sm transform ring-1 ring-btn-primary"
                  : "bg-gray-50"
              }`}
            >
              <div className="relative w-10 h-10 mb-2 overflow-hidden bg-white rounded border">
                {/* Preview thumbnail with blend mode applied */}
                <div className="absolute inset-0 bg-gray-200"></div>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-[#f0e0e1] opacity-70"
                  style={{ mixBlendMode: mode.preview as any }}
                >
                  <Camera size={32} className="text-gray-700" />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">
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
