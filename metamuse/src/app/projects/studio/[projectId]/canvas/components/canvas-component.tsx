// src/components/CanvasComponent.tsx
"use client";
import { useCanvas } from "./contexts/canvas-context";
import CanvasContextMenu from "./right-click-menu";
import { useKeyBindingTools } from "./tools/key-binding-tools";
import { useEffect, useState, useRef, useCallback } from "react";
import * as fabric from 'fabric'; // Import fabric
import Rulers from './orientation/tools/rulers'; // Import the Rulers component

const RULER_SIZE = 30; // Must match the value in Rulers.tsx

export default function CanvasComponent() {
  // Keep existing state and refs...
  const { canvasRef, dimensions, canvas } = useCanvas(); // Added canvas here
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [prevDimensions, setPrevDimensions] = useState({ width: 0, height: 0 });

  useKeyBindingTools(); // Keep this

  // --- Existing Functions (calculateInitialScale, handleWheel, etc.) ---
  // ... (keep all existing functions: calculateInitialScale, handleWheel, pan handlers, centerCanvas, resetView)

  // Ensure calculateInitialScale accounts for rulers
   const calculateInitialScale = useCallback(() => {
     if (!canvasRef.current || !containerRef.current) return 1;

     const canvasEl = canvasRef.current; // Use the element directly for dimensions
     const container = containerRef.current;

      // Available space for the canvas content itself (excluding rulers)
     const availableWidth = container.clientWidth - RULER_SIZE;
     const availableHeight = container.clientHeight - RULER_SIZE;

     // Add padding (e.g., 80% of available space)
     const paddingFactor = 0.8;
     const widthRatio = (availableWidth * paddingFactor) / canvasEl.width;
     const heightRatio = (availableHeight * paddingFactor) / canvasEl.height;

     return Math.min(widthRatio, heightRatio, 1); // Don't zoom > 1 initially
   }, [canvasRef]); // Removed dimensions dependency, relies on canvasRef dimensions


   // Ensure centerCanvas accounts for rulers
   const centerCanvas = useCallback((currentScale: number) => {
     if (!canvasRef.current || !containerRef.current) return;

     const canvasEl = canvasRef.current; // Use element for dimensions
     const container = containerRef.current;

     // Calculate center based on available space (excluding rulers)
     const availableWidth = container.clientWidth - RULER_SIZE;
     const availableHeight = container.clientHeight - RULER_SIZE;

     const newX = (availableWidth - canvasEl.width * currentScale) / 2;
     const newY = (availableHeight - canvasEl.height * currentScale) / 2;

      // Set position relative to the top-left corner *including* rulers
      setPosition({ x: newX + RULER_SIZE, y: newY + RULER_SIZE });

   }, [canvasRef]);


    // Modify zoom handler to zoom towards cursor correctly with rulers offset
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!containerRef.current) return;

        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.1, scale + delta * scale), 10); // Adjusted range and scaling factor, limit max zoom

        const rect = containerRef.current.getBoundingClientRect();
        // Mouse position relative to the container (including rulers)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Point towards which we are zooming (in container coordinates)
        const zoomPointX = mouseX;
        const zoomPointY = mouseY;

        // Calculate new position to keep the point under the cursor fixed
        const newX = position.x - (zoomPointX - position.x) * (newScale / scale - 1);
        const newY = position.y - (zoomPointY - position.y) * (newScale / scale - 1);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    };


    // Modify panning handlers to work correctly with rulers offset
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
         // Allow panning only if started outside the ruler area OR if ctrl/meta is pressed
        const isOverRulers = e.clientX - e.currentTarget.getBoundingClientRect().left < RULER_SIZE ||
                           e.clientY - e.currentTarget.getBoundingClientRect().top < RULER_SIZE;

        if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
             if (isOverRulers && !(e.ctrlKey || e.metaKey)) return; // Don't pan if middle click starts on rulers unless forced

            setIsPanning(true);
            setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grabbing';
            }
        }
        // Prevent default text selection behavior during drag/pan
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning) {
             setPosition({
                 x: e.clientX - startPan.x,
                 y: e.clientY - startPan.y
             });
        }
     };

     const handleMouseUp = () => {
        if (isPanning) {
             setIsPanning(false);
             if (containerRef.current) {
                 containerRef.current.style.cursor = 'grab'; // Use 'grab' for default pan state
             }
         }
     };


  // --- Guideline Creation Function ---
  const addGuideline = useCallback((orientation: 'horizontal' | 'vertical', canvasPos: number) => {
    if (!canvas || !canvasRef.current) return;

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    const strokeColor = 'rgba(0, 161, 255, 0.7)'; // Blue, slightly transparent
    const strokeWidth = 1 / scale; // Make lines appear 1px thick regardless of zoom

    let line: fabric.Line;

    if (orientation === 'horizontal') {
      line = new fabric.Line([0, canvasPos, canvasWidth, canvasPos], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: true,
        evented: true,
        lockMovementX: true, // Can only move vertically
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false, // No scaling controls
         hasBorders: false, // No selection border needed? Maybe keep for feedback
         hoverCursor: 'ns-resize',
         moveCursor: 'ns-resize',
         // Custom property to identify guidelines
        customType: 'guideline',
         orientation: 'horizontal'
      });
    } else { // Vertical
      line = new fabric.Line([canvasPos, 0, canvasPos, canvasHeight], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: true,
        evented: true,
        lockMovementY: true, // Can only move horizontally
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'ew-resize',
         moveCursor: 'ew-resize',
        // Custom property
        customType: 'guideline',
        orientation: 'vertical'
      });
    }

    // Add to canvas and bring to front
    canvas.add(line);
    // canvas.bringToFront(line); // Ensure guidelines are usually visible
    canvas.requestRenderAll();

  }, [canvas, scale]); // Depend on canvas and scale (for strokeWidth)


  // --- Update guideline stroke width on zoom ---
   useEffect(() => {
    if (!canvas) return;
    const newStrokeWidth = 1 / scale; // Target 1px visual width

    canvas.getObjects().forEach(obj => {
      if (obj.customType === 'guideline') {
         // @ts-ignore - Fabric's types might not include custom properties directly
        obj.set('strokeWidth', newStrokeWidth);
      }
    });
     canvas.requestRenderAll(); // Redraw if stroke width changed
   }, [canvas, scale]);

  // --- Existing Effects (dimension changes, initialization, cleanup) ---
   useEffect(() => {
     if (dimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height)) {
        setPrevDimensions({ width: dimensions.width, height: dimensions.height });
        if (dimensions.width > 0 && dimensions.height > 0 && canvasRef.current) {
             // Update canvasRef dimensions directly - Fabric might handle this via setDimensions
              // canvasRef.current.width = dimensions.width;
              // canvasRef.current.height = dimensions.height;
              // Fabric's setDimensions in the context should handle the internal update

              // Recalculate view after dimension change
             setTimeout(() => {
                 const newScale = calculateInitialScale();
                 setScale(newScale);
                 centerCanvas(newScale);
             }, 50); // Delay slightly
        }
     }
   }, [dimensions, prevDimensions, calculateInitialScale, centerCanvas, canvasRef]);


   useEffect(() => {
    // Run initial setup
    if (canvasRef.current && containerRef.current) {
        const initialScale = calculateInitialScale();
        setScale(initialScale);
        centerCanvas(initialScale); // Center initially

        const handleResize = () => {
             const newScale = calculateInitialScale();
             setScale(newScale);
             centerCanvas(newScale); // Re-center and scale on resize
         };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
   }, [calculateInitialScale, centerCanvas]); // Runs once on mount

   // Keep existing cleanup effect
   useEffect(() => {
     return () => {
       // Original cleanup...
     };
   }, [canvasRef]);

   // --- Guideline Interaction Handling (within Fabric) ---
    useEffect(() => {
        if (!canvas) return;

        const handleObjectMoving = (e: any) => {
            const target = e.target;
             // @ts-ignore
            if (!target || target.customType !== 'guideline') return;

             // @ts-ignore - Access custom properties
            const orientation = target.orientation;
             // @ts-ignore
            const strokeW = target.strokeWidth || (1 / scale); // Get current strokeWidth

            // Constrain movement and ensure it stays within canvas bounds (approx)
            if (orientation === 'horizontal') {
                 // @ts-ignore
                target.left = 0; // Keep fixed horizontally
                 // @ts-ignore
                 if (target.top < 0) target.top = 0;
                 // @ts-ignore
                 if (target.top > canvas.height - strokeW) target.top = canvas.height - strokeW;
            } else { // Vertical
                 // @ts-ignore
                target.top = 0; // Keep fixed vertically
                // @ts-ignore
                 if (target.left < 0) target.left = 0;
                 // @ts-ignore
                if (target.left > canvas.width - strokeW) target.left = canvas.width - strokeW;
            }
        };

         // Prevent guidelines from being selected when panning/drawing if needed
         // This might conflict with wanting to select them to drag/delete.
         // A possible approach is to only make guidelines selectable when a specific tool or key is active.
         // For now, we make them selectable by default.

        canvas.on('object:moving', handleObjectMoving);

        return () => {
            canvas.off('object:moving', handleObjectMoving);
        };
    }, [canvas, scale]); // Add scale dependency for strokeWidth reference


  return (
    <div className="relative w-full h-full overflow-hidden touch-none bg-gray-200" // Changed background to see container edges
         ref={containerRef}
         onWheel={handleWheel}
         onMouseDown={handleMouseDown} // Use component's mouse down
         onMouseMove={handleMouseMove} // Use component's mouse move
         onMouseUp={handleMouseUp}     // Use component's mouse up
         onMouseLeave={handleMouseUp} // End pan if mouse leaves container
         style={{ cursor: isPanning ? 'grabbing' : 'normal' }} // Dynamic cursor
         >

      {/* Rulers - Pass necessary props */}
      <Rulers
        containerRef={containerRef as any }
        scale={scale}
        position={position}
        onAddGuideline={addGuideline}
      />

      {/* Canvas Wrapper - Adjust position based on rulers */}
      <div
        className="absolute bg-white" // Removed transform-gpu for simplicity now
        style={{
           // Apply transform relative to the container div
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0', // Top-left origin is usually correct here
           // The canvas element itself will have its own width/height set by Fabric
           width: `${dimensions.width}px`, // Set wrapper dimensions if needed? maybe not required
           height: `${dimensions.height}px`,
        }}
      >
        {/* Context Menu wraps the canvas element */}
         <CanvasContextMenu>
            <canvas
             ref={canvasRef}
             // The width/height attributes are controlled by Fabric via setDimensions
             // className="border border-gray-300 shadow-md" // Styling is fine
             // Ensure the canvas element itself isn't positioned absolutely within this wrapper
           />
         </CanvasContextMenu>
      </div>

      {/* Zoom Controls - Adjust positioning if needed due to rulers */}
       <div className="absolute bottom-0 right-10 bg-background p-2 rounded-0 shadow-md flex gap-2 z-20">
            {/* Zoom buttons */}
            <button
                onClick={() => {
                     const newScale = Math.min(scale * 1.2, 10); // Use consistent zoom limits
                    // Zoom towards center of the *visible canvas area*
                     if (!containerRef.current || !canvasRef.current) return;
                     const centerX = (containerRef.current.clientWidth - RULER_SIZE) / 2 + RULER_SIZE;
                     const centerY = (containerRef.current.clientHeight - RULER_SIZE) / 2 + RULER_SIZE;

                     const newX = position.x - (centerX - position.x) * (newScale / scale - 1);
                     const newY = position.y - (centerY - position.y) * (newScale / scale - 1);

                     setScale(newScale);
                     setPosition({ x: newX, y: newY });
                }}
                className="p-1 w-6 h-6 flex items-center justify-center bg-surface rounded hover:bg-surface/90  border-border" title="Zoom In"
            >+</button>
            <button
                 onClick={() => {
                     const newScale = Math.max(scale / 1.2, 0.1); // Use consistent zoom limits
                      // Zoom towards center
                      if (!containerRef.current || !canvasRef.current) return;
                      const centerX = (containerRef.current.clientWidth - RULER_SIZE) / 2 + RULER_SIZE;
                      const centerY = (containerRef.current.clientHeight - RULER_SIZE) / 2 + RULER_SIZE;

                     const newX = position.x - (centerX - position.x) * (newScale / scale - 1);
                     const newY = position.y - (centerY - position.y) * (newScale / scale - 1);

                      setScale(newScale);
                      setPosition({ x: newX, y: newY });
                 }}
                 className="p-1 w-6 h-6 flex items-center justify-center  bg-surface rounded hover:bg-surface/90  border-border" title="Zoom Out"
            >-</button>
             <button
                onClick={() => { // Reset View
                  const newScale = calculateInitialScale();
                  setScale(newScale);
                  centerCanvas(newScale);
                }}
                 className="p-1 px-2 text-xs  bg-surface rounded hover:bg-surface/90  border-border" title="Reset View"
             >Reset</button>
             <span className="p-1 text-xs flex items-center bg-surface border-border">
                 {Math.round(scale * 100)}%
             </span>
        </div>
    </div>
  );
}