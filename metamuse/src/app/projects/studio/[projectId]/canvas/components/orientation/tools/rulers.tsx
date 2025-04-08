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
// src/components/canvas/Rulers.tsx (Modified drawRulers function)

const drawRulers = useCallback(() => {
  if (!containerRef.current || !horizontalRulerRef.current || !verticalRulerRef.current || !canvasRef.current) return;

  const containerWidth = containerRef.current.clientWidth;
  const containerHeight = containerRef.current.clientHeight;

  const hCtx = horizontalRulerRef.current.getContext('2d');
  const vCtx = verticalRulerRef.current.getContext('2d');

  if (!hCtx || !vCtx) return;

  // --- Get Device Pixel Ratio for sharper rendering ---
  const dpr = window.devicePixelRatio || 1;
  const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
  };

  // --- Clear & Setup Rulers ---
  setupCanvas(horizontalRulerRef.current, hCtx, containerWidth, RULER_SIZE); // Use containerWidth for drawing area
  setupCanvas(verticalRulerRef.current, vCtx, RULER_SIZE, containerHeight); // Use containerHeight for drawing area

  hCtx.clearRect(0, 0, horizontalRulerRef.current.width, horizontalRulerRef.current.height);
  vCtx.clearRect(0, 0, verticalRulerRef.current.width, verticalRulerRef.current.height);

  hCtx.fillStyle = '#f0f0f0'; // Ruler background
  vCtx.fillStyle = '#f0f0f0';
  hCtx.fillRect(0, 0, containerWidth, RULER_SIZE); // Fill based on logical size
  vCtx.fillRect(0, 0, RULER_SIZE, containerHeight); // Fill based on logical size

  // --- Calculate Visible Canvas Range (using logical coords) ---
  // Canvas coordinate visible at the ruler's inner edge (adjusted for RULER_SIZE offset)
  const viewX = (RULER_SIZE - position.x) / scale;
  const viewY = (RULER_SIZE - position.y) / scale;

  // --- Highlight Canvas Area on Rulers (Keep previous fix) ---
  hCtx.fillStyle = CANVAS_AREA_COLOR;
  vCtx.fillStyle = CANVAS_AREA_COLOR;

  // Horizontal: Start position *on the ruler canvas* = (canvas screen X) - (ruler screen X)
  const canvasStartXOnRuler = (position.x) - RULER_SIZE;
  const canvasWidthOnRuler = dimensions.width * scale;
  hCtx.fillRect(canvasStartXOnRuler, 0, canvasWidthOnRuler, RULER_SIZE);

  // Vertical: Start position *on the ruler canvas* = (canvas screen Y) - (ruler screen Y)
  const canvasStartYOnRuler = (position.y) - RULER_SIZE;
  const canvasHeightOnRuler = dimensions.height * scale;
  vCtx.fillRect(0, canvasStartYOnRuler, RULER_SIZE, canvasHeightOnRuler);


  // --- Draw Markings (Revised Calculation) ---
  hCtx.strokeStyle = MARKING_COLOR;
  vCtx.strokeStyle = MARKING_COLOR;
  hCtx.fillStyle = TEXT_COLOR;
  vCtx.fillStyle = TEXT_COLOR;
  hCtx.font = '10px Arial';
  vCtx.font = '10px Arial';
  // hCtx.textAlign = 'center'; // Default
  // vCtx.textAlign = 'center'; // Default

  // Determine interval based on zoom (same logic)
  let interval = 100;
   if (scale * dpr > 2) interval = 50; // Adjust threshold based on DPR for density
   if (scale * dpr > 5) interval = 25; // Finer intervals sooner
   if (scale * dpr > 10) interval = 10;
   if (scale * dpr > 20) interval = 5;
   if (scale * dpr < 0.5) interval = 200;
   if (scale * dpr < 0.2) interval = 500;

  // --- Horizontal Markings ---
  hCtx.beginPath();
  hCtx.textAlign = 'left'; // Align text starting from the tick
  // Find the first marking coordinate >= the visible start
  const startXCoord = Math.ceil(viewX / interval) * interval;

  for (let x = startXCoord; ; x += interval) {
      // Calculate the position of canvas coordinate 'x' *on the horizontal ruler's canvas*
      // rulerX = (screen position of x) - (screen position of ruler's start)
      // screen position of x = position.x + x * scale
      // screen position of ruler's start = RULER_SIZE
      const rulerX = (position.x + x * scale) - RULER_SIZE;

      // Stop if the mark goes beyond the ruler's drawing width
      if (rulerX > containerWidth) break; // Check against logical width

      // Skip if the mark is before the ruler's drawing area starts (shouldn't happen with ceil)
      if (rulerX < 0) continue;

      const isMajorTick = Math.round(x / (interval * 5)) === x / (interval * 5); // More robust check for major ticks
      const tickHeight = isMajorTick ? 10 : 5;

      hCtx.moveTo(rulerX + 0.5, RULER_SIZE); // +0.5 for sharper lines
      hCtx.lineTo(rulerX + 0.5, RULER_SIZE - tickHeight);

      // Draw text only for major ticks or when zoomed in enough
      if (isMajorTick || interval <= 25) {
          hCtx.fillText(String(x), rulerX + 2, 10); // Position text slightly right of the tick
      }
  }
  hCtx.stroke();

  // --- Vertical Markings ---
  vCtx.beginPath();
  vCtx.textAlign = 'center'; // Reset for vertical rotated text
  // Find the first marking coordinate >= the visible start
  const startYCoord = Math.ceil(viewY / interval) * interval;

  for (let y = startYCoord; ; y += interval) {
       // Calculate the position of canvas coordinate 'y' *on the vertical ruler's canvas*
      // rulerY = (screen position of y) - (screen position of ruler's start)
      // screen position of y = position.y + y * scale
      // screen position of ruler's start = RULER_SIZE
      const rulerY = (position.y + y * scale) - RULER_SIZE;

      // Stop if the mark goes beyond the ruler's drawing height
      if (rulerY > containerHeight) break; // Check against logical height

      // Skip if the mark is before the ruler's drawing area starts
      if (rulerY < 0) continue;

      const isMajorTick = Math.round(y / (interval * 5)) === y / (interval * 5);
      const tickWidth = isMajorTick ? 10 : 5;

      vCtx.moveTo(RULER_SIZE, rulerY + 0.5);
      vCtx.lineTo(RULER_SIZE - tickWidth, rulerY + 0.5);

      // Draw text rotated (relative to rulerY) only for major ticks or when zoomed in
      if (isMajorTick || interval <= 25) {
          vCtx.save();
          // Translate relative to the ruler's coordinate system
          vCtx.translate(RULER_SIZE - tickWidth - 4, rulerY + 3); // Position text left of tick, adjust offset
          vCtx.rotate(-Math.PI / 2);
          vCtx.fillText(String(y), 0, 0); // Draw at the new origin
          vCtx.restore();
      }
  }
  vCtx.stroke();

  // --- Draw Border Lines ---
  // Draw along the inner edges of the rulers
  hCtx.beginPath();
  hCtx.moveTo(0, RULER_SIZE - 0.5); // Left edge to Right edge, along bottom of H ruler
  hCtx.lineTo(containerWidth, RULER_SIZE - 0.5);
  hCtx.strokeStyle = '#aaa';
  hCtx.lineWidth = 1; // Use logical pixels
  hCtx.stroke();

  vCtx.beginPath();
  vCtx.moveTo(RULER_SIZE - 0.5, 0); // Top edge to Bottom edge, along right of V ruler
  vCtx.lineTo(RULER_SIZE - 0.5, containerHeight);
  vCtx.strokeStyle = '#aaa';
  vCtx.lineWidth = 1;
  vCtx.stroke();

}, [scale, position, dimensions, containerRef, canvasRef]); // Add dpr dependency

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