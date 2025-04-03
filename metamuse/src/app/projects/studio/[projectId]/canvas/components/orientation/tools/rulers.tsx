"use client";
import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

// Constants
const RULER_SIZE = 20; // Width/height of rulers in pixels
const TICK_INTERVALS = [5, 10, 25, 50, 100, 200, 500]; // Possible tick intervals
const MAJOR_INTERVAL_FACTOR = 10; // Major tick every X minor ticks

export default function Rulers({ 
  visible = true, 
  color = "#333333", 
  backgroundColor = "#f5f5f5",
  scale = 1, 
  offset = { x: 0, y: 0 } 
}) {
  const horizontalRulerRef = useRef(null);
  const verticalRulerRef = useRef(null);
  const cornerBoxRef = useRef(null);
  const { dimensions, canvasRef } = useCanvas();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Calculate appropriate tick interval based on scale
  const getTickInterval = (scale) => {
    // Find the first interval that gives enough space between ticks when scaled
    const minPixelsBetweenTicks = 10;
    return TICK_INTERVALS.find(interval => interval * scale > minPixelsBetweenTicks) || TICK_INTERVALS[TICK_INTERVALS.length - 1];
  };
  
  // Draw the rulers
  useEffect(() => {
    if (!horizontalRulerRef.current || !verticalRulerRef.current || !dimensions || !visible) return;
    
    const hRuler = horizontalRulerRef.current;
    const vRuler = verticalRulerRef.current;
    const hCtx = hRuler.getContext("2d");
    const vCtx = vRuler.getContext("2d");
    
    // Set canvas sizes
    hRuler.width = dimensions.width;
    hRuler.height = RULER_SIZE;
    vRuler.width = RULER_SIZE;
    vRuler.height = dimensions.height;
    
    // Clear previous drawings
    hCtx.fillStyle = backgroundColor;
    hCtx.fillRect(0, 0, hRuler.width, hRuler.height);
    vCtx.fillStyle = backgroundColor;
    vCtx.fillRect(0, 0, vRuler.width, vRuler.height);
    
    // Set text and line styles
    hCtx.fillStyle = color;
    hCtx.strokeStyle = color;
    hCtx.font = "10px Arial";
    hCtx.textAlign = "center";
    vCtx.fillStyle = color;
    vCtx.strokeStyle = color;
    vCtx.font = "10px Arial";
    vCtx.textBaseline = "middle";
    
    // Calculate tick interval based on scale
    const tickInterval = getTickInterval(scale);
    const majorTickInterval = tickInterval * MAJOR_INTERVAL_FACTOR;
    
    // Draw horizontal ruler ticks and numbers
    const startX = Math.floor(-offset.x / scale / tickInterval) * tickInterval;
    const endX = Math.ceil((dimensions.width / scale - offset.x) / tickInterval) * tickInterval;
    
    for (let x = startX; x <= endX; x += tickInterval) {
      const pixelX = (x + offset.x) * scale;
      
      // Skip if outside visible area
      if (pixelX < 0 || pixelX > dimensions.width) continue;
      
      const isMajorTick = x % majorTickInterval === 0;
      const tickHeight = isMajorTick ? 12 : 6;
      
      // Draw tick
      hCtx.beginPath();
      hCtx.moveTo(pixelX, RULER_SIZE);
      hCtx.lineTo(pixelX, RULER_SIZE - tickHeight);
      hCtx.stroke();
      
      // Draw number at major ticks
      if (isMajorTick) {
        hCtx.fillText(x.toString(), pixelX, 10);
      }
    }
    
    // Draw vertical ruler ticks and numbers
    const startY = Math.floor(-offset.y / scale / tickInterval) * tickInterval;
    const endY = Math.ceil((dimensions.height / scale - offset.y) / tickInterval) * tickInterval;
    
    for (let y = startY; y <= endY; y += tickInterval) {
      const pixelY = (y + offset.y) * scale;
      
      // Skip if outside visible area
      if (pixelY < 0 || pixelY > dimensions.height) continue;
      
      const isMajorTick = y % majorTickInterval === 0;
      const tickWidth = isMajorTick ? 12 : 6;
      
      // Draw tick
      vCtx.beginPath();
      vCtx.moveTo(RULER_SIZE, pixelY);
      vCtx.lineTo(RULER_SIZE - tickWidth, pixelY);
      vCtx.stroke();
      
      // Draw number at major ticks
      if (isMajorTick) {
        vCtx.save();
        vCtx.translate(10, pixelY);
        vCtx.fillText(y.toString(), 0, 0);
        vCtx.restore();
      }
    }
    
    // Draw mouse position indicators if mouse is over canvas
    if (mousePosition.x > RULER_SIZE && mousePosition.y > RULER_SIZE) {
      // Horizontal indicator
      hCtx.fillStyle = "rgba(255, 0, 0, 0.6)";
      hCtx.fillRect(mousePosition.x - 0.5, 0, 1, RULER_SIZE);
      
      // Vertical indicator
      vCtx.fillStyle = "rgba(255, 0, 0, 0.6)";
      vCtx.fillRect(0, mousePosition.y - 0.5, RULER_SIZE, 1);
    }
  }, [dimensions, scale, offset, visible, backgroundColor, color, mousePosition]);
  
  // Handle mouse movement to show position indicators
  useEffect(() => {
    if (!canvasRef.current || !visible) return;
    
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const handleMouseMove = (e) => {
      // Get mouse position relative to container
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, visible]);
  
  // Handle the corner box
  useEffect(() => {
    if (!cornerBoxRef.current || !visible) return;
    
    const corner = cornerBoxRef.current;
    const ctx = corner.getContext("2d");
    
    // Set corner box size
    corner.width = RULER_SIZE;
    corner.height = RULER_SIZE;
    
    // Fill with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
    
    // Draw a grid icon or origin marker
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(5, RULER_SIZE / 2);
    ctx.lineTo(RULER_SIZE - 5, RULER_SIZE / 2);
    ctx.moveTo(RULER_SIZE / 2, 5);
    ctx.lineTo(RULER_SIZE / 2, RULER_SIZE - 5);
    ctx.stroke();
    
  }, [visible, backgroundColor, color]);
  
  if (!visible) return null;
  
  return (
    <>
      {/* Corner box (top-left) */}
      <div 
        className="absolute top-0 left-0 z-20"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      >
        <canvas ref={cornerBoxRef} />
      </div>
      
      {/* Horizontal ruler (top) */}
      <div 
        className="absolute top-0 left-0 z-10"
        style={{ marginLeft: RULER_SIZE, height: RULER_SIZE }}
      >
        <canvas ref={horizontalRulerRef} />
      </div>
      
      {/* Vertical ruler (left) */}
      <div 
        className="absolute top-0 left-0 z-10"
        style={{ marginTop: RULER_SIZE, width: RULER_SIZE }}
      >
        <canvas ref={verticalRulerRef} />
      </div>
    </>
  );
}

// Custom hook for ruler functionality
export function useRulers(initialVisible = true) {
  const [rulersVisible, setRulersVisible] = useState(initialVisible);
  const { canvasRef } = useCanvas();
  
  // Get world coordinates based on screen coordinates
  const getWorldCoordinates = (screenX, screenY, scale, offset) => {
    return {
      x: (screenX / scale) - offset.x,
      y: (screenY / scale) - offset.y
    };
  };
  
  // Get screen coordinates based on world coordinates
  const getScreenCoordinates = (worldX, worldY, scale, offset) => {
    return {
      x: (worldX + offset.x) * scale,
      y: (worldY + offset.y) * scale
    };
  };
  
  return {
    rulersVisible,
    setRulersVisible,
    getWorldCoordinates,
    getScreenCoordinates
  };
}