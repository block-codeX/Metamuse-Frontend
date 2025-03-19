import { Square, Circle, Slash, Triangle, Star, Image as ImageIcon, Type } from "lucide-react";
import * as fabric from "fabric";
import { useCanvas } from "../canvas-context";

export function useShapeTools() {
  const { canvas } = useCanvas();

  // Helper function to create generic shapes
  const addShape = (shape) => {
    if (!canvas) return;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Rectangle Tool
  const activateRectangle = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
      width: 100,
      height: 60,
    });
    addShape(rect);
  };

  // Ellipse Tool
  const activateEllipse = () => {
    const ellipse = new fabric.Ellipse({
      left: 120,
      top: 120,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
      rx: 50,
      ry: 30,
    });
    addShape(ellipse);
  };

  // Line Tool
  const activateLine = () => {
    const line = new fabric.Line([50, 50, 200, 200], {
      stroke: "black",
      strokeWidth: 2,
    });
    addShape(line);
  };

  // Polygon Tool (Click to add points, double-click to close)
  const activatePolygon = () => {
    if (!canvas) return;
    let isDrawing = false;
    let points = [];
    let poly = null;

    canvas.on("mouse:down", (opt) => {
      const pointer = canvas.getPointer(opt.e);
      points.push({ x: pointer.x, y: pointer.y });

      if (!isDrawing) {
        isDrawing = true;
        poly = new fabric.Polygon(points, {
          fill: "transparent",
          stroke: "black",
          strokeWidth: 2,
        });
        canvas.add(poly);
      } else {
        poly.set({ points });
        canvas.renderAll();
      }
    });

    canvas.on("mouse:dblclick", () => {
      isDrawing = false;
    });
  };

  // Star Tool (Draws a 5-pointed star)
  const activateStar = () => {
    const star = new fabric.Polygon(
      [
        { x: 50, y: 0 },
        { x: 61, y: 35 },
        { x: 98, y: 35 },
        { x: 68, y: 57 },
        { x: 79, y: 91 },
        { x: 50, y: 70 },
        { x: 21, y: 91 },
        { x: 32, y: 57 },
        { x: 2, y: 35 },
        { x: 39, y: 35 },
      ],
      {
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: "black",
        strokeWidth: 2,
      }
    );
    addShape(star);
  };

  // Custom SVG Shape Tool (Loads an SVG path)
  const activateSVGShape = (svgPath) => {
    fabric.loadSVGFromString(svgPath, (objects, options) => {
      const shape = fabric.util.groupSVGElements(objects, options);
      shape.set({ left: 100, top: 100 });
      addShape(shape);
    });
  };
  // Text Tool - Adds editable text
const activateTextTool = () => {
    if (!canvas) return;
    
    const text = new fabric.Textbox("Enter text", {
      left: 150,
      top: 150,
      fontSize: 24,
      fill: "black",
      fontFamily: "Arial",
      borderColor: "blue",
      editingBorderColor: "red",
      hasControls: true,
    });
  
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  

  return [
    { icon: <Square />, toolName: "Rectangle", function: activateRectangle, function_args: [] },
    { icon: <Circle />, toolName: "Ellipse", function: activateEllipse, function_args: [] },
    { icon: <Slash />, toolName: "Line", function: activateLine, function_args: [] },
    { icon: <Triangle />, toolName: "Polygon", function: activatePolygon, function_args: [] },
    { icon: <Star />, toolName: "Star", function: activateStar, function_args: [] },
    { icon: <ImageIcon />, toolName: "SVG Shape", function: activateSVGShape, function_args: ["M10 10 H 90 V 90 H 10 Z"] }, // Example SVG
    { icon: <Type />, toolName: "Text", function: activateTextTool, function_args: [] },

  ];
}
