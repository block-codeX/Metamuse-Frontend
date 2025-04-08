import React, { useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

const PatternFormatting: React.FC = () => {
  const availablePatterns = [
    "adire",
    "fade",
    "holes",
    "kente",
    "moorish",
    "mosaic",
    "motif",
  ];

  const { pattern, setPattern } = useCanvas();

  const handlePatternSelect = (selectedPattern: string) => {
    setPattern(selectedPattern);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-row flex-wrap items-center justify-center space-evenly gap-3 ">
        {availablePatterns.map((ptn) => (
            <div
            key={ptn}
            onClick={() => handlePatternSelect(ptn)}
            className={`border w-20 h-24 flex flex-col items-center justify-start cursor-pointer transition-all active:scale-95 transition-all-ease ${
              pattern === ptn
              ? "ring-2 ring-gray-500 ring-offset-2"
              : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-1"
            }`}
            >
            <img
              src={`/patterns/${ptn}.jpg`}
              alt={`${ptn} pattern`}
              className="w-full h-16 object-cover"
            />
            <span className="mt-1">{ptn}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default PatternFormatting;
