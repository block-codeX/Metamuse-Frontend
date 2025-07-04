import React from "react";

interface MintingPreviewProps {
  imageSrc?: string;
  title?: string;
  description?: string;
}

const MintingPreview: React.FC<MintingPreviewProps> = ({
  imageSrc,
  title = "NFT Preview",
  description = "A preview of your NFT before minting",
}) => {
  return (
    <div className="flex flex-col items-center gap-4 border border-gray-300 rounded-lg p-4 bg-white shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="NFT Preview"
          className="max-h-[200px] w-auto rounded-lg shadow-md"
        />
      ) : (
        <p className="text-gray-500">No image preview available.</p>
      )}
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
};

export default MintingPreview;
