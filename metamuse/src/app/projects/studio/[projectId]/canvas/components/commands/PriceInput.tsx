import React from "react";

interface PriceInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}

const PriceInput: React.FC<PriceInputProps> = ({
  label,
  value,
  onChange,
  min = 1,
  step = 1,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-700 text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-red-300 w-full"
      />
    </div>
  );
};

export default PriceInput;
