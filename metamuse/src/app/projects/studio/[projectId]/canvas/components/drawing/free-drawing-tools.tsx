import { useEffect, useState } from "react";
import { Pencil, Brush, Eraser, PenTool, Tangent } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";

export function useFreeDrawingTools() {
  const { canvas, setEraser, backgroundColor, pencilWidth, eraserWidth, foregroundColor, isEraser } = useCanvas();
  const [isPaint, setPaint] = useState(false)

  // General setup/cleanup for path editing (should ideally run once or be part of select tool logic)
  useEffect(() => {
    if (!canvas) return;

    const makePathEditable = (opt) => {
      const obj = opt.target;
      // Make paths editable upon selection
      if (obj && obj.type === 'path' && !obj.isEditing) { // Add isEditing flag
         // Disable selection styles while editing maybe?
         // obj.set({
         //   borderColor: 'gray',
         //   cornerColor: 'black',
         //   cornerStyle: 'circle',
         //   transparentCorners: false,
         //   hasBorders: true,
         //   hasControls: true // Use default controls for path editing
         // });
        obj.set({ editable: true });
        obj.isEditing = true; // Mark as editing
        console.log("Path set to editable", obj);
        canvas.renderAll();

        // Custom handling for path editing might go here if needed
      }
    };

    const makePathStatic = (opt) => {
        // Deactivate path editing when deselected
       const obj = opt.deselected?.[0] || opt.target; // Handle deselection events
       if (obj && obj.type === 'path' && obj.isEditing) {
         console.log("Path set to static", obj);
         obj.set({ editable: false });
         obj.isEditing = false; // Unmark
         // Restore normal selection styles if needed
         // obj.set({ hasBorders: true, hasControls: true });
         canvas.renderAll();
       }
    };

    // --- Event Listeners for Path Editing ---
    // Note: These listeners might conflict if other tools heavily rely on selection events.
    // Consider activating/deactivating these based on the *currently selected tool* (e.g., only active for a 'Select/Edit' tool).
    canvas.on("selection:created", makePathEditable);
    canvas.on("selection:updated", makePathEditable);
    canvas.on("selection:cleared", makePathStatic); // Use selection:cleared for deselection


    // Cleanup these general listeners
    return () => {
      if (canvas) {
         canvas.off("selection:created", makePathEditable);
         canvas.off("selection:updated", makePathEditable);
         canvas.off("selection:cleared", makePathStatic);
      }
    };

  }, [canvas]);

  useEffect(() => {
    if (!canvas) return
    if (canvas.isDrawingMode && !isEraser) {
      if (canvas.freeDrawingBrush) {
        if (isPaint) {
          canvas.freeDrawingBrush.width = pencilWidth * 2
        } else {
          canvas.freeDrawingBrush.width = pencilWidth
        }
      }
    }

  }, [pencilWidth])

  useEffect(() => {
    if (!canvas) return
    if (canvas.isDrawingMode && !isEraser) {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = foregroundColor
      }
    }
    if (canvas.isDrawingMode && isEraser) {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = backgroundColor === "transparent" ? "white" : backgroundColor
      }
    }
  }
  , [foregroundColor, backgroundColor])

  useEffect(() => {
    if (!canvas) return
      if (canvas.freeDrawingBrush) {
        if (isEraser) {
          canvas.freeDrawingBrush.width = eraserWidth
        }
      }
      console.log("Current Eraser", eraserWidth)

  }, [eraserWidth])


  // Function to remove listeners added by specific tools
  const cleanupToolEventListeners = () => {
    if (!canvas) return;
    // Turn off drawing mode and remove common drawing/path listeners
    canvas.isDrawingMode = false;
    setPaint(false)
    setEraser(false)
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:dblclick"); // Important for Pen tool cleanup
    canvas.defaultCursor = "default"; // Reset cursor
    // Ensure objects are generally selectable unless a specific tool changes it
    canvas.selection = true;
    canvas.forEachObject(o => o.selectable = true);
  };

  // --- Tool Activation Functions ---

  // Pencil Tool - Basic freehand drawing
  const activatePencilTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = foregroundColor;
    canvas.freeDrawingBrush.width = pencilWidth;
    canvas.defaultCursor = "crosshair";
  };

  // Brush Tool - Softer feel using shadow and round caps
  const activateBrushTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = foregroundColor;
    canvas.freeDrawingBrush.width = pencilWidth * 2; // Example: thicker brush
    canvas.freeDrawingBrush.strokeLineCap = "round";
    canvas.freeDrawingBrush.strokeLineJoin = "round";
    // Add shadow for a softer effect
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: Math.max(pencilWidth * 0.5, 2), // Blur based on width
      offsetX: 1,
      offsetY: 1,
      color: 'rgba(0,0,0,0.3)' // Adjust shadow color/opacity
    });
    canvas.defaultCursor = "crosshair";
    setPaint(true)
  };

  // Eraser Tool - Using fabric.EraserBrush
  const activateEraser = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = true;
    // Note: EraserBrush might be experimental or require specific Fabric.js versions/builds
    // if (fabric.EraserBrush) {
    //   canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    //   canvas.freeDrawingBrush.width = eraserWidth;
    // } else {
      console.warn("fabric.EraserBrush not available. Falling back to background color painting.");
      // Fallback to painting with background color
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = backgroundColor === "transparent" ? "white" : backgroundColor;
      canvas.freeDrawingBrush.width = eraserWidth;
      // = fallbackEraser; // Use the fallback eraser brush
      setEraser(true)
    // }
    canvas.defaultCursor = "crosshair"; // Or a specific eraser cursor
  };

  // Pen Tool - Click to add points (lines), double-click to finish
  const activatePenTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = false; // Disable free drawing mode
    canvas.selection = false; // Disable selection while drawing path
    canvas.defaultCursor = "crosshair";
    canvas.forEachObject(o => o.selectable = false); // Make existing objects non-selectable

    let isDrawing = false;
    let currentPath: fabric.Path | null = null;
    let points: number[] = []; // Store points as [x1, y1, x2, y2, ...]

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      const pointer = canvas.getPointer(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      // Double click finishes the path
      if (opt.e.detail === 2) {
         if (isDrawing && currentPath) {
            // Remove the last L command if it's the same as the previous point (common on dblclick)
            // Or handle path finalization logic if needed
            console.log("Path finished by double click.", currentPath.path);
         }
         isDrawing = false;
         currentPath = null;
         points = [];
         // Re-enable selection after finishing
         canvas.selection = true;
         canvas.defaultCursor = "default";
         canvas.forEachObject(o => o.selectable = true);
         canvas.off("mouse:down", handleMouseDown); // Detach listener specific to this tool instance
         canvas.off("mouse:dblclick", handleDoubleClick); // Detach listener specific to this tool instance
         return;
      }

      // --- Single Click Logic ---
      if (!isDrawing) {
        // Start of a new path
        isDrawing = true;
        points = [x, y];
        const pathData = `M ${x} ${y}`; // Start with Move command

        currentPath = new fabric.Path(pathData, {
          stroke: foregroundColor,
          strokeWidth: pencilWidth,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          fill: '', // No fill for open paths usually
          objectCaching: false,
          selectable: true, // Path itself should be selectable *after* creation
          hasControls: false, // Use path editing controls when selected later
          hasBorders: true,
          // Mark this path as potentially editable later
           isEditing: false, // Flag to track editing state
        });
        canvas.add(currentPath);
        console.log("Path started", currentPath);
      } else {
        // Add a new line segment to the existing path
        if (currentPath && points.length >= 2) {
           // Check if the new point is different from the last one
           const lastX = points[points.length - 2];
           const lastY = points[points.length - 1];
           if (x !== lastX || y !== lastY) {
              // Append Line command
              currentPath.path!.push(['L', x, y]);
              points.push(x, y);
              // Path objects need explicit rendering after modification
              currentPath.setCoords(); // Recalculate coordinates
              canvas.requestRenderAll(); // Request repaint
              console.log("Point added", currentPath.path);
           }
        }
      }
    };

     // Separate handler for double click to ensure it fires correctly
     const handleDoubleClick = (opt: fabric.IEvent<MouseEvent>) => {
      console.log("Double click detected");
      if (isDrawing && currentPath) {
         // Finalize logic if any specific action needed on dblclick finish
      }
      isDrawing = false;
      currentPath = null;
      points = [];
      // Re-enable selection after finishing
      canvas.selection = true;
      canvas.defaultCursor = "default";
      canvas.forEachObject(o => o.selectable = true);
      canvas.off("mouse:down", handleMouseDown); // Detach listener specific to this tool instance
      canvas.off("mouse:dblclick", handleDoubleClick); // Detach listener specific to this tool instance
     };


    // Attach PEN TOOL specific listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:dblclick", handleDoubleClick); // Use dedicated dblclick listener

    // Note: No mouse:move needed for simple line segments on click
    // Note: No mouse:up needed explicitly here unless handling drag for Bezier (which we removed)
  };


  // Removed activatePathEditingTool as its logic is integrated into general selection handling

  return [
    { icon: <Pencil />, toolName: "Pencil", function: activatePencilTool, function_args: [] },
    { icon: <Brush />, toolName: "Brush", function: activateBrushTool, function_args: [] },
    { icon: <Eraser />, toolName: "Eraser", function: activateEraser, function_args: [] },
    { icon: <PenTool />, toolName: "Pen", function: activatePenTool, function_args: [] },
    // Removed the Bezier/Tangent tool as editing is now part of path selection
    // { icon: <Tangent />, toolName: "Edit Path", function: ???, function_args: [] }, // Could add an explicit "Edit" tool later
  ];
}