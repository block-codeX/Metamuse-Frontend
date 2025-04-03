"use client";
import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

export default function CanvasGrid({ 
  enabled = false, 
  gridSize = 20,
  majorGridLine = 5, // How many grid lines before a major line
  gridColor = "rgba(200, 200, 200, 0.2)",
  majorGridColor = "rgba(180, 180, 180, 0.3)"
}) {
  const gridCanvasRef = useRef(null);
  const { 
    dimensions, 
    canvasRef, 
    scale = 1, 
    position = { x: 0, y: 0 }
  } = useCanvas();
  
  // Draw the grid
  const drawGrid = () => {
    if (!gridCanvasRef.current || !dimensions || !enabled) return;
    
    const canvas = gridCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Adjust grid size based on scale
    const scaledGridSize = gridSize * scale;
    
    // If the grid would be too dense, skip drawing
    if (scaledGridSize < 5) return;
    
    // Calculate the offset for the grid based on canvas position
    const offsetX = position.x % scaledGridSize;
    const offsetY = position.y % scaledGridSize;
    
    // Calculate visible range
    const startX = -Math.floor(width / scaledGridSize) * scaledGridSize;
    const startY = -Math.floor(height / scaledGridSize) * scaledGridSize;
    const endX = width * 2;
    const endY = height * 2;
    
    // Draw vertical grid lines
    for (let x = startX; x <= endX; x += scaledGridSize) {
      const pixelX = x + offsetX;
      
      // Determine if this is a major grid line
      const isMajor = Math.round((x / scaledGridSize) % majorGridLine) === 0;
      
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = startY; y <= endY; y += scaledGridSize) {
      const pixelY = y + offsetY;
      
      // Determine if this is a major grid line
      const isMajor = Math.round((y / scaledGridSize) % majorGridLine) === 0;
      
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.stroke();
    }
  };
  
  // Redraw grid when dimensions, scale, or position changes
  useEffect(() => {
    drawGrid();
  }, [dimensions, scale, position, enabled, gridSize, majorGridLine]);
  
  if (!enabled) return null;
  
  return (
    <canvas
      ref={gridCanvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}