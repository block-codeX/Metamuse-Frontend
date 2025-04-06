import React, { useState } from 'react';
import { useCanvas } from '../contexts/canvas-context';

const PatternFormatting: React.FC = () => {
  const availablePatterns = [
    "adire", "fade", "holes", "kente", "moorish", "mosaic", "motif"
  ];
  
  const { pattern, setPattern } = useCanvas()
  
  const handlePatternSelect = (selectedPattern: string) => {
    setPattern(selectedPattern);
  };
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Pattern</h3>
      
      <div className="flex flex-row flex-wrap items-center justify-center space-evenly gap-3 ">
        {availablePatterns.map((ptn) => (
          <div key={ptn} className="border w-13 h-13">
              <img 
                src={`/patterns/${ptn}.jpg`} 
                alt={`${ptn} pattern`}
                className={` cursor-pointer transition-all w-full h-full object-cover active:scale-95 transition-all-ease ${
                    pattern === ptn 
                      ? 'ring-2 ring-gray-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-1'
                  }`}
                onClick={() => handlePatternSelect(ptn)}
              />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternFormatting;