// src/hooks/useCanvasOrientation.ts
import { useEffect, useState } from "react";
import { PRESETS, CanvasPreset } from '../presets'
import { useCanvas } from "../../contexts/canvas-context";

export const useCanvasOrientation = () => {
  const { canvas, setDimensions, dimensions } = useCanvas();
  const [currentPreset, setCurrentPreset] = useState<CanvasPreset>(PRESETS[0]);
  const [customDimensions, setCustomDimensions] = useState({
    width: 0,
    height: 0
  });
  const [unit, setUnit] = useState<"px" | "in" | "cm">("px");

  const applyPreset = (preset: CanvasPreset) => {
    if (!canvas) return;
    
    const dimensions = preset.name === "Custom" 
      ? customDimensions
      : preset.dimensions;
    setDimensions(dimensions)
    setCurrentPreset(preset);
  };

  const updateCustomDimensions = (width: number, height: number) => {
    setCustomDimensions({ width, height });
    if (currentPreset.name === "Custom") {
        setDimensions({ width, height})
    }
  };

  // Convert units (example for inches)
  const convertToPixels = (value: number, unit: string) => {
    const DPI = 300; // Standard print DPI
    switch(unit) {
      case 'in': return value * DPI;
      case 'cm': return value * DPI / 2.54;
      default: return value;
    }
  };

  return {
    currentPreset,
    customDimensions,
    unit,
    setUnit,
    applyPreset,
    updateCustomDimensions,
    presets: PRESETS
  };
};