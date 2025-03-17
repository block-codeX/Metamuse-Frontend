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
    <div className=" bg-background flex space-x-4 w-[90%] flex flex-row justify-end h-[40px] items-center">
      <div className="flex flex-row items-center justify-start space-x-1 p-2 px-4">
        <input
          type="text"
          value={`${Math.round(zoom * 500)}%`}
          className="border text-[14px] text-gray-600 w-[50px] outline-none text-center"
          readOnly
        />
        <ZoomIn strokeWidth={1} className="cursor-pointer" onClick={() => handleZoom(true)} />
            <span className="bg-gray-800 rounded-[30px] h-1 w-9"></span>
        <ZoomOut strokeWidth={1} className="cursor-pointer" onClick={() => handleZoom(false)} />
      </div>
    </div>
  );
}
