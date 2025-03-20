"use client";
import { useCanvas } from "./contexts/canvas-context";
import CanvasContextMenu from "./right-click-menu";
import { useDeleteTool } from "./tools/delete-tool";

export default function CanvasComponent() {
  const { canvasRef } = useCanvas();
  useDeleteTool();

  return (
    <div className="relative w-full h-full">
      <CanvasContextMenu>
        <canvas ref={canvasRef} className="w-full h-full" />
      </CanvasContextMenu>
    </div>
  );
}
