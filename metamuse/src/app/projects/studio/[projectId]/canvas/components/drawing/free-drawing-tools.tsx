import { useEffect, useState } from "react";
import { Pencil, Brush, Eraser, PenTool, Tangent, PencilLine } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";
import { EraserBrush, ClippingGroup } from "@erase2d/fabric";

export function useFreeDrawingTools() {
  const {
    canvas,
    setEraser,
    backgroundColor,
    pencilWidth,
    eraserWidth,
    foregroundColor,
    isEraser,
    brushType,
  } = useCanvas();
  const [isPaint, setPaint] = useState(false);

  // General setup/cleanup for path editing (should ideally run once or be part of select tool logic)
  useEffect(() => {
    if (!canvas) return;

    const makePathEditable = (opt) => {
      const obj = opt.target;
      // Make paths editable upon selection
      if (obj && obj.type === "path" && !obj.isEditing) {
        obj.set({ editable: true });
        obj.isEditing = true; // Mark as editing
        console.log("Path set to editable", obj);
        canvas.renderAll();
      }
    };

    const makePathStatic = (opt) => {
      // Deactivate path editing when deselected
      const obj = opt.deselected?.[0] || opt.target; // Handle deselection events
      if (obj && obj.type === "path" && obj.isEditing) {
        console.log("Path set to static", obj);
        obj.set({ editable: false });
        obj.isEditing = false; // Unmark
        canvas.renderAll();
      }
    };

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

  // Function to create and configure a brush based on the current brushType
  const getBrush = (canvas) => {
    let resolvedBrush;
    switch (brushType) {
      case "pencil": {
        resolvedBrush = new fabric.PencilBrush(canvas);
        resolvedBrush.color = foregroundColor;
        resolvedBrush.width = pencilWidth;
        break;
      }
      case "brush": {
        resolvedBrush = new fabric.PencilBrush(canvas);
        resolvedBrush.color = foregroundColor;
        resolvedBrush.width = pencilWidth * 2; // Example: thicker brush
        resolvedBrush.strokeLineCap = "round";
        resolvedBrush.strokeLineJoin = "round";
        resolvedBrush.shadow = new fabric.Shadow({
          blur: Math.max(pencilWidth * 0.5, 2), // Blur based on width
          offsetX: 1,
          offsetY: 1,
          color: "rgba(0,0,0,0.3)", // Adjust shadow color/opacity
        });
        canvas.defaultCursor = "crosshair";
        setPaint(true);
        break;
      }
      case "pattern": {
        resolvedBrush = new fabric.PatternBrush(canvas);
        resolvedBrush.color = foregroundColor;
        resolvedBrush.width = pencilWidth;
        break;
      }
      case "spray": {
        resolvedBrush = new fabric.SprayBrush(canvas);
        resolvedBrush.color = foregroundColor;
        resolvedBrush.width = pencilWidth;
        break;
      }
      case "circle": {
        resolvedBrush = new fabric.CircleBrush(canvas);
        resolvedBrush.color = foregroundColor;
        resolvedBrush.width = pencilWidth;
        break;
      }
    }
    console.log("Resolved brush for", brushType, resolvedBrush);
    return resolvedBrush;
  };

  // Track changes to brushType and update the brush accordingly
  useEffect(() => {
    if (!canvas) return;
    if (canvas.isDrawingMode && !isEraser) {
      // Update the brush when brushType changes
      canvas.freeDrawingBrush = getBrush(canvas);
      canvas.renderAll();
    }
  }, [brushType, canvas, isEraser]);

  // Handle pencil width changes
  useEffect(() => {
    if (!canvas) return;
    if (canvas.isDrawingMode && !isEraser) {
      if (canvas.freeDrawingBrush) {
        if (isPaint) {
          canvas.freeDrawingBrush.width = pencilWidth * 2;
        } else {
          canvas.freeDrawingBrush.width = pencilWidth;
        }
      }
    }
  }, [pencilWidth, canvas, isEraser, isPaint]);

  // Handle color changes
  useEffect(() => {
    if (!canvas) return;
    if (canvas.isDrawingMode && !isEraser) {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = foregroundColor;
      }
    }
  }, [foregroundColor, backgroundColor, canvas, isEraser]);

  // Handle eraser width changes
  useEffect(() => {
    if (!canvas) return;
    if (canvas.freeDrawingBrush && isEraser) {
      canvas.freeDrawingBrush.width = eraserWidth;
      console.log("Current Eraser width:", eraserWidth);
    }
  }, [eraserWidth, canvas, isEraser]);

  // Function to remove listeners added by specific tools
  const cleanupToolEventListeners = () => {
    if (!canvas) return;
    // Turn off drawing mode and remove common drawing/path listeners
    canvas.isDrawingMode = false;
    setPaint(false);
    setEraser(false);
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:dblclick"); // Important for Pen tool cleanup
    canvas.defaultCursor = "default"; // Reset cursor
    // Ensure objects are generally selectable unless a specific tool changes it
    canvas.selection = true;
    canvas.forEachObject((o) => (o.selectable = true));
  };

  // --- Tool Activation Functions ---

  // Pencil Tool - Basic freehand drawing
  const activatePencilTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = getBrush(canvas);
    canvas.defaultCursor = "crosshair";
  };

  // Brush Tool - Softer feel using shadow and round caps
  const activateBrushTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = getBrush(canvas); // Use the getBrush function for consistency
    canvas.defaultCursor = "crosshair";
  };

  // Eraser Tool - Using fabric.EraserBrush
  const activateEraser = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    const eraser = new EraserBrush(canvas);
    eraser.width = eraserWidth; // Set eraser width
    setEraser(true);
    canvas.freeDrawingBrush = eraser;
    canvas.isDrawingMode = true;
    canvas.defaultCursor = "eraser"; // Or a specific eraser cursor
  };

  // Pen Tool - Click to add points (lines), double-click to finish
  const activatePenTool = () => {
    if (!canvas) return;
    cleanupToolEventListeners(); // Use specific cleanup
    canvas.isDrawingMode = false; // Disable free drawing mode
    canvas.selection = false; // Disable selection while drawing path
    canvas.defaultCursor = "crosshair";
    canvas.forEachObject((o) => (o.selectable = false)); // Make existing objects non-selectable

    let isDrawing = false;
    let currentPath = null;
    let points = []; // Store points as [x1, y1, x2, y2, ...]

    const handleMouseDown = (opt) => {
      const pointer = canvas.getScenePoint(opt.e);
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
        canvas.forEachObject((o) => (o.selectable = true));
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
          strokeLineCap: "round",
          strokeLineJoin: "round",
          fill: "", // No fill for open paths usually
          objectCaching: false,
          erasable: "deep",
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
            currentPath.path.push(["L", x, y]);
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
    const handleDoubleClick = (opt) => {
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
      canvas.forEachObject((o) => (o.selectable = true));
      canvas.off("mouse:down", handleMouseDown); // Detach listener specific to this tool instance
      canvas.off("mouse:dblclick", handleDoubleClick); // Detach listener specific to this tool instance
    };

    // Attach PEN TOOL specific listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:dblclick", handleDoubleClick); // Use dedicated dblclick listener
  };

  return [
    {
      icon: <PencilLine />,
      toolName: "Pencil",
      function: activatePencilTool,
      function_args: [],
    },
    {
      icon: <Brush />,  // Added Brush tool to the return array
      toolName: "Brush",
      function: activateBrushTool,
      function_args: [],
    },
    {
      icon: <Eraser />,
      toolName: "Eraser",
      function: activateEraser,
      function_args: [],
    },
    {
      icon: <PenTool />,
      toolName: "Pen",
      function: activatePenTool,
      function_args: [],
    },
  ];
}