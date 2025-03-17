import { ZoomIn, ZoomOut } from "lucide-react";
import { useCanvas } from "./canvas-context";
import { useState } from "react";

export default function FooterTools() {
  const { canvas } = useCanvas();
  const [zoom, setZoom] = useState(1);

  const handleZoom = (zoomIn: boolean) => {
    if (!canvas) return;
    let newZoom = zoomIn ? zoom + 0.1 : zoom - 0.1;
    newZoom = Math.max(0.2, Math.min(newZoom, 5));
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background flex space-x-4 border w-[90%] flex flex-row justify-end h-[40px] items-center">
      <div className="flex flex-row items-center justify-start space-x-2 p-2">
        <input
          type="text"
          value={`${Math.round(zoom * 100)}%`}
          className="border text-[14px] text-gray-600 w-[60px] outline-none text-center"
          readOnly
        />
        <ZoomIn className="cursor-pointer" onClick={() => handleZoom(true)} />
        <ZoomOut className="cursor-pointer" onClick={() => handleZoom(false)} />
      </div>
    </div>
  );
}
