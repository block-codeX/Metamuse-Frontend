import { useState, useRef } from "react";
import { useCanvas } from "../../contexts/canvas-context";

// hooks/useZoomPan.ts
export const useZoomPan = () => {
    const { canvas } = useCanvas();
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
  
    const handleZoom = (delta: number, point: { x: number; y: number }) => {
      if (!canvas) return;
      
      const newZoom = zoomLevel * delta;
      canvas.zoomToPoint({ x: point.x, y: point.y } as any, newZoom);
      setZoomLevel(newZoom);
    };
  
    // Add reset to fit-to-screen
    const resetToFit = () => {
      if (!canvas) return;
      const container = document.querySelector('.canvas-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Same calculation as fitCanvasToContainer
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scale = Math.min(
          containerWidth / canvasWidth,
          containerHeight / canvasHeight
        ) * 0.9;
        
        const offsetX = (containerWidth - canvasWidth * scale) / 2;
        const offsetY = (containerHeight - canvasHeight * scale) / 2;
        
        canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
        setZoomLevel(scale);
      }
    };
  
    return {
      zoomLevel,
      handleZoom,
      resetToFit,
      // ... rest of panning logic ...
    };
  };