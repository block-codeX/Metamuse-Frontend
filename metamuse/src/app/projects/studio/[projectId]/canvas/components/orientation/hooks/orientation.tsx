// src/hooks/useCanvasOrientation.ts
import { useEffect, useState } from "react";
import { PRESETS, CanvasPreset } from '../presets'
import { useCanvas } from "../../contexts/canvas-context";

export const useCanvasOrientation = () => {
  const { canvas, setDimensions, setPreset, dimensions, preset} = useCanvas();
  const [currentPreset, setCurrentPreset] = useState<CanvasPreset>(PRESETS[0]);
  const [customDimensions, setCustomDimensions] = useState({
    width: 0,
    height: 0
  });
  const [unit, setUnit] = useState<"px" | "in" | "cm">("px");
  useEffect(() => {
    if (preset && preset != currentPreset.name) {
      const preset_ = PRESETS.find(p => p.name === preset);
      if (preset_) {
        setCurrentPreset(preset_);
      }
    }
  }, [preset])
  const applyPreset = (preset_: CanvasPreset) => {
    if (!canvas) return;
    
    const dimensions = preset_.name === "Custom" 
      ? customDimensions
      : preset_.dimensions;
    setDimensions(dimensions)
    setCurrentPreset(preset_);
    setPreset(preset_.name)
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