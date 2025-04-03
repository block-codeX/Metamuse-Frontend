"use client"
import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvas } from '../../contexts/canvas-context'; // Adjust path if needed

interface RulersProps {
  containerRef: React.RefObject<HTMLDivElement>;
  scale: number;
  position: { x: number; y: number };
  onAddGuideline: (orientation: 'horizontal' | 'vertical', position: number) => void;
}

const RULER_SIZE = 30; // Width/Height of the ruler in pixels
const MARKING_COLOR = '#888';
const TEXT_COLOR = '#333';
const CANVAS_AREA_COLOR = 'rgba(0, 0, 0, 0.05)'; // Subtle background for canvas area on ruler

const Rulers: React.FC<RulersProps> = ({ containerRef, scale, position, onAddGuideline }) => {
  const horizontalRulerRef = useRef<HTMLCanvasElement>(null);
  const verticalRulerRef = useRef<HTMLCanvasElement>(null);
  const { dimensions, canvasRef } = useCanvas(); // Get canvas dimensions

  const draggingGuideline = useRef<{ orientation: 'horizontal' | 'vertical'; element: HTMLDivElement | null }>({ orientation: 'horizontal', element: null });

  // --- Drawing Logic ---
  const drawRulers = useCallback(() => {
    if (!containerRef.current || !horizontalRulerRef.current || !verticalRulerRef.current || !canvasRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const hCtx = horizontalRulerRef.current.getContext('2d');
    const vCtx = verticalRulerRef.current.getContext('2d');

    if (!hCtx || !vCtx) return;

    // --- Clear Rulers ---
    horizontalRulerRef.current.width = containerWidth;
    horizontalRulerRef.current.height = RULER_SIZE;
    verticalRulerRef.current.width = RULER_SIZE;
    verticalRulerRef.current.height = containerHeight;

    hCtx.clearRect(0, 0, containerWidth, RULER_SIZE);
    vCtx.clearRect(0, 0, RULER_SIZE, containerHeight);

    hCtx.fillStyle = '#f0f0f0'; // Ruler background
    vCtx.fillStyle = '#f0f0f0';
    hCtx.fillRect(0, 0, containerWidth, RULER_SIZE);
    vCtx.fillRect(0, 0, RULER_SIZE, containerHeight);

    // --- Calculate Visible Canvas Range ---
    // Top-left corner of the viewport in canvas coordinates
    const viewX = -position.x / scale;
    const viewY = -position.y / scale;
    // Bottom-right corner of the viewport in canvas coordinates
    // const viewXEnd = viewX + containerWidth / scale;
    // const viewYEnd = viewY + containerHeight / scale;

    // --- Highlight Canvas Area on Rulers ---
     hCtx.fillStyle = CANVAS_AREA_COLOR;
     vCtx.fillStyle = CANVAS_AREA_COLOR;

     // Horizontal Ruler Canvas Area
     const canvasStartXOnRuler = position.x - RULER_SIZE;
     const canvasWidthOnRuler = dimensions.width * scale;
     hCtx.fillRect(canvasStartXOnRuler, 0, canvasWidthOnRuler, RULER_SIZE);
 
     // Vertical Ruler Canvas Area:
     // Start position on the ruler's canvas = canvas visual start Y - ruler visual start Y
     const canvasStartYOnRuler = position.y - RULER_SIZE;
     const canvasHeightOnRuler = dimensions.height * scale;
     vCtx.fillRect(0, canvasStartYOnRuler, RULER_SIZE, canvasHeightOnRuler);


    // --- Draw Markings ---
    hCtx.strokeStyle = MARKING_COLOR;
    vCtx.strokeStyle = MARKING_COLOR;
    hCtx.fillStyle = TEXT_COLOR;
    vCtx.fillStyle = TEXT_COLOR;
    hCtx.font = '10px Arial';
    vCtx.font = '10px Arial';
    hCtx.textAlign = 'center';
    vCtx.textAlign = 'center'; // Adjust as needed

    // Determine interval based on zoom
    let interval = 100;
    if (scale > 2) interval = 50;
    if (scale > 5) interval = 10;
    if (scale > 10) interval = 5;
     if (scale < 0.5) interval = 200;
     if (scale < 0.2) interval = 500;


    // --- Horizontal Markings ---
    hCtx.beginPath();
    const startX = Math.floor(viewX / interval) * interval;
    for (let x = startX; x * scale < containerWidth - position.x ; x += interval) {
      const screenX = position.x + x * scale + RULER_SIZE; // Adjust for vertical ruler offset
        if (screenX < RULER_SIZE) continue; // Skip markings hidden behind vertical ruler

      hCtx.moveTo(screenX, RULER_SIZE);
      hCtx.lineTo(screenX, RULER_SIZE - (x % (interval * 5) === 0 ? 10 : 5)); // Longer lines every 5 intervals
      hCtx.fillText(String(x), screenX, 12);
    }
    hCtx.stroke();

    // --- Vertical Markings ---
    vCtx.beginPath();
    const startY = Math.floor(viewY / interval) * interval;
     for (let y = startY; y * scale < containerHeight - position.y; y += interval) {
      const screenY = position.y + y * scale + RULER_SIZE; // Adjust for horizontal ruler offset
        if (screenY < RULER_SIZE) continue; // Skip markings hidden behind horizontal ruler

      vCtx.moveTo(RULER_SIZE, screenY);
      vCtx.lineTo(RULER_SIZE - (y % (interval * 5) === 0 ? 10 : 5), screenY); // Longer lines

       // Draw text rotated (optional, can be complex) or beside the line
       vCtx.save();
       vCtx.translate(12, screenY);
       vCtx.rotate(-Math.PI / 2); // Rotate text
       vCtx.fillText(String(y), 0, 3);
       vCtx.restore();

      // Alternative: Text next to ruler
      // vCtx.fillText(String(y), 10, screenY + 3);
    }
    vCtx.stroke();

    // Draw border lines
    hCtx.beginPath();
    hCtx.moveTo(RULER_SIZE, RULER_SIZE - 0.5);
    hCtx.lineTo(containerWidth, RULER_SIZE - 0.5);
    hCtx.strokeStyle = '#aaa';
    hCtx.stroke();

    vCtx.beginPath();
    vCtx.moveTo(RULER_SIZE - 0.5, RULER_SIZE);
    vCtx.lineTo(RULER_SIZE - 0.5, containerHeight);
    vCtx.strokeStyle = '#aaa';
    vCtx.stroke();


  }, [scale, position, dimensions, containerRef, canvasRef]);

  useEffect(() => {
    drawRulers();
  }, [drawRulers]); // Redraw when scale, position, or dimensions change

  // --- Guideline Dragging Logic ---

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, orientation: 'horizontal' | 'vertical') => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Prevent interfering with panning
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

    draggingGuideline.current.orientation = orientation;

    // Create visual feedback element
    const dragIndicator = document.createElement('div');
    dragIndicator.style.position = 'absolute';
    dragIndicator.style.pointerEvents = 'none'; // Don't let it interfere with mouse events
    dragIndicator.style.zIndex = '1000'; // Ensure it's visible

    if (orientation === 'horizontal') {
        dragIndicator.style.left = '0';
        dragIndicator.style.width = '100%';
        dragIndicator.style.height = '1px';
        dragIndicator.style.backgroundColor = 'dodgerblue';
        dragIndicator.style.top = `${e.clientY - containerRect.top}px`;
    } else { // Vertical
        dragIndicator.style.top = '0';
        dragIndicator.style.height = '100%';
        dragIndicator.style.width = '1px';
        dragIndicator.style.backgroundColor = 'dodgerblue';
        dragIndicator.style.left = `${e.clientX - containerRect.left}px`;
    }

    containerRef.current.appendChild(dragIndicator);
    draggingGuideline.current.element = dragIndicator;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

   const handleMouseMove = (e: MouseEvent) => {
      if (!draggingGuideline.current.element || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const indicator = draggingGuideline.current.element;

      if (draggingGuideline.current.orientation === 'horizontal') {
          indicator.style.top = `${e.clientY - containerRect.top}px`;
      } else { // Vertical
          indicator.style.left = `${e.clientX - containerRect.left}px`;
      }
   };

   const handleMouseUp = (e: MouseEvent) => {
     if (draggingGuideline.current.element && containerRef.current) {
        containerRef.current.removeChild(draggingGuideline.current.element); // Remove visual feedback
     }

     document.removeEventListener('mousemove', handleMouseMove);
     document.removeEventListener('mouseup', handleMouseUp);

     // --- Calculate canvas position and add guideline ---
     if (!containerRef.current || !canvasRef.current) return;

     const containerRect = containerRef.current.getBoundingClientRect();
     const targetX = e.clientX - containerRect.left;
     const targetY = e.clientY - containerRect.top;

     // Check if mouse is released over the main canvas area (not rulers)
     const isOverCanvasArea = targetX >= RULER_SIZE && targetY >= RULER_SIZE;

     if (isOverCanvasArea) {
         if (draggingGuideline.current.orientation === 'horizontal') {
            // Calculate Y position in canvas coordinates
            const canvasY = (targetY - RULER_SIZE - position.y) / scale;
            onAddGuideline('horizontal', canvasY);
            console.log("Adding H guideline at", canvasY);
         } else { // Vertical
             // Calculate X position in canvas coordinates
            const canvasX = (targetX - RULER_SIZE - position.x) / scale;
            onAddGuideline('vertical', canvasX);
            console.log("Adding V guideline at", canvasX);
         }
     }


     draggingGuideline.current.element = null;
   };

  return (
    <>
      {/* Corner Box */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${RULER_SIZE}px`,
          height: `${RULER_SIZE}px`,
          backgroundColor: '#ddd', // A slightly different color for the corner
           borderRight: '1px solid #aaa',
           borderBottom: '1px solid #aaa',
          zIndex: 11, // Above rulers
        }}
      />
      {/* Horizontal Ruler */}
      <div
        style={{
          position: 'absolute',
          left: `${RULER_SIZE}px`, // Offset by vertical ruler width
          top: 0,
          height: `${RULER_SIZE}px`,
          width: `calc(100% - ${RULER_SIZE}px)`, // Fill remaining width
          overflow: 'hidden',
          cursor: 'ns-resize', // Indicate vertical dragging possibility
           zIndex: 10,
        }}
         onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
      >
        <canvas ref={horizontalRulerRef} />
      </div>
      {/* Vertical Ruler */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: `${RULER_SIZE}px`, // Offset by horizontal ruler height
          width: `${RULER_SIZE}px`,
          height: `calc(100% - ${RULER_SIZE}px)`, // Fill remaining height
          overflow: 'hidden',
           cursor: 'ew-resize', // Indicate horizontal dragging possibility
           zIndex: 10,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'vertical')}
      >
        <canvas ref={verticalRulerRef} />
      </div>
    </>
  );
};

export default Rulers;