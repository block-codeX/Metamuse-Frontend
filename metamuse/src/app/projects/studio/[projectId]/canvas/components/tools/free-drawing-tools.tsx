import { Pencil, Brush, Eraser, PenTool, Tangent } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../canvas-context";

export function useFreeDrawingTools() {
  const { canvas } = useCanvas();

  // Cleanup previous event listeners to avoid duplicates
  const cleanupEventListeners = () => {
    if (!canvas) return;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
  };

  // Pencil Tool - Basic freehand drawing
  const activatePencilTool = () => {
    if (!canvas) return;
    cleanupEventListeners();
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 2;
  };

  // Brush Tool - Correcting the `_render` method issue
  const activateBrushTool = () => {
    if (!canvas) return;
    cleanupEventListeners();
    canvas.isDrawingMode = true;

    const brush = new fabric.PencilBrush(canvas);
    brush.color = "black";
    brush.width = 5;
    brush.strokeLineCap = "round";
    brush.strokeLineJoin = "round";

    // Ensure ctx is valid before overriding the render method
    const originalRender = brush._render;
    brush._render = function (ctx) {
      if (!ctx) return; // Prevent "ctx is undefined" error

      ctx.lineCap = this.strokeLineCap;
      ctx.lineJoin = this.strokeLineJoin;
      ctx.lineWidth = this.width;

      if (this.decimate) {
        this._points = this._points.filter((_, i) => i % 2 === 0);
      }

      if (this._points.length >= 3) {
        const points = this._points;
        for (let i = 1; i < points.length - 1; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];

          ctx.lineWidth = this.width;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      } else {
        originalRender.call(this, ctx);
      }
    };

    canvas.freeDrawingBrush = brush;
  };

  // Eraser Tool
  const activateEraser = () => {
    if (!canvas) return;
    cleanupEventListeners();
    canvas.isDrawingMode = true;
    const eraser = new fabric.PencilBrush(canvas);
    eraser.color = canvas.backgroundColor || "white";
    eraser.width = 10;
    canvas.freeDrawingBrush = eraser;
  };

  const activatePenTool = () => {
    if (!canvas) return;
    cleanupEventListeners();
    canvas.isDrawingMode = false;
  
    let isDrawing = false;
    let points = [];
    let path = null;
    let activeControl = null;
  
    canvas.on("mouse:down", (opt) => {
      const pointer = canvas.getPointer(opt.e);
  
      // Stop drawing if double-clicked
      if (opt.e.detail === 2) {
        isDrawing = false;
        path = null;
        return;
      }
  
      // Right-click for curve manipulation
      if (opt.e.button === 2 && path) {
        activeControl = canvas.getActiveObject();
        return;
      }
  
      if (!isDrawing) {
        isDrawing = true;
        points = [pointer.x, pointer.y];
  
        path = new fabric.Path(`M ${pointer.x} ${pointer.y}`, {
          fill: "",
          stroke: "black",
          strokeWidth: 2,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          objectCaching: false,
        });
  
        canvas.add(path);
      } else {
        const lastPoint = {
          x: points[points.length - 2],
          y: points[points.length - 1],
        };
  
        const cp1x = lastPoint.x + (pointer.x - lastPoint.x) / 3;
        const cp1y = lastPoint.y + (pointer.y - lastPoint.y) / 3;
        const cp2x = lastPoint.x + 2 * (pointer.x - lastPoint.x) / 3;
        const cp2y = lastPoint.y + 2 * (pointer.y - lastPoint.y) / 3;
  
        path.path.push(["C", cp1x, cp1y, cp2x, cp2y, pointer.x, pointer.y]);
        points.push(pointer.x, pointer.y);
  
        canvas.renderAll();
      }
    });
  
    canvas.on("mouse:move", (opt) => {
      if (!isDrawing || !path) return;
      const pointer = canvas.getPointer(opt.e);
  
      if (opt.e.buttons === 2 && activeControl) {
        activeControl.set({ left: pointer.x, top: pointer.y });
        canvas.renderAll();
      }
    });
  
    canvas.on("mouse:up", () => {
      activeControl = null;
    });
  
    canvas.on("mouse:dblclick", () => {
      isDrawing = false;
      path = null;
    });
  };
  
  const activatePathEditingTool = () => {
    if (!canvas) return;
  
    canvas.isDrawingMode = false;
    let activePath = null;
    let isDrawing = false;
    let points = [];
  
    // Start drawing a new path
    canvas.on("mouse:down", (opt) => {
      const pointer = canvas.getPointer(opt.e);
  
      if (!isDrawing) {
        isDrawing = true;
        points = [pointer.x, pointer.y];
  
        activePath = new fabric.Path(`M ${pointer.x} ${pointer.y}`, {
          fill: "",
          stroke: "black",
          strokeWidth: 2,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          objectCaching: false,
          selectable: true,
        });
  
        canvas.add(activePath);
      } else {
        // Add new points to the path
        const lastPoint = { x: points[points.length - 2], y: points[points.length - 1] };
  
        // Compute control points for Bézier curve
        const cp1x = lastPoint.x + (pointer.x - lastPoint.x) / 3;
        const cp1y = lastPoint.y + (pointer.y - lastPoint.y) / 3;
        const cp2x = lastPoint.x + 2 * (pointer.x - lastPoint.x) / 3;
        const cp2y = lastPoint.y + 2 * (pointer.y - lastPoint.y) / 3;
  
        // Add the Bézier curve segment
        activePath.path.push(["C", cp1x, cp1y, cp2x, cp2y, pointer.x, pointer.y]);
  
        // Store new points
        points.push(pointer.x, pointer.y);
  
        // Render the updated path
        canvas.renderAll();
      }
    });
  
    // Allow modifying existing paths
    canvas.on("object:selected", (opt) => {
      const obj = opt.target;
      if (obj && obj.type === "path") {
        obj.set({ editable: true });
  
        // Enable path editing by adding control points
        obj.controls = fabric.Object.prototype.controls;
        canvas.renderAll();
      }
    });
  
    // Stop drawing on double-click
    canvas.on("mouse:dblclick", () => {
      isDrawing = false;
      activePath = null;
      points = [];
    });
  };
  
  
  return [
    { icon: <Pencil />, toolName: "Pencil", function: activatePencilTool, function_args: [] },
    { icon: <Brush />, toolName: "Brush", function: activateBrushTool, function_args: [] },
    { icon: <Eraser />, toolName: "Eraser", function: activateEraser, function_args: [] },
    { icon: <PenTool />, toolName: "Pen", function: activatePenTool, function_args: [] },
    { icon: <Tangent />, toolName: "bezier", function: activatePathEditingTool, function_args: [] },

  ];
}
