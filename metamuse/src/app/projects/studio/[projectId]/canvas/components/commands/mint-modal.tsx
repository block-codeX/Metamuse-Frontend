"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
      <AlertDialogContent className="sm:max-w-auto w-auto ">
        <AlertDialogHeader>
          <AlertDialogTitle>Sunrise through the birds eye view</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-row  gap-4 w-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row gap-2 self-start">
              {tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant={"outline"}
                  className="mr-2 border-btn-primary text-btn-primary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {canvasData ? (
              <img
                src={canvasData}
                alt="Canvas Preview"
                className="max-h-[300px] w-auto max-w-[800] rounded-lg shadow-md"
              />
            ) : (
              <p className="text-gray-500">No image preview available.</p>
            )}
            <p>
              A new designed created painstakingly through hours of layering
              each pixel over the other
            </p>
          </div>
          <div className="border w-[300px]"></div>
        </div>
        <AlertDialogFooter className="w-full flex flex-row sm:justify-start gap-48 items-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-btn-primary text-btn-primary font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button className=" bg-btn-primary font-semibold cursor-pointer" onClick={onMint}>
            Mint
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
