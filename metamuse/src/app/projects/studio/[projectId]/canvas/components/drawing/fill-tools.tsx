import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";
import {
  PaintBucket,
  SquarePen,
  Waves,
  Palette,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useCanvasSync } from "../contexts/canvas-sync-context";

export function useFillTools() {
  const {
    canvas,
    foregroundColor,
    backgroundColor,
    fromColor,
    toColor,
    angle,
    gradientType,
    pencilWidth,
    pattern,
    isFill,
    setFill,
  } = useCanvas();
  const { updateYjsObject } = useCanvasSync();
  // Refs to track the active fill mode
  const activeFillTool = useRef<string | null>(null);
  const isClickModeActive = useRef(false);

  // State to track when relevant parameters change
  const [fillParams, setFillParams] = useState({
    foregroundColor,
    backgroundColor,
    fromColor,
    toColor,
    angle,
    gradientType,
    pencilWidth,
    pattern,
  });

  // Update fillParams when any relevant parameter changes
  useEffect(() => {
    setFillParams({
      foregroundColor,
      backgroundColor,
      fromColor,
      toColor,
      angle,
      gradientType,
      pencilWidth,
      pattern,
    });

    // If a fill tool is active, update the click listeners with new parameters
    if (isClickModeActive.current && activeFillTool.current) {
      // Clean up existing listeners
      cleanupToolEventListeners();

      // Re-activate the currently active tool with new parameters
      if (!isFill) return;
      setTimeout(() => {
        switch (activeFillTool.current) {
          case "solidFill":
            activateSolidFillMode("fill");
            break;
          case "stroke":
            activateSolidFillMode("stroke");
            break;
          case "gradient":
            activateGradientFillMode();
            break;
          case "pattern":
            activatePatternFillMode();
            break;
        }
      }, 0);
    }
  }, [
    foregroundColor,
    backgroundColor,
    fromColor,
    toColor,
    angle,
    gradientType,
    pencilWidth,
    pattern,
  ]);

  // --- Cleanup Function ---
  const cleanupToolEventListeners = () => {
    if (!canvas) return;
    canvas.off("mouse:down");
    canvas.defaultCursor = "default";
    canvas.selection = true;
    canvas.forEachObject((o) => (o.selectable = true));
    isClickModeActive.current = false;
    setFill(false);
    console.log("Fill tool listeners cleaned up.");
  };

  // --- Utility Functions ---

  // Function to find enclosed areas that contain a point
  const findEnclosedArea = (x: number, y: number) => {
    if (!canvas) return null;

    // Get all path objects on canvas that could form enclosed areas
    const pathObjects = canvas.getObjects().filter((obj) => {
      return obj instanceof fabric.Path || obj instanceof fabric.Line;
    });

    if (pathObjects.length === 0) return null;

    // This is a simplified approach - in a real implementation, you would:
    // 1. Find all potential enclosures by analyzing intersecting paths
    // 2. Check if the point is inside any of these enclosures
    // 3. Return the enclosure or create a new path object representing it

    // For demo purposes, we'll check if the point is inside any path that's closed
    for (const obj of pathObjects) {
      if (obj instanceof fabric.Path && obj.path?.length > 0) {
        // Check if path is closed (simplified)
        const firstPoint = obj.path[0];
        const lastPoint = obj.path[obj.path.length - 1];

        const isClosedPath = firstPoint[0] === "M" && lastPoint[0] === "Z";

        if (isClosedPath && obj.containsPoint(new fabric.Point(x, y))) {
          return obj;
        }
      }
    }

    return null;
  };

  // Convert angle to x/y coordinates for linear gradient
  const calculateGradientCoords = (
    angleInDegrees: number,
    isLinear: boolean
  ) => {
    if (isLinear) {
      // Convert angle to radians
      const angleRadians = (angleInDegrees * Math.PI) / 180;

      // Calculate the start and end points based on angle
      // We use the unit circle (0,0 to 1,1) as our canvas
      const x1 = 0.5 - 0.5 * Math.cos(angleRadians);
      const y1 = 0.5 - 0.5 * Math.sin(angleRadians);
      const x2 = 0.5 + 0.5 * Math.cos(angleRadians);
      const y2 = 0.5 + 0.5 * Math.sin(angleRadians);

      return { x1, y1, x2, y2 };
    } else {
      // For radial gradients, angle doesn't apply the same way
      // Could adjust center point based on angle if desired
      return { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 0.5 };
    }
  };

  // Function to get pattern URL from pattern name
const getPatternUrl = async (patternName: string, foreColor: string) => {
    if (!patternName) return null;
    try {
      const response = await fetch(`/patterns/${patternName}.svg`);
      let svgText = await response.text();

      // Replace only the foreground color (assuming SVG uses #000000 for pattern elements)
      if (!["#000000", "#000", "black"].includes(foreColor))
      svgText = svgText
        .replace(/#000000/g, foreColor) // Replace black with current foreground
        .replace(/#000/g, foreColor) // Replace short hex black
        .replace(/black/gi, foreColor); // Replace named black colors
      // Create blob URL from modified SVG
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error loading pattern:", error);
      return null;
    }
  };

  // --- Click Mode Activation Functions ---

  // Activate solid fill or stroke click mode
  const activateSolidFillMode = (actionType: "fill" | "stroke") => {
    if (!canvas) return;

    setFill(true);
    console.log(`Activating ${actionType} click mode...`);
    isClickModeActive.current = true;
    activeFillTool.current = actionType === "fill" ? "solidFill" : "stroke";
    canvas.defaultCursor = "copy";
    canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = false));

    const handleSolidClick = (opt: any) => {
      if (!opt.e || !canvas) return;

      const pointer = canvas.getScenePoint(opt.e);
      const x = pointer.x;
      const y = pointer.y;
      const color = foregroundColor;
      const strokeWidth = pencilWidth;

      // Find object under click
      const target = canvas.findTarget(opt.e);

      if (target && target.type !== "activeSelection") {
        // Apply fill/stroke to the clicked object
        if (actionType === "fill") {
          target.set("fill", color);
          updateYjsObject(target);
        } else {
          target.set({
            stroke: color,
            strokeWidth: strokeWidth,
          });
          updateYjsObject(target);
        }
        canvas.renderAll();
        console.log(`${actionType} applied to object: ${target.type}`);
      } else if (actionType === "fill") {
        // For fill tool only, check for enclosed area or apply to background
        const enclosedArea = findEnclosedArea(x, y);

        if (enclosedArea) {
          enclosedArea.set("fill", color);
          updateYjsObject(enclosedArea);
          canvas.renderAll();
          console.log("Fill applied to enclosed area");
        }
      }

      // Don't clean up - keep the tool active for further clicks
      // Just reattach the click handler for continued use
      canvas.once("mouse:down", handleSolidClick);
    };

    canvas.once("mouse:down", handleSolidClick);
  };

  // Activate gradient fill click mode
  const activateGradientFillMode = () => {
    if (!canvas) return;
    setFill(true);
    console.log("Activating gradient fill click mode...");
    isClickModeActive.current = true;
    activeFillTool.current = "gradient";
    canvas.defaultCursor = "copy";
    canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = false));

    const handleGradientClick = (opt: any) => {
      if (!opt.e || !canvas) return;

      const pointer = canvas.getScenePoint(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      // Get current gradient parameters
      const colors = [fromColor, toColor];
      const currentAngle = angle || 0;
      const isLinearGradient = gradientType === "linear";
      const coords = calculateGradientCoords(currentAngle, isLinearGradient);

      const gradient: any = new fabric.Gradient({
        type: gradientType as fabric.GradientType,
        gradientUnits: "percentage",
        coords: coords,
        colorStops: [
          { offset: 0, color: colors[0] || foregroundColor },
          { offset: 1, color: colors[1] || backgroundColor },
        ],
      });

      // Find object under click
      const target = canvas.findTarget(opt.e);

      if (target && target.type !== "activeSelection") {
        // Apply gradient to the clicked object
        target.set("fill", gradient);
        updateYjsObject(target);
        canvas.renderAll();
        console.log("Gradient applied to object:", target.type);
      } else {
        // Check for enclosed area
        const enclosedArea = findEnclosedArea(x, y);

        if (enclosedArea) {
          enclosedArea.set("fill", gradient);
          updateYjsObject(enclosedArea);
          canvas.renderAll();
          console.log("Gradient applied to enclosed area");
        }
      }

      // Reattach event listener for continued use
      canvas.once("mouse:down", handleGradientClick);
    };

    canvas.once("mouse:down", handleGradientClick);
  };

  // Activate pattern fill click mode
  const activatePatternFillMode = () => {
    if (!canvas) return;
    setFill(true);

    console.log("Activating pattern fill click mode...");
    isClickModeActive.current = true;
    activeFillTool.current = "pattern";
    canvas.defaultCursor = "copy";
    canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = false));

    const handlePatternClick = async (opt: any) => {
      if (!opt.e || !canvas) return;

      const pointer = canvas.getScenePoint(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      // Get pattern URL from pattern name
      console.log(pattern, foregroundColor)
      const patternUrl = await getPatternUrl(pattern, foregroundColor);

      if (!patternUrl) {
        console.warn("No pattern selected for pattern fill.");
        return;
      }

      // Find object under click
      const target = canvas.findTarget(opt.e);

      if (target && target.type !== "activeSelection") {
        // Apply pattern to the clicked object
        console.log("Applying pattern to clicked object:", target.type);

        // Load pattern image
        const img = await fabric.util.loadImage(patternUrl);

        // Get target dimensions
        const targetWidth = target.width || 100;
        const targetHeight = target.height || 100;

        // Create a pattern scaled to match object dimensions
        const patternFill: any = new fabric.Pattern({
          source: img,
          repeat: "repeat",
          offsetX: 0,
          offsetY: 0,
          // Set pattern sizing relative to object
        });
        patternFill.color = foregroundColor
        patternFill.name = pattern

        target.set({
          fill: patternFill,
          transparentCorners: false,
          dirty: true,
        });
        target.color = foregroundColor
        target.name = pattern
        updateYjsObject(target);
        canvas.renderAll();
      } else {
        // Check for enclosed area
        const enclosedArea = findEnclosedArea(x, y);

        if (enclosedArea) {
          // Apply pattern to the enclosed area
          console.log("Applying pattern to enclosed area");

          // Load pattern image
          const img = await fabric.util.loadImage(patternUrl);
          console.log("Pattern image loaded:", img);

          // Get enclosed area dimensions
          const areaWidth = enclosedArea.width || 100;
          const areaHeight = enclosedArea.height || 100;

          // Create a pattern scaled to match object dimensions
          const patternFill = new fabric.Pattern({
            source: img,
            repeat: "repeat",
            offsetX: 0,
            offsetY: 0,
            // Set pattern sizing relative to object
            patternTransform: [1, 0, 0, 1, 0, 0], // Maintain original orientation\
          });

          enclosedArea.set({
            fill: patternFill,
            transparentCorners: false,
            dirty: true,
          });
          updateYjsObject(enclosedArea);
          canvas.renderAll();
        }
      }

      // Reattach event listener for continued use
      canvas.once("mouse:down", handlePatternClick);
    };

    canvas.once("mouse:down", handlePatternClick);
  };

  // --- Core Action Functions ---

  // Applies solid fill or outline to selected object or activates click-to-fill mode
  const applySolidAction = (actionType: "fill" | "stroke") => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    const color = foregroundColor;
    const strokeWidth = pencilWidth;
    setFill(true);

    if (activeObject) {
      // Mode 1: Apply to selected object
      const properties: Partial<fabric.Object> = {};
      if (actionType === "fill") {
        properties.fill = color;
      } else {
        // stroke
        properties.stroke = color;
        properties.strokeWidth = strokeWidth;
      }
      activeObject.set(properties);
      updateYjsObject(activeObject);
      canvas.renderAll();
      console.log(`${actionType} applied to selected object.`);

      // Immediately activate click mode for subsequent fills
      activateSolidFillMode(actionType);
    } else {
      // Mode 2: Activate click-to-fill mode
      activateSolidFillMode(actionType);
    }
  };

  // Applies gradient fill to selected object or activates click-to-fill mode
  const applyGradientAction = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    const colors = [fromColor, toColor];
    const currentAngle = angle || 0; // Default to 0 if not set
    const isLinearGradient = gradientType === "linear";
    setFill(true);

    // Calculate coordinates based on angle
    const coords = calculateGradientCoords(currentAngle, isLinearGradient);

    const gradient = new fabric.Gradient({
      type: gradientType as fabric.GradientType,
      gradientUnits: "percentage",
      coords: coords,
      colorStops: [
        { offset: 0, color: colors[0] || foregroundColor },
        { offset: 1, color: colors[1] || backgroundColor },
      ],
    });

    if (activeObject) {
      // Mode 1: Apply to selected object
      activeObject.set("fill", gradient);
      updateYjsObject(activeObject);
      canvas.renderAll();
      console.log(
        `${gradientType} gradient applied to selected object with angle ${currentAngle}°.`
      );

      // Immediately activate click mode for subsequent fills
      activateGradientFillMode();
    } else {
      // Mode 2: Activate click-to-fill mode
      activateGradientFillMode();
    }
  };

  // Applies pattern fill to selected object or activates click-to-fill mode
  const applyPatternFillAction = async () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();

    // Get pattern URL from pattern name
    const patternUrl = await getPatternUrl(pattern, foregroundColor);
    setFill(true);

    if (!patternUrl) {
      console.warn("No pattern selected for pattern fill.");
      return;
    }

    if (activeObject) {
      // Mode 1: Apply to selected object
      console.log("Applying pattern fill to selected object...");

      // Load pattern image
      const img = await fabric.util.loadImage(patternUrl);

      // Get object dimensions

      // Create a pattern scaled to match object dimensions
      const patternFill: any = new fabric.Pattern({
        source: img,
        repeat: "repeat",
        offsetX: 0,
        offsetY: 0,
      });
      patternFill.color = foregroundColor
      patternFill.name = pattern
      activeObject.set("fill", patternFill);
      activeObject.color = foregroundColor
      activeObject.name = pattern
      updateYjsObject(activeObject);
      canvas.renderAll();
      // Immediately activate click mode for subsequent fills
      activatePatternFillMode();
    } else {
      // Mode 2: Activate click-to-fill mode
      activatePatternFillMode();
    }
  };

  // Function to deactivate all fill tools
  const deactivateAllFillTools = () => {
    cleanupToolEventListeners();
    activeFillTool.current = null;
    setFill(false);
  };

  // --- Return Tool Definitions ---
  return [
    // Fill Tool (Solid Color Bucket)
    {
      icon: <PaintBucket />,
      toolName: "Fill Color",
      function: () => applySolidAction("fill"),
      function_args: [],
      isActive: activeFillTool.current === "solidFill",
      deactivate: deactivateAllFillTools,
    },
    // Stroke Tool (Outline)
    {
      icon: <SquarePen />,
      toolName: "Outline",
      function: () => applySolidAction("stroke"),
      function_args: [],
      isActive: activeFillTool.current === "stroke",
      deactivate: deactivateAllFillTools,
    },
    // Gradient Tool
    {
      icon: <Palette />,
      toolName: "Gradient Fill",
      function: () => applyGradientAction(),
      function_args: [],
      isActive: activeFillTool.current === "gradient",
      deactivate: deactivateAllFillTools,
    },
    // Pattern Fill Tool
    {
      icon: <Waves />,
      toolName: "Pattern Fill",
      function: () => applyPatternFillAction(),
      function_args: [],
      isActive: activeFillTool.current === "pattern",
      deactivate: deactivateAllFillTools,
    },
  ];
}
