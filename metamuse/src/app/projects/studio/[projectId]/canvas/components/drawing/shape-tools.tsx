import {
  Square,
  Circle,
  Slash,
  Triangle as TriangleIcon,
  Star,
  Image as ImageIcon,
  Spline,
  CaseSensitive,
  MousePointer2,
} from "lucide-react"; // Added MousePointer2 for Select
import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";
import { useRef, useEffect } from "react"; // Added useEffect for context changes
import { useCanvasSync } from "../contexts/canvas-sync-context";

export function useShapeTools() {
  // Get canvas instance and styling properties from context
  // These values from context will always be the latest when used inside event handlers
  const {
    canvas,
    foregroundColor,
    pencilWidth,
    backgroundColor,
    fontSize,
    fontStyle,
    isBold,
    isItalic,
    isStrikethrough,
    isUnderline,
    isSubscript,
    isSuperscript,
    isShape,
    setIsShape,
  } = useCanvas();
 const { updateYjsObject } = useCanvasSync()
  // Refs for temporary drawing state
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const currentShape = useRef<fabric.Object | null>(null);
  const points = useRef<{ x: number; y: number }[]>([]); // For multi-point shapes
  const tempLines = useRef<fabric.Line[]>([]); // For polygon/polyline guides
  const activeToolRef = useRef<string | null>(null); // Track active tool

  // --- Effect for context value changes ---
  useEffect(() => {
    if (!canvas) return;

    // 1. Update current drawing shape if it exists
    if (currentShape.current && isShape) {
      // Update style properties based on shape type
      if (
        currentShape.current instanceof fabric.Rect ||
        currentShape.current instanceof fabric.Circle ||
        currentShape.current instanceof fabric.Ellipse ||
        currentShape.current instanceof fabric.Line ||
        currentShape.current instanceof fabric.Triangle ||
        currentShape.current instanceof fabric.Polygon ||
        currentShape.current instanceof fabric.Polyline
      ) {
        currentShape.current.set({
          stroke: foregroundColor,
          strokeWidth: pencilWidth,
          fill: backgroundColor,
        });

        canvas.requestRenderAll();
      } else if (currentShape.current instanceof fabric.Textbox) {
        currentShape.current.set({
          fill: foregroundColor,
          fontSize: fontSize,
          fontFamily: fontStyle,
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          underline: isUnderline,
          linethrough: isStrikethrough,
          superscript: isSuperscript,
          subscript: isSubscript,
        });

        canvas.requestRenderAll();
      }
    }

    // 2. Update selected objects' style if they match the active tool type
    const selectedObjects = canvas.getActiveObjects();
    if (selectedObjects.length > 0) {
      if (selectedObjects.length > 0 && isShape && activeToolRef.current) {
        // Only update properties when actively using a shape tool
        selectedObjects.forEach((obj) => {
          if (
            obj instanceof fabric.Textbox &&
            activeToolRef.current === "Text"
          ) {
            obj.set({
              fill: foregroundColor,
              fontSize: fontSize,
              fontFamily: fontStyle,
              fontWeight: isBold ? "bold" : "normal",
              fontStyle: isItalic ? "italic" : "normal",
              underline: isUnderline,
              linethrough: isStrikethrough,
              superscript: isSuperscript,
              subscript: isSubscript,
            });
          } else if (
            (obj instanceof fabric.Rect ||
              obj instanceof fabric.Circle ||
              obj instanceof fabric.Ellipse ||
              obj instanceof fabric.Line ||
              obj instanceof fabric.Triangle ||
              obj instanceof fabric.Polygon ||
              obj instanceof fabric.Polyline) &&
            [
              "Rectangle",
              "Ellipse",
              "Line",
              "Triangle",
              "Polygon",
              "Polyline",
              "Star",
            ].includes(activeToolRef.current as string)
          ) {
            obj.set({
              stroke: foregroundColor,
              strokeWidth: pencilWidth,
              fill: backgroundColor,
            });
          }
        });
        canvas.requestRenderAll();
      }
    }
  }, [
    canvas,
    foregroundColor,
    pencilWidth,
    backgroundColor,
    fontSize,
    fontStyle,
    isBold,
    isItalic,
    isStrikethrough,
    isUnderline,
    isSubscript,
    isSuperscript,
  ]);

  // --- Cleanup & Initialization ---

  // Full cleanup: Removes listeners, resets state, enables selection
  const cleanupToolEventListeners = () => {
    if (!canvas) return;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:dblclick");
    setIsShape(false); // Reset shape mode

    isDrawing.current = false;
    startPoint.current = null;
    currentShape.current = null;
    points.current = [];
    // Clear temporary guide lines if any
    tempLines.current.forEach((line) => canvas.remove(line));
    tempLines.current = [];
    activeToolRef.current = null;

    canvas.defaultCursor = "default";
    canvas.selection = true; // Enable object selection
    canvas.forEachObject((o) => (o.selectable = true)); // Make objects selectable
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
      updateYjsObject(currentShape.current) // Update Yjs object
    }
    // Clear temporary guide lines
    tempLines.current.forEach((line) => canvas.remove(line));
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
  const initializeDrawingTool = (cursorType = "crosshair", toolName = "") => {
    if (!canvas) return false;
    cleanupToolEventListeners(); // Clean up any previous tool COMPLETELY
    canvas.defaultCursor = cursorType;
    canvas.selection = false; // Disable selecting objects while drawing
    setIsShape(true); // Set shape mode to true
    canvas.forEachObject((o) => (o.selectable = false)); // Make existing objects non-selectable
    activeToolRef.current = toolName; // Store active tool name
    console.log(`Tool initialized with cursor: ${cursorType}`);
    return true;
  };

  // Now add a new useEffect to monitor property changes and reinitialize the active tool
  // This ensures that when properties change, the tool is "reset" to use the new values

  useEffect(() => {
    // Only run this effect if there's an active tool
    if (!canvas || !activeToolRef.current) return;

    const currentTool = activeToolRef.current;
    console.log(
      `Properties changed while using ${currentTool} tool - reinitializing drawer`
    );

    // Briefly store and restore tool state
    const wasDrawing = isDrawing.current;

    // If not actively drawing a shape, reinitialize the tool to pick up new properties
    if (!wasDrawing) {
      // For multi-click tools, we might want to preserve points, but for simplicity,
      // we'll just reinitialize everything if not actively drawing
      if (isShape) {
        switch (currentTool) {
          case "Rectangle":
            activateRectangle();
            break;
          case "Ellipse":
            activateEllipse();
            break;
          case "Line":
            activateLine();
            break;
          case "Triangle":
            activateTriangle();
            break;
          case "Polygon":
            activateMultiClickShape("Polygon");
            break;
          case "Polyline":
            activateMultiClickShape("Polyline");
            break;
          case "Star":
            activateStar();
            break;
          case "Text":
            activateTextTool();
            break;
          default:
            // No active tool to reinitialize
            break;
        }
      }
    }
  }, [
    foregroundColor,
    pencilWidth,
    backgroundColor,
    fontSize,
    fontStyle,
    isBold,
    isItalic,
    isStrikethrough,
    isUnderline,
    isSubscript,
    isSuperscript,
  ]);
  // --- Tool Activation Functions ---

  // Rectangle Tool (Continuous Drawing)
  const activateRectangle = () => {
    if (!initializeDrawingTool("crosshair", "Rectangle")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      if (isDrawing.current) return; // Prevent starting new shape if already drawing
      const pointer = canvas!.getScenePoint(opt.e);
      startPoint.current = { x: pointer.x, y: pointer.y };
      isDrawing.current = true;

      const rect = new fabric.Rect({
        left: startPoint.current.x,
        top: startPoint.current.y,
        width: 0,
        height: 0,
        stroke: foregroundColor, // Uses latest context value
        strokeWidth: pencilWidth, // Uses latest context value
        fill: backgroundColor, // Uses latest context value for fill
        strokeUniform: true,
        selectable: false,
        erasable: "deep",
        objectCaching: false, // Cache after creation
      });
      currentShape.current = rect;
      canvas!.add(rect);
    };

    const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing.current || !startPoint.current || !currentShape.current)
        return;
      const pointer = canvas!.getScenePoint(opt.e);
      const rect = currentShape.current as fabric.Rect;
      const left = Math.min(pointer.x, startPoint.current.x);
      const top = Math.min(pointer.y, startPoint.current.y);
      const width = Math.abs(pointer.x - startPoint.current.x);
      const height = Math.abs(pointer.y - startPoint.current.y);
      rect.set({
        left,
        top,
        width,
        height,
        stroke: foregroundColor, // Always use latest context values
        strokeWidth: pencilWidth,
        fill: backgroundColor,
      });
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
    if (!initializeDrawingTool("crosshair", "Ellipse")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      if (isDrawing.current) return;
      const pointer = canvas!.getScenePoint(opt.e);
      startPoint.current = { x: pointer.x, y: pointer.y };
      isDrawing.current = true;
      const ellipse = new fabric.Ellipse({
        left: startPoint.current.x,
        top: startPoint.current.y,
        rx: 0,
        ry: 0,
        stroke: foregroundColor,
        strokeWidth: pencilWidth,
        fill: backgroundColor,
        strokeUniform: true,
        selectable: false,
        erasable: "deep",
        originX: "center",
        originY: "center",
        objectCaching: false,
      });
      currentShape.current = ellipse;
      canvas!.add(ellipse);
    };
    const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing.current || !startPoint.current || !currentShape.current)
        return;
      const pointer = canvas!.getScenePoint(opt.e);
      const ellipse = currentShape.current as fabric.Ellipse;
      const rx = Math.abs(pointer.x - startPoint.current.x) / 2;
      const ry = Math.abs(pointer.y - startPoint.current.y) / 2;
      const centerX = (pointer.x + startPoint.current.x) / 2;
      const centerY = (pointer.y + startPoint.current.y) / 2;
      ellipse.set({
        left: centerX,
        top: centerY,
        rx,
        ry,
        stroke: foregroundColor, // Always use latest context values
        strokeWidth: pencilWidth,
        fill: backgroundColor,
      });
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
    if (!initializeDrawingTool("crosshair", "Line")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      if (isDrawing.current) return;
      const pointer = canvas!.getScenePoint(opt.e);
      startPoint.current = { x: pointer.x, y: pointer.y };
      isDrawing.current = true;
      const line = new fabric.Line(
        [
          startPoint.current.x,
          startPoint.current.y,
          startPoint.current.x,
          startPoint.current.y,
        ],
        {
          stroke: foregroundColor,
          strokeWidth: pencilWidth,
          selectable: false,
          objectCaching: false,
          erasable: "deep",
        }
      );
      currentShape.current = line;
      canvas!.add(line);
    };
    const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing.current || !currentShape.current) return;
      const pointer = canvas!.getScenePoint(opt.e);
      const line = currentShape.current as fabric.Line;
      line.set({
        x2: pointer.x,
        y2: pointer.y,
        stroke: foregroundColor, // Always use latest context values
        strokeWidth: pencilWidth,
      });
      canvas!.requestRenderAll();
    };
    const handleMouseUp = () => {
      if (!isDrawing.current || !currentShape.current) return;
      const finalLine = currentShape.current as fabric.Line;
      if (
        Math.abs(finalLine.x1! - finalLine.x2!) < 1 &&
        Math.abs(finalLine.y1! - finalLine.y2!) < 1
      ) {
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
    if (!initializeDrawingTool("crosshair", "Triangle")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      if (isDrawing.current) return;
      const pointer = canvas!.getScenePoint(opt.e);
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
        erasable: "deep",
        objectCaching: false,
      });
      currentShape.current = triangle;
      canvas!.add(triangle);
    };

    const handleMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing.current || !startPoint.current || !currentShape.current)
        return;
      const pointer = canvas!.getScenePoint(opt.e);
      const triangle = currentShape.current as fabric.Triangle;

      const left = Math.min(pointer.x, startPoint.current.x);
      const top = Math.min(pointer.y, startPoint.current.y);
      const width = Math.abs(pointer.x - startPoint.current.x);
      const height = Math.abs(pointer.y - startPoint.current.y);

      triangle.set({
        left,
        top,
        width,
        height,
        stroke: foregroundColor, // Always use latest context values
        strokeWidth: pencilWidth,
        fill: backgroundColor,
      });
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
  const activateMultiClickShape = (
    shapeType: "Polygon" | "Polyline" | "Triangle"
  ) => {
    if (!initializeDrawingTool("crosshair", shapeType)) return; // Use generic init

    // State specific to multi-click drawing session (refs from outer scope are used)
    // isDrawing, points, currentShape, tempLines are already refs

    const removeTempLines = () => {
      tempLines.current.forEach((line) => canvas!.remove(line));
      tempLines.current = [];
    };

    // This function finalizes ONE shape instance
    const finalizeShape = () => {
      removeTempLines(); // Clear guides first
      const finalShape = currentShape.current;
      const finalPoints = points.current; // Use points collected for this shape

      // Validation
      const minPoints =
        shapeType === "Triangle" ? 3 : shapeType === "Polygon" ? 3 : 2;
      if (!finalShape || finalPoints.length < minPoints) {
        if (finalShape) canvas?.remove(finalShape); // Remove incomplete
        console.log(`${shapeType} cancelled - not enough points.`);
      } else {
        console.log(`${shapeType} finished`);
        finalShape.set({
          points: finalPoints,
          selectable: true,
          hasBorders: true,
          hasControls: true,
          erasable: "deep",
          objectCaching: true,
          stroke: foregroundColor, // Always use latest context values
          strokeWidth: pencilWidth,
          fill: shapeType === "Polyline" ? "" : backgroundColor,
        });
        if (
          finalShape instanceof fabric.Polygon &&
          shapeType === "Triangle" &&
          finalPoints.length > 3
        ) {
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

      const pointer = canvas!.getScenePoint(opt.e);
      const point = { x: pointer.x, y: pointer.y };

      // Triangle specific: Finish after 3 points
      if (shapeType === "Triangle" && points.current.length >= 2) {
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
          stroke: foregroundColor,
          strokeWidth: pencilWidth,
          fill: shapeType === "Polyline" ? "" : backgroundColor,
          strokeUniform: true,
          objectCaching: false,
          selectable: false,
          hasBorders: false,
          hasControls: false,
        };
        if (shapeType === "Polygon" || shapeType === "Triangle") {
          currentShape.current = new fabric.Polygon([point], shapeConfig);
        } else {
          // Polyline
          currentShape.current = new fabric.Polyline([point], shapeConfig);
        }
        canvas!.add(currentShape.current);
      } else {
        // Subsequent points for the current shape instance
        if (currentShape.current) {
          (currentShape.current as fabric.Polygon | fabric.Polyline).set({
            points: points.current,
            stroke: foregroundColor, // Always use latest context values
            strokeWidth: pencilWidth,
            fill: shapeType === "Polyline" ? "" : backgroundColor,
          });
          currentShape.current.setCoords();
        }
      }

      // Draw temporary guide lines (visual feedback)
      if (points.current.length > 1) {
        const prevPoint = points.current[points.current.length - 2];
        const lineToCurrent = new fabric.Line(
          [prevPoint.x, prevPoint.y, point.x, point.y],
          {
            stroke: "rgba(100,100,100,0.5)",
            strokeWidth: 1,
            selectable: false,
            evented: false,
          }
        );
        tempLines.current.push(lineToCurrent);
        canvas!.add(lineToCurrent);

        if (shapeType === "Polygon" && points.current.length > 1) {
          const startP = points.current[0];
          const lineToStart = new fabric.Line(
            [point.x, point.y, startP.x, startP.y],
            {
              stroke: "rgba(100,100,100,0.5)",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
            }
          );
          tempLines.current.push(lineToStart);
          canvas!.add(lineToStart);
        }
      }
      canvas!.requestRenderAll();
    };

    const handleDoubleClick = () => {
      if (shapeType !== "Triangle") {
        // Triangle finishes on 3rd click
        finalizeShape(); // Finalize the current shape and reset state for the next one
      }
    };

    // Attach listeners only once when tool is activated
    canvas!.on("mouse:down", handleMouseDown);
    if (shapeType !== "Triangle") {
      canvas!.on("mouse:dblclick", handleDoubleClick);
    }
  };

  // Star Tool (Continuous Drawing)
  const activateStar = () => {
    if (!initializeDrawingTool("crosshair", "Star")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      if (isDrawing.current) return;
      startPoint.current = canvas!.getScenePoint(opt.e);
      isDrawing.current = true;
      // No persistent shape needed during drag for star (created on mouseup)
    };

    const handleMouseUp = (opt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing.current || !startPoint.current) return;

      const endPoint = canvas!.getScenePoint(opt.e);
      const width = Math.abs(endPoint.x - startPoint.current.x);
      const height = Math.abs(endPoint.y - startPoint.current.y);

      if (width < 3 && height < 3) {
        // Ignore tiny drags
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
        left: centerX,
        top: centerY,
        originX: "center",
        originY: "center",
        stroke: foregroundColor,
        strokeWidth: pencilWidth,
        erasable: "deep",
        fill: backgroundColor,
        strokeUniform: true,
        selectable: false, // Will be set true in resetDrawingState
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

  // Text Tool (Continuous Placement)
  const activateTextTool = () => {
    if (!initializeDrawingTool("text", "Text")) return;

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
      // Place text on mousedown
      const pointer = canvas!.getScenePoint(opt.e);

      const textbox = new fabric.Textbox("Enter text", {
        left: pointer.x,
        top: pointer.y,
        originX: "left",
        originY: "top",
        width: 150,
        fontSize: fontSize,
        fill: foregroundColor,
        fontFamily: fontStyle,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        underline: isUnderline,
        linethrough: isStrikethrough,
        superscript: isSuperscript,
        subscript: isSubscript,
        selectable: true, // Make selectable immediately
        hasControls: true,
        editable: true,
        erasable: "deep",
        objectCaching: true, // Cache immediately
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
    {
      icon: <Square />,
      toolName: "Rectangle",
      function: activateRectangle,
      function_args: [],
    },
    {
      icon: <Circle />,
      toolName: "Ellipse",
      function: activateEllipse,
      function_args: [],
    },
    {
      icon: <Slash />,
      toolName: "Line",
      function: activateLine,
      function_args: [],
    },
    {
      icon: <TriangleIcon />,
      toolName: "Triangle",
      function: activateTriangle,
      function_args: [],
    },
    {
      icon: <Spline />,
      toolName: "Polygon",
      function: () => activateMultiClickShape("Polygon"),
      function_args: [],
    },
    {
      icon: <Spline style={{ transform: "rotate(90deg)" }} />,
      toolName: "Polyline",
      function: () => activateMultiClickShape("Polyline"),
      function_args: [],
    },
    {
      icon: <Star />,
      toolName: "Star",
      function: activateStar,
      function_args: [],
    },
    {
      icon: <CaseSensitive />,
      toolName: "Text",
      function: activateTextTool,
      function_args: [],
    },
  ];
}
