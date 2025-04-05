import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PatternFormatting: React.FC = () => {
  const availablePatterns = [
    "adire", "fade", "holes", "kente", "moorish", "mosaic", "motif"
  ];
  
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  
  const handlePatternSelect = (pattern: string) => {
    setSelectedPattern(pattern);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Pattern</h3>
      
      <div className="flex flex-row flex-wrap items-start justify-start space-evenly gap-3 ">
        {availablePatterns.map((pattern) => (
          <div key={pattern} className="border w-13 h-13">
              <img 
                src={`/patterns/${pattern}.jpg`} 
                alt={`${pattern} pattern`}
                className={` cursor-pointer transition-all w-full h-full object-cover active:scale-95 transition-all-ease ${
                    selectedPattern === pattern 
                      ? 'ring-2 ring-gray-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-1'
                  }`}
                onClick={() => handlePatternSelect(pattern)}
              />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternFormatting;