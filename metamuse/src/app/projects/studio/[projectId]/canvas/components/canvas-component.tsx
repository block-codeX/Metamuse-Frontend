"use client";
import { useCanvas } from "./contexts/canvas-context";
import CanvasContextMenu from "./right-click-menu";
import { useKeyBindingTools } from "./tools/delete-tool";
import { useEffect } from "react";

export default function CanvasComponent() {
  const { canvasRef } = useCanvas();
  useKeyBindingTools();

  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      if (canvasRef.current) {
        // Clear any event listeners
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);

        // If you have any canvas-specific cleanup in your context
        // Call it here: cleanupCanvasContext();
      }
    };
  }, [canvasRef]);

  return (
    <div className="canvas-container relative">
      <CanvasContextMenu>
        {" "}
        <canvas ref={canvasRef} className="w-full h-full" />
      </CanvasContextMenu>
    </div>
  );
}
