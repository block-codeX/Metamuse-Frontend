"use client";
import { useCanvas } from "./canvas-context";
import { useDeleteTool } from "./tools/delete-tool";

export default function CanvasComponent() {
  const { canvasRef } = useCanvas();
  useDeleteTool()

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
