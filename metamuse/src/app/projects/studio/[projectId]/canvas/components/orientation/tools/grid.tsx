"use client";
import { useEffect, useRef } from "react";
import { useCanvas } from "../../contexts/canvas-context";

const GRID_SIZE_OPTIONS = [10, 20, 50, 100]; // Grid size options in pixels

export default function GridLines({ visible = true, gridSize = 20, color = "#e0e0e0" }) {
  const gridCanvasRef = useRef(null);
  const { dimensions, canvasRef } = useCanvas();
  
  useEffect(() => {
    if (!gridCanvasRef.current || !visible || !dimensions) return;
    
    const gridCanvas = gridCanvasRef.current;
    const ctx = gridCanvas.getContext("2d");
    
    // Set canvas size to match the main canvas
    gridCanvas.width = dimensions.width;
    gridCanvas.height = dimensions.height;
    
    // Clear previous grid
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    
    // Draw grid
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= gridCanvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridCanvas.height);
      
      // Make every 5th line slightly darker
      if (x % (gridSize * 5) === 0) {
        ctx.strokeStyle = "#c0c0c0";
        ctx.lineWidth = 0.8;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
      }
      
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= gridCanvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridCanvas.width, y);
      
      // Make every 5th line slightly darker
      if (y % (gridSize * 5) === 0) {
        ctx.strokeStyle = "#c0c0c0";
        ctx.lineWidth = 0.8;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
      }
      
      ctx.stroke();
    }
  }, [dimensions, visible, gridSize, color]);
  
  // Position grid canvas behind the main canvas
  return (
    <canvas
      ref={gridCanvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ 
        visibility: visible ? "visible" : "hidden",
        zIndex: -1
      }}
    />
  );
}

// Custom hook for grid snap functionality
export function useGridSnap(gridSize = 20, enabled = false) {
  const { canvasRef } = useCanvas();
  
  useEffect(() => {
    if (!canvasRef.current || !enabled) return;
    
    const canvas = canvasRef.current;
    
    // Get Fabric.js canvas instance
    const fabricCanvas = canvas.fabric;
    if (!fabricCanvas) return;
    
    // Enable snapping to grid
    fabricCanvas.on('object:moving', function(options) {
      const target = options.target;
      
      // Snap to grid when moving
      if (target) {
        target.set({
          left: Math.round(target.left / gridSize) * gridSize,
          top: Math.round(target.top / gridSize) * gridSize
        });
      }
    });
    
    // Clean up event listener
    return () => {
      fabricCanvas.off('object:moving');
    };
  }, [canvasRef, gridSize, enabled]);
  
  return { gridSize, GRID_SIZE_OPTIONS };
}