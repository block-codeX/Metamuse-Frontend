import React, { useState } from "react";
import { useCanvas } from "../../contexts/canvas-context";

const PatternFormatting: React.FC = () => {
  const availablePatterns = [
    "autumn",
    "bubbles",
    "church-on-sunday",
    "fancy-rectangles",
    "flipped-diamonds",
    "graph-paper",
    "heavy-rain",
    "hexagons",
    "houndstooth",
    "jupiter",
    "line-in-motion",
    "morphing-diamonds",
    "volcano-lamp",
    "endless-clouds",
    "circuit-board",
    "brick-wall",
    "diagonal-lines",
  ];

  const { pattern, setPattern, foregroundColor, backgroundColor } = useCanvas();

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
            className={`border w-20 h-24 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 transition-all-ease ${
              pattern === ptn
                ? "ring-2 ring-gray-500 ring-offset-2"
                : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-1"
            }`}
          >
            <div
              style={{
                maskImage: `url(/patterns/${ptn}.svg)`,
                WebkitMaskImage: `url(/patterns/${ptn}.svg)`,
                maskRepeat: "repeat",
                WebkitMaskRepeat: "repeat",
                backgroundColor: foregroundColor,
                background: `linear-gradient(${backgroundColor}, ${foregroundColor})`,
              }}
              className="w-full h-16"
            />
            <span className="mt-1 text-sm text-center">{ptn}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternFormatting;
