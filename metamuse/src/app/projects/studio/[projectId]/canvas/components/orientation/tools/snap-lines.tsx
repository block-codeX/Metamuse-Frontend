"use client";
import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

export default function SnapLines({ 
  enabled = true, 
  snapThreshold = 10, 
  lineColor = "#2196f3" 
}) {
  const snapLinesCanvasRef = useRef(null);
  const { 
    dimensions, 
    canvasRef, 
    scale = 1, 
    position = { x: 0, y: 0 },
    activeObject, 
    allObjects,
    guides = { horizontal: [], vertical: [] } 
  } = useCanvas();
  
  const [activeSnapLines, setActiveSnapLines] = useState({ 
    horizontal: [], 
    vertical: [] 
  });
  
  // Calculate snap points for an object
  const getObjectSnapPoints = (obj) => {
    if (!obj) return { centers: [], edges: [] };
    
    const { left, top, width, height } = obj;
    const right = left + width;
    const bottom = top + height;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    return {
      centers: [
        { type: 'horizontal', position: centerY, description: 'center' },
        { type: 'vertical', position: centerX, description: 'center' }
      ],
      edges: [
        { type: 'horizontal', position: top, description: 'top' },
        { type: 'horizontal', position: bottom, description: 'bottom' },
        { type: 'vertical', position: left, description: 'left' },
        { type: 'vertical', position: right, description: 'right' }
      ]
    };
  };
  
  // Check for snap alignments
  const findSnapAlignments = () => {
    if (!activeObject || !enabled) {
      setActiveSnapLines({ horizontal: [], vertical: [] });
      return;
    }
    
    const activePoints = getObjectSnapPoints(activeObject);
    const horizontalSnaps = [];
    const verticalSnaps = [];
    
    // A function to check if a point is close to another point
    const isNearby = (a, b) => Math.abs(a - b) <= snapThreshold;
    
    // Check against each other object
    allObjects.forEach(obj => {
      if (obj === activeObject) return;
      
      const objPoints = getObjectSnapPoints(obj);
      
      // Check active centers against object edges and centers
      activePoints.centers.forEach(activePoint => {
        [...objPoints.centers, ...objPoints.edges].forEach(objPoint => {
          if (activePoint.type === objPoint.type && isNearby(activePoint.position, objPoint.position)) {
            if (activePoint.type === 'horizontal') {
              horizontalSnaps.push({
                position: objPoint.position,
                description: `${activePoint.description} to ${objPoint.description}`
              });
            } else {
              verticalSnaps.push({
                position: objPoint.position,
                description: `${activePoint.description} to ${objPoint.description}`
              });
            }
          }
        });
      });
      
      // Check active edges against object edges and centers
      activePoints.edges.forEach(activePoint => {
        [...objPoints.centers, ...objPoints.edges].forEach(objPoint => {
          if (activePoint.type === objPoint.type && isNearby(activePoint.position, objPoint.position)) {
            if (activePoint.type === 'horizontal') {
              horizontalSnaps.push({
                position: objPoint.position,
                description: `${activePoint.description} to ${objPoint.description}`
              });
            } else {
              verticalSnaps.push({
                position: objPoint.position,
                description: `${activePoint.description} to ${objPoint.description}`
              });
            }
          }
        });
      });
    });
    
    // Also check against guides
    guides.horizontal.forEach(guidePos => {
      [...activePoints.centers, ...activePoints.edges]
        .filter(point => point.type === 'horizontal')
        .forEach(point => {
          if (isNearby(point.position, guidePos)) {
            horizontalSnaps.push({
              position: guidePos,
              description: `${point.description} to guide`,
              isGuide: true
            });
          }
        });
    });
    
    guides.vertical.forEach(guidePos => {
      [...activePoints.centers, ...activePoints.edges]
        .filter(point => point.type === 'vertical')
        .forEach(point => {
          if (isNearby(point.position, guidePos)) {
            verticalSnaps.push({
              position: guidePos,
              description: `${point.description} to guide`,
              isGuide: true
            });
          }
        });
    });
    
    // Update the active snap lines
    setActiveSnapLines({
      horizontal: horizontalSnaps,
      vertical: verticalSnaps
    });
  };
  
  // Draw the snap lines
  const drawSnapLines = () => {
    if (!snapLinesCanvasRef.current || !dimensions) return;
    
    const canvas = snapLinesCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set line style
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]); // Dashed line
    
    // Draw horizontal snap lines
    activeSnapLines.horizontal.forEach(line => {
      const y = (line.position * scale) + position.y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Draw small label if needed
      if (line.description && !line.isGuide) {
        ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        ctx.fillRect(5, y - 10, ctx.measureText(line.description).width + 6, 16);
        ctx.fillStyle = 'white';
        ctx.fillText(line.description, 8, y);
      }
    });
    
    // Draw vertical snap lines
    activeSnapLines.vertical.forEach(line => {
      const x = (line.position * scale) + position.x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Draw small label if needed
      if (line.description && !line.isGuide) {
        ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        ctx.fillRect(x + 2, 5, ctx.measureText(line.description).width + 6, 16);
        ctx.fillStyle = 'white';
        ctx.fillText(line.description, x + 5, 18);
      }
    });
    
    // Reset line dash
    ctx.setLineDash([]);
  };
  
  // Find snap alignments when active object changes
  useEffect(() => {
    findSnapAlignments();
  }, [activeObject, allObjects, enabled, guides]);
  
  // Draw snap lines when they change
  useEffect(() => {
    drawSnapLines();
  }, [activeSnapLines, dimensions, scale, position]);
  
  if (!enabled) return null;
  
  return (
    <canvas
      ref={snapLinesCanvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 15 }}
    />
  );
}