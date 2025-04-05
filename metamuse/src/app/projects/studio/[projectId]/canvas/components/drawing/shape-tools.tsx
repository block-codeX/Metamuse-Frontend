import { Square, Circle, Slash, Triangle as TriangleIcon, Star, Image as ImageIcon, Spline, CaseSensitive, MousePointer2 } from "lucide-react"; // Added MousePointer2 for Select
import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";
import { useRef } from "react";

export function useShapeTools() {
    // Get canvas instance and styling properties from context
    // These values from context will always be the latest when used inside event handlers
    const { canvas, foregroundColor, pencilWidth, backgroundColor } = useCanvas();

    // Refs for temporary drawing state
    const isDrawing = useRef(false);
    const startPoint = useRef<{ x: number, y: number } | null>(null);
    const currentShape = useRef<fabric.Object | null>(null);
    const points = useRef<{ x: number, y: number }[]>([]); // For multi-point shapes
    const tempLines = useRef<fabric.Line[]>([]); // For polygon/polyline guides

    // --- Cleanup & Initialization ---

    // Full cleanup: Removes listeners, resets state, enables selection
    const cleanupToolEventListeners = () => {
        if (!canvas) return;
        canvas.off("mouse:down");
        canvas.off("mouse:move");
        canvas.off("mouse:up");
        canvas.off("mouse:dblclick");

        isDrawing.current = false;
        startPoint.current = null;
        currentShape.current = null;
        points.current = [];
        // Clear temporary guide lines if any
        tempLines.current.forEach(line => canvas.remove(line));
        tempLines.current = [];

        canvas.defaultCursor = "default";
        canvas.selection = true; // Enable object selection
        canvas.forEachObject(o => o.selectable = true); // Make objects selectable
        canvas.requestRenderAll();
        console.log("Tool listeners cleaned up, selection enabled.");
    };

    // Partial reset: Resets drawing state for the *next* shape, keeps tool active
    const resetDrawingState = () => {
         if (!canvas) return;
        if (currentShape.current) {
            // Make the completed shape selectable and cache it
            currentShape.current.set({ selectable: true, objectCaching: true });
            canvas.setActiveObject(currentShape.current); // Select the new shape
        }
         // Clear temporary guide lines
         tempLines.current.forEach(line => canvas.remove(line));
         tempLines.current = [];

        // Reset refs for the next shape instance
        isDrawing.current = false;
        startPoint.current = null;
        currentShape.current = null;
        points.current = [];

        // Keep tool active: cursor remains, selection remains disabled
        canvas.requestRenderAll();
         console.log("Drawing state reset, tool still active.");
    };


    // Generic setup called by each drawing tool's activation function
    const initializeDrawingTool = (cursorType = 'crosshair') => {
         if (!canvas) return false;
         cleanupToolEventListeners(); // Clean up any previous tool COMPLETELY
         canvas.defaultCursor = cursorType;
         canvas.selection = false; // Disable selecting objects while drawing
         canvas.forEachObject(o => o.selectable = false); // Make existing objects non-selectable
         console.log(`Tool initialized with cursor: ${cursorType}`);
         return true;
    }

    // --- Tool Activation Functions ---

    // Rectangle Tool (Continuous Drawing)
    const activateRectangle = () => {
        if (!initializeDrawingTool()) return;

        const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
            if (isDrawing.current) return; // Prevent starting new shape if already drawing
            const pointer = canvas!.getPointer(opt.e);
            startPoint.current = { x: pointer.x, y: pointer.y };
            isDrawing.current = true;

            const rect = new fabric.Rect({
                left: startPoint.current.x, top: startPoint.current.y, width: 0, height: 0,
                stroke: foregroundColor, // Uses latest context value
                strokeWidth: pencilWidth, // Uses latest context value
                fill: backgroundColor, // Uses latest context value for fill
                strokeUniform: true, selectable: false, objectCaching: false, // Cache after creation
            });
            currentShape.current = rect;
            canvas!.add(rect);
        };

        const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
            if (!isDrawing.current || !startPoint.current || !currentShape.current) return;
            const pointer = canvas!.getPointer(opt.e);
            const rect = currentShape.current as fabric.Rect;
            const left = Math.min(pointer.x, startPoint.current.x);
            const top = Math.min(pointer.y, startPoint.current.y);
            const width = Math.abs(pointer.x - startPoint.current.x);
            const height = Math.abs(pointer.y - startPoint.current.y);
            rect.set({ left, top, width, height });
            canvas!.requestRenderAll();
        };

        const handleMouseUp = () => {
            if (!isDrawing.current || !currentShape.current) return; // Only finalize if drawing

             const finalRect = currentShape.current as fabric.Rect;
             if (finalRect.width < 1 && finalRect.height < 1) {
                 canvas?.remove(finalRect); // Remove tiny shape
                 console.log("Rectangle cancelled - too small.");
             } else {
                 console.log("Rectangle drawn");
                 // Don't cleanup listeners, just reset state for next rect
             }
             resetDrawingState(); // Reset for the next rectangle
        };

        // Attach listeners only once when tool is activated
        canvas!.on("mouse:down", handleMouseDown);
        canvas!.on("mouse:move", handleMouseMove);
        canvas!.on("mouse:up", handleMouseUp);
    };

    // Ellipse Tool (Continuous Drawing)
    const activateEllipse = () => {
        if (!initializeDrawingTool()) return;

        const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
             if (isDrawing.current) return;
            const pointer = canvas!.getPointer(opt.e);
            startPoint.current = { x: pointer.x, y: pointer.y };
            isDrawing.current = true;
            const ellipse = new fabric.Ellipse({
                left: startPoint.current.x, top: startPoint.current.y, rx: 0, ry: 0,
                stroke: foregroundColor, strokeWidth: pencilWidth, fill: backgroundColor,
                strokeUniform: true, selectable: false, originX: 'center', originY: 'center', objectCaching: false,
            });
            currentShape.current = ellipse;
            canvas!.add(ellipse);
        };
        const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
            if (!isDrawing.current || !startPoint.current || !currentShape.current) return;
            const pointer = canvas!.getPointer(opt.e);
            const ellipse = currentShape.current as fabric.Ellipse;
            const rx = Math.abs(pointer.x - startPoint.current.x) / 2;
            const ry = Math.abs(pointer.y - startPoint.current.y) / 2;
            const centerX = (pointer.x + startPoint.current.x) / 2;
            const centerY = (pointer.y + startPoint.current.y) / 2;
            ellipse.set({ left: centerX, top: centerY, rx, ry });
            canvas!.requestRenderAll();
        };
        const handleMouseUp = () => {
             if (!isDrawing.current || !currentShape.current) return;
              const finalEllipse = currentShape.current as fabric.Ellipse;
             if (finalEllipse.rx < 1 && finalEllipse.ry < 1) {
                 canvas?.remove(finalEllipse);
                 console.log("Ellipse cancelled - too small.");
             } else {
                 console.log("Ellipse drawn");
             }
             resetDrawingState(); // Reset for next ellipse
        };
        canvas!.on("mouse:down", handleMouseDown);
        canvas!.on("mouse:move", handleMouseMove);
        canvas!.on("mouse:up", handleMouseUp);
    };

    // Line Tool (Continuous Drawing)
    const activateLine = () => {
        if (!initializeDrawingTool()) return;

        const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
             if (isDrawing.current) return;
            const pointer = canvas!.getPointer(opt.e);
            startPoint.current = { x: pointer.x, y: pointer.y };
            isDrawing.current = true;
            const line = new fabric.Line(
                [startPoint.current.x, startPoint.current.y, startPoint.current.x, startPoint.current.y],
                { stroke: foregroundColor, strokeWidth: pencilWidth, selectable: false, objectCaching: false }
            );
            currentShape.current = line;
            canvas!.add(line);
        };
        const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
            if (!isDrawing.current || !currentShape.current) return;
            const pointer = canvas!.getPointer(opt.e);
            const line = currentShape.current as fabric.Line;
            line.set({ x2: pointer.x, y2: pointer.y });
            canvas!.requestRenderAll();
        };
        const handleMouseUp = () => {
            if (!isDrawing.current || !currentShape.current) return;
             const finalLine = currentShape.current as fabric.Line;
             if (Math.abs(finalLine.x1! - finalLine.x2!) < 1 && Math.abs(finalLine.y1! - finalLine.y2!) < 1) {
                 canvas?.remove(finalLine);
                 console.log("Line cancelled - too small.");
             } else {
                 console.log("Line drawn");
             }
             resetDrawingState(); // Reset for next line
        };
        canvas!.on("mouse:down", handleMouseDown);
        canvas!.on("mouse:move", handleMouseMove);
        canvas!.on("mouse:up", handleMouseUp);
    };

    const activateTriangle = () => {
      if (!initializeDrawingTool()) return;

      const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
        if (isDrawing.current) return;
        const pointer = canvas!.getPointer(opt.e);
        startPoint.current = { x: pointer.x, y: pointer.y };
        isDrawing.current = true;

        const triangle = new fabric.Triangle({
          left: startPoint.current.x,
          top: startPoint.current.y,
          width: 0,
          height: 0,
          stroke: foregroundColor,
          strokeWidth: pencilWidth,
          fill: backgroundColor,
          strokeUniform: true,
          selectable: false,
          objectCaching: false,
        });
        currentShape.current = triangle;
        canvas!.add(triangle);
      };

      const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
        if (!isDrawing.current || !startPoint.current || !currentShape.current) return;
        const pointer = canvas!.getPointer(opt.e);
        const triangle = currentShape.current as fabric.Triangle;

        const left = Math.min(pointer.x, startPoint.current.x);
        const top = Math.min(pointer.y, startPoint.current.y);
        const width = Math.abs(pointer.x - startPoint.current.x);
        const height = Math.abs(pointer.y - startPoint.current.y);

        triangle.set({ left, top, width, height });
        canvas!.requestRenderAll();
      };

      const handleMouseUp = () => {
        if (!isDrawing.current || !currentShape.current) return;

        const finalTriangle = currentShape.current as fabric.Triangle;
        if (finalTriangle.width < 1 && finalTriangle.height < 1) {
          canvas?.remove(finalTriangle);
          console.log("Triangle cancelled - too small.");
        } else {
          console.log("Triangle drawn");
        }
        resetDrawingState(); // Reset for the next triangle
      };

      canvas!.on("mouse:down", handleMouseDown);
      canvas!.on("mouse:move", handleMouseMove);
      canvas!.on("mouse:up", handleMouseUp);
    };

    // --- Multi-Click Tools (Polygon, Polyline, Triangle) - Continuous Mode ---
    const activateMultiClickShape = (shapeType: 'Polygon' | 'Polyline' | 'Triangle') => {
         if (!initializeDrawingTool()) return; // Use generic init

         // State specific to multi-click drawing session (refs from outer scope are used)
         // isDrawing, points, currentShape, tempLines are already refs

         const removeTempLines = () => {
             tempLines.current.forEach(line => canvas!.remove(line));
             tempLines.current = [];
         };

         // This function finalizes ONE shape instance
         const finalizeShape = () => {
             removeTempLines(); // Clear guides first
             const finalShape = currentShape.current;
             const finalPoints = points.current; // Use points collected for this shape

             // Validation
             const minPoints = shapeType === 'Triangle' ? 3 : (shapeType === 'Polygon' ? 3 : 2);
             if (!finalShape || finalPoints.length < minPoints) {
                 if (finalShape) canvas?.remove(finalShape); // Remove incomplete
                 console.log(`${shapeType} cancelled - not enough points.`);
             } else {
                 console.log(`${shapeType} finished`);
                 finalShape.set({
                     points: finalPoints,
                     selectable: true, hasBorders: true, hasControls: true, objectCaching: true,
                 });
                  if (finalShape instanceof fabric.Polygon && shapeType === 'Triangle' && finalPoints.length > 3) {
                      finalShape.set({ points: finalPoints.slice(0, 3) });
                 }
                 finalShape.setCoords();
                 canvas?.setActiveObject(finalShape);
             }

             // Reset drawing state for the *next* shape, but keep tool active
             resetDrawingState();
         };


         const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
              if (opt.e.detail > 1) return; // Ignore double-clicks here

              const pointer = canvas!.getPointer(opt.e);
              const point = { x: pointer.x, y: pointer.y };

              // Triangle specific: Finish after 3 points
              if (shapeType === 'Triangle' && points.current.length >= 2) {
                   points.current.push(point);
                   finalizeShape(); // Create with 3 points and finish/reset
                   return;
              }

              points.current.push(point);
              removeTempLines(); // Clear previous guide lines

              if (!isDrawing.current) {
                  // First point of this shape instance
                  isDrawing.current = true; // Mark that we are drawing *a* shape
                   const shapeConfig = {
                       stroke: foregroundColor, strokeWidth: pencilWidth, fill: shapeType === 'Polyline' ? '' : backgroundColor,
                       strokeUniform: true, objectCaching: false, selectable: false, hasBorders: false, hasControls: false
                   };
                   if (shapeType === 'Polygon' || shapeType === 'Triangle') {
                       currentShape.current = new fabric.Polygon([point], shapeConfig);
                   } else { // Polyline
                       currentShape.current = new fabric.Polyline([point], shapeConfig);
                   }
                   canvas!.add(currentShape.current);
              } else {
                  // Subsequent points for the current shape instance
                  if (currentShape.current) {
                      (currentShape.current as fabric.Polygon | fabric.Polyline).set({ points: points.current });
                      currentShape.current.setCoords();
                  }
              }

              // Draw temporary guide lines (visual feedback)
               if (points.current.length > 1) {
                   const prevPoint = points.current[points.current.length - 2];
                   const lineToCurrent = new fabric.Line([prevPoint.x, prevPoint.y, point.x, point.y], { stroke: 'rgba(100,100,100,0.5)', strokeWidth: 1, selectable: false, evented: false });
                   tempLines.current.push(lineToCurrent);
                   canvas!.add(lineToCurrent);

                   if (shapeType === 'Polygon' && points.current.length > 1) {
                       const startP = points.current[0];
                       const lineToStart = new fabric.Line([point.x, point.y, startP.x, startP.y], { stroke: 'rgba(100,100,100,0.5)', strokeWidth: 1, strokeDashArray: [5, 5], selectable: false, evented: false });
                       tempLines.current.push(lineToStart);
                       canvas!.add(lineToStart);
                   }
               }
              canvas!.requestRenderAll();
         };

         const handleDoubleClick = () => {
             if (shapeType !== 'Triangle') { // Triangle finishes on 3rd click
                finalizeShape(); // Finalize the current shape and reset state for the next one
             }
         };

         // Attach listeners only once when tool is activated
         canvas!.on("mouse:down", handleMouseDown);
         if (shapeType !== 'Triangle') {
            canvas!.on("mouse:dblclick", handleDoubleClick);
         }
    };

    // Star Tool (Continuous Drawing)
    const activateStar = () => {
         if (!initializeDrawingTool()) return;

         const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
             if (isDrawing.current) return;
             startPoint.current = canvas!.getPointer(opt.e);
             isDrawing.current = true;
             // No persistent shape needed during drag for star (created on mouseup)
         };

         const handleMouseUp = (opt: fabric.IEvent<MouseEvent>) => {
             if (!isDrawing.current || !startPoint.current) return;

             const endPoint = canvas!.getPointer(opt.e);
             const width = Math.abs(endPoint.x - startPoint.current.x);
             const height = Math.abs(endPoint.y - startPoint.current.y);

             if (width < 3 && height < 3) { // Ignore tiny drags
                 console.log("Star cancelled - too small.");
                 isDrawing.current = false; // Reset drawing flag
                 startPoint.current = null;
                 // No need to call resetDrawingState() as no shape was finalized
                 return;
             }

             const radius = Math.max(width, height) / 2;
             const centerX = (startPoint.current.x + endPoint.x) / 2;
             const centerY = (startPoint.current.y + endPoint.y) / 2;

             const starPoints = [];
             const numPoints = 5;
             for (let i = 0; i < numPoints * 2; i++) {
                 const angle = (Math.PI / numPoints) * i - Math.PI / 2;
                 const R = i % 2 === 0 ? radius : radius / 2;
                 starPoints.push({ x: R * Math.cos(angle), y: R * Math.sin(angle) });
             }

             const star = new fabric.Polygon(starPoints, {
                 left: centerX, top: centerY, originX: 'center', originY: 'center',
                 stroke: foregroundColor, strokeWidth: pencilWidth, fill: backgroundColor,
                 strokeUniform: true, selectable: false, // Will be set true in resetDrawingState
                 objectCaching: false,
             });
             canvas!.add(star);
             currentShape.current = star; // Assign to currentShape before reset
             console.log("Star drawn");

             // Reset for the next star, keep tool active
             resetDrawingState();
         };

         canvas!.on("mouse:down", handleMouseDown);
         canvas!.on("mouse:up", handleMouseUp);
    };

    // Image Tool (Continuous Placement)
    const activateImage = (imageUrl = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Click%20to%20place') => {
         if (!initializeDrawingTool('copy')) return;

         const handleMouseUp = (opt: fabric.IEvent<MouseEvent>) => {
             const pointer = canvas!.getPointer(opt.e);

             // Add image on mouse:up (represents the click action)
             fabric.Image.fromURL(imageUrl, (img) => {
                 if (!img) { console.error("Failed to load image"); return; } // Don't reset state if load fails
                 img.set({
                     left: pointer.x, top: pointer.y, originX: 'center', originY: 'center',
                     selectable: false, // Will be set true in resetDrawingState
                     objectCaching: false,
                     // crossOrigin: 'anonymous'
                 });
                 canvas!.add(img);
                 currentShape.current = img; // Assign to currentShape before reset
                 console.log("Image placed");

                 // Reset state for next placement, keep tool active
                 resetDrawingState();

             }, { crossOrigin: 'anonymous' });
         };

         // Use mouse:up for placement
         canvas!.on("mouse:up", handleMouseUp);
    };

    // Text Tool (Continuous Placement)
    const activateTextTool = () => {
         if (!initializeDrawingTool('text')) return;

         const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
              // Place text on mousedown
             const pointer = canvas!.getPointer(opt.e);

             const textbox = new fabric.Textbox("Enter text", {
                 left: pointer.x, top: pointer.y, originX: 'left', originY: 'top',
                 width: 150, fontSize: 24, // TODO: Use context values
                 fill: foregroundColor, fontFamily: "Arial", // TODO: Use context values
                 selectable: true, // Make selectable immediately
                 hasControls: true, editable: true, objectCaching: true, // Cache immediately
                 strokeUniform: true,
             });

             canvas!.add(textbox);
             canvas!.setActiveObject(textbox); // Select it
             textbox.enterEditing(); // Enter editing mode
             textbox.selectAll(); // Select default text

             console.log("Text placed");

             // No persistent drawing state needed between text placements,
             // but keep the tool active (listeners attached, selection disabled globally)
             // No need to call resetDrawingState() here as text creation is atomic
         };

         // Attach listener
         canvas!.on("mouse:down", handleMouseDown);
    };


    // --- Return Tool Definitions ---
    return [
        // Add Select tool first
        { icon: <Square />, toolName: "Rectangle", function: activateRectangle, function_args: [] },
        { icon: <Circle />, toolName: "Ellipse", function: activateEllipse, function_args: [] },
        { icon: <Slash />, toolName: "Line", function: activateLine, function_args: [] },
        { icon: <TriangleIcon />, toolName: "Triangle", function: () => activateMultiClickShape('Triangle'), function_args: [] },
        { icon: <Spline />, toolName: "Polygon", function: () => activateMultiClickShape('Polygon'), function_args: [] },
        { icon: <Spline style={{ transform: 'rotate(90deg)' }}/>, toolName: "Polyline", function: () => activateMultiClickShape('Polyline'), function_args: [] },
        { icon: <Star />, toolName: "Star", function: activateStar, function_args: [] },
        { icon: <CaseSensitive />, toolName: "Text", function: activateTextTool, function_args: [] },
    ];
}