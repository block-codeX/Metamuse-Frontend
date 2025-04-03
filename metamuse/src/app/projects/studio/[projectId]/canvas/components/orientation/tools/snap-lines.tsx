"use client";
import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

export default function SnapLines({ enabled = true, snapThreshold = 10, lineColor = "#2196f3" }) {
  const snapLinesCanvasRef = useRef(null);
  const { dimensions, canvasRef } = useCanvas();
  const [snapLines, setSnapLines] = useState({ horizontal: [], vertical: [] });
  
  useEffect(() => {
    if (!canvasRef.current || !enabled) return;
    
    const canvas = canvasRef.current;
    
    // Get Fabric.js canvas instance
    const fabricCanvas = canvas.fabric;
    if (!fabricCanvas) return;
    
    // Function to calculate snap lines
    const calculateSnapLines = (activeObject) => {
      if (!activeObject) return { horizontal: [], vertical: [] };
      
      const objects = fabricCanvas.getObjects().filter(obj => obj !== activeObject);
      const objectBounds = {
        left: activeObject.left,
        top: activeObject.top,
        centerX: activeObject.left + activeObject.width * activeObject.scaleX / 2,
        centerY: activeObject.top + activeObject.height * activeObject.scaleY / 2,
        right: activeObject.left + activeObject.width * activeObject.scaleX,
        bottom: activeObject.top + activeObject.height * activeObject.scaleY
      };
      
      const horizontalLines = [];
      const verticalLines = [];
      
      // Check each object for possible snap points
      objects.forEach(obj => {
        const objBounds = {
          left: obj.left,
          top: obj.top,
          centerX: obj.left + obj.width * obj.scaleX / 2,
          centerY: obj.top + obj.height * obj.scaleY / 2,
          right: obj.left + obj.width * obj.scaleX,
          bottom: obj.top + obj.height * obj.scaleY
        };
        
        // Check horizontal alignments (top, center, bottom)
        [
          { value: objectBounds.top, objValue: objBounds.top, type: 'top' },
          { value: objectBounds.centerY, objValue: objBounds.centerY, type: 'center' },
          { value: objectBounds.bottom, objValue: objBounds.bottom, type: 'bottom' }
        ].forEach(({ value, objValue, type }) => {
          if (Math.abs(value - objValue) < snapThreshold) {
            horizontalLines.push({ y: objValue, type });
            
            // Snap the object
            if (enabled) {
              if (type === 'top') activeObject.set('top', objValue);
              else if (type === 'center') activeObject.set('top', objValue - activeObject.height * activeObject.scaleY / 2);
              else if (type === 'bottom') activeObject.set('top', objValue - activeObject.height * activeObject.scaleY);
            }
          }
        });
        
        // Check vertical alignments (left, center, right)
        [
          { value: objectBounds.left, objValue: objBounds.left, type: 'left' },
          { value: objectBounds.centerX, objValue: objBounds.centerX, type: 'center' },
          { value: objectBounds.right, objValue: objBounds.right, type: 'right' }
        ].forEach(({ value, objValue, type }) => {
          if (Math.abs(value - objValue) < snapThreshold) {
            verticalLines.push({ x: objValue, type });
            
            // Snap the object
            if (enabled) {
              if (type === 'left') activeObject.set('left', objValue);
              else if (type === 'center') activeObject.set('left', objValue - activeObject.width * activeObject.scaleX / 2);
              else if (type === 'right') activeObject.set('left', objValue - activeObject.width * activeObject.scaleX);
            }
          }
        });
      });
      
      // Canvas edges (0, width, height)
      [
        { value: objectBounds.top, objValue: 0, type: 'top' },
        { value: objectBounds.bottom, objValue: dimensions.height, type: 'bottom' }
      ].forEach(({ value, objValue, type }) => {
        if (Math.abs(value - objValue) < snapThreshold) {
          horizontalLines.push({ y: objValue, type });
          
          // Snap to canvas edge
          if (enabled) {
            if (type === 'top') activeObject.set('top', objValue);
            else if (type === 'bottom') activeObject.set('top', objValue - activeObject.height * activeObject.scaleY);
          }
        }
      });
      
      [
        { value: objectBounds.left, objValue: 0, type: 'left' },
        { value: objectBounds.right, objValue: dimensions.width, type: 'right' }
      ].forEach(({ value, objValue, type }) => {
        if (Math.abs(value - objValue) < snapThreshold) {
          verticalLines.push({ x: objValue, type });
          
          // Snap to canvas edge
          if (enabled) {
            if (type === 'left') activeObject.set('left', objValue);
            else if (type === 'right') activeObject.set('left', objValue - activeObject.width * activeObject.scaleX);
          }
        }
      });
      
      // Center of canvas
      const canvasCenterX = dimensions.width / 2;
      const canvasCenterY = dimensions.height / 2;
      
      if (Math.abs(objectBounds.centerX - canvasCenterX) < snapThreshold) {
        verticalLines.push({ x: canvasCenterX, type: 'center' });
        if (enabled) {
          activeObject.set('left', canvasCenterX - activeObject.width * activeObject.scaleX / 2);
        }
      }
      
      if (Math.abs(objectBounds.centerY - canvasCenterY) < snapThreshold) {
        horizontalLines.push({ y: canvasCenterY, type: 'center' });
        if (enabled) {
          activeObject.set('top', canvasCenterY - activeObject.height * activeObject.scaleY / 2);
        }
      }
      
      return { horizontal: horizontalLines, vertical: verticalLines };
    };
    
    // Add event listeners for fabric canvas
    fabricCanvas.on('object:moving', function(options) {
      const activeObject = options.target;
      const lines = calculateSnapLines(activeObject);
      setSnapLines(lines);
      fabricCanvas.requestRenderAll();
    });
    
    fabricCanvas.on('mouse:up', function() {
      // Clear snap lines when done moving
      setSnapLines({ horizontal: [], vertical: [] });
    });
    
    // Clean up
    return () => {
      fabricCanvas.off('object:moving');
      fabricCanvas.off('mouse:up');
    };
  }, [canvasRef, snapThreshold, enabled, dimensions]);
  
  // Draw snap lines when they change
  useEffect(() => {
    if (!snapLinesCanvasRef.current || !dimensions) return;
    
    const snapCanvas = snapLinesCanvasRef.current;
    const ctx = snapCanvas.getContext("2d");
    
    // Set canvas size to match the main canvas
    snapCanvas.width = dimensions.width;
    snapCanvas.height = dimensions.height;
    
    // Clear previous lines
    ctx.clearRect(0, 0, snapCanvas.width, snapCanvas.height);
    
    // Draw lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]); // Dashed line
    
    // Draw horizontal snap lines
    snapLines.horizontal.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(0, line.y);
      ctx.lineTo(snapCanvas.width, line.y);
      ctx.stroke();
    });
    
    // Draw vertical snap lines
    snapLines.vertical.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x, 0);
      ctx.lineTo(line.x, snapCanvas.height);
      ctx.stroke();
    });
    
    ctx.setLineDash([]); // Reset dash
  }, [snapLines, dimensions, lineColor]);
  
  // Position snap lines canvas above the main canvas
  return (
    <canvas
      ref={snapLinesCanvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}

// Custom hook for snap functionality
export function useSnapLines(options = { enabled: true, threshold: 10 }) {
  const [snapEnabled, setSnapEnabled] = useState(options.enabled);
  const [snapThreshold, setSnapThreshold] = useState(options.threshold);
  
  return {
    snapEnabled,
    setSnapEnabled,
    snapThreshold,
    setSnapThreshold
  };
}