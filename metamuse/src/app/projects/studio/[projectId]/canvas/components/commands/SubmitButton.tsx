import React from "react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, children, icon }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full py-2 px-4 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
        isSubmitting
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-[#F68C1F] text-white hover:bg-[#D97A1D]"
      }`}
    >
      {isSubmitting ? "Processing..." : children}
      {!isSubmitting && icon}
    </button>
  );
};

export default SubmitButton;
