"use client";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Gavel,
  ImageDown,
  ImageUp,
  MessagesSquare,
  Save,
} from "lucide-react";
import MintModal from "./mint-modal";
import { useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from 'fabric';
export default function Commands() {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const { canvas } = useCanvas()

  const handleImportImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        console.log(dataURL);
        if (canvas) {
          fabric.FabricImage.fromURL(dataURL, (img: any) => {
            img.scaleToWidth(canvas.width * 0.8); // Scale image to 80% of canvas width
            img.set({ left: 50, top: 50 }); // Position it on the canvas
            canvas.add(img);
            canvas.renderAll();
          });
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  const commandOptions = [
    {
      icon: Save,
      name: "Save",
      size: "row-span-2 row-start-1 col-start-1 col-span-1",
      action: () => console.log("Saving..."),
    },
    {
      icon: Camera,
      name: "Snapshot",
      size: "col-span-2 col-start-2 row-start-2 row-span-1",
      action: () => console.log("Taking snapshot..."),
    },
    {
      icon: ImageUp,
      name: "Import Image",
      size: "col-span-1 col-start-2 row-start-1 row-span-1",
      action: handleImportImage,
    },
    {
      icon: ImageDown,
      name: "Export",
      size: "col-span-1 col-start-3 row-span-1",
      action: () => console.log("Exporting..."),
    },
    {
      icon: Gavel,
      name: "Mint",
      size: "row-span-2 col-span-1 row-start-1 col-start-4 text-white bg-btn-primary dark:bg-btn-primary",
      action: () => setIsMintModalOpen(true), // Open Mint Modal
    },
  ];


  // Function to get icon size based on the grid cell size
  const getIconSize = (size) => {
    if (size.includes("col-span-2")) return 22;
    if (size.includes("row-span-2")) return 24;
    return 28;
  };

  return (
    <div className="py-0 px-2 h-full border-r">
      <div className="grid grid-rows-[auto_auto] grid-cols-[50px_1fr_1fr_50px] w-70 h-full gap-x-2 space-y-1">
        {commandOptions.map(({ icon: Icon, name, size, action }, index) => (
          <Button
            variant={"default"}
            key={index}
            className={`bg-white text-btn-primary py-0 ${size} active:scale-95 active:text-btn-primary cursor-pointer flex flex-col gap-0 h-full w-full items-center justify-center dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm hover:bg-gray-50 hover:text-btn-primary dark:hover:bg-gray-700 transition-colors`}
            onClick={action}
          >
            <Icon strokeWidth={1.5} size={getIconSize(size)} />
            <span className="text-xs">{name}</span>
          </Button>
        ))}
        <MintModal
          isOpen={isMintModalOpen}
          canvas={canvas}
          onClose={() => setIsMintModalOpen(false)}
          onMint={() => console.log("Minting NFT...")}
        />
      </div>
    </div>
  );
}
