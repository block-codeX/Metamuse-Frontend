"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import MintingForm from "./MintingForm"; // Import MintingForm

export default function MintModal({ isOpen, onClose, onMint, canvas }: any) {
  const [canvasData, setCanvasData] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canvas) {
      const dataURL = canvas.toDataURL({ format: "png" }); // Export as PNG
      setCanvasData(dataURL);
    }
  }, [isOpen, canvas]);

  const tags = ["Watercolor", "Illustration"];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-auto w-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Sunrise through the bird's eye view</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          {/* Left section: Image and tags */}
          <div className="flex flex-col items-center gap-4 sm:w-1/2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant={"outline"}
                  className="mr-2 border-secondary text-secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {canvasData ? (
              <img
                src={canvasData}
                alt="Canvas Preview"
                className="max-h-[250px] w-full sm:max-w-[500px] rounded-lg shadow-md"
              />
            ) : (
              <p className="text-gray-500">No image preview available.</p>
            )}
            <p className="text-center text-sm sm:text-base">
              A new design created painstakingly through hours of layering
              each pixel over the other.
            </p>
          </div>
  
          {/* Right section: Minting form */}
          <div className="border w-full sm:w-1/2 p-4 bg-white rounded-lg shadow-md">
            <MintingForm />
          </div>
        </div>
  
        {/* Footer Buttons */}
        <AlertDialogFooter className="w-full flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-secondary text-secondary font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button className=" bg-secondary font-semibold cursor-pointer" onClick={onMint}>
            Mint
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  
}
