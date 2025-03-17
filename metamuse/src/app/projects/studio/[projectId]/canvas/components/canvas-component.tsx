"use client";
import { useCanvas } from "./canvas-context";

export default function CanvasComponent() {
  const { canvasRef } = useCanvas();

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
