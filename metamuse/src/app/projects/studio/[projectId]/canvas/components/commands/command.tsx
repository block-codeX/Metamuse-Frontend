"use client";
import { Button } from "@/components/ui/button";
import { Bitcoin, ImageDown, Save } from "lucide-react";
import MintModal from "./mint-modal";
import { useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import * as fabric from "fabric";
import { get } from "lodash";
export default function Commands() {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const { canvas } = useCanvas();

  const handleImportImage = async () => {
    console.log("adas");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataURL = e.target?.result as string;
        if (canvas) {
          const img = await fabric.FabricImage.fromURL(dataURL)
          img.scaleToWidth(canvas.width * 0.8); // Scale image to 80% of canvas width
          img.set({ left: 50, top: 50 }); // Position it on the canvas
          img.erasable = "deep"
          canvas.add(img);
          canvas.renderAll();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const findGuidelines = (
    canvasInstance: fabric.Canvas | null
  ): fabric.Object[] => {
    if (!canvasInstance) return [];
    // Filter objects based on the custom property
    return canvasInstance
      .getObjects()
      .filter((obj) => (obj as any).customType === "guideline");
  };

  const setGuidelinesVisible = (
    canvasInstance: fabric.Canvas | null,
    isVisible: boolean
  ) => {
    const guidelines = findGuidelines(canvasInstance);
    if (guidelines.length > 0) {
      guidelines.forEach((guideline) => {
        guideline.visible = isVisible;
      });
      // No immediate render needed if hiding just before export,
      // but needed if making visible again.
      if (isVisible) {
        canvasInstance?.requestRenderAll();
      }
      console.log(
        `Set ${guidelines.length} guidelines visibility to ${isVisible}`
      );
    }
  };

  const handleSave = () => {
    if (!canvas) {
        console.error("Canvas not available for saving.");
        return;
    }
    try {
      // 1. Temporarily hide guidelines
      console.log("Hiding guidelines for save...");
      // We don't need to store the returned guidelines here if setGuidelinesVisible handles finding them again
      setGuidelinesVisible(canvas, false);
      // Fabric's toDataURL typically renders the current state, including visibility changes.

      // 2. Generate the PNG Data URL
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1.0, // Max quality
        multiplier: 1, // Use 1 for native resolution, increase for higher res export
      });

      // 3. Trigger the download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas_design.png"; // Set desired filename
      document.body.appendChild(link); // Append to body (needed for Firefox)
      link.click(); // Simulate click to trigger download
      document.body.removeChild(link); // Clean up the link element

      console.log("Canvas successfully saved as PNG.");
    } catch (error) {
      console.error("Error saving canvas:", error);
      // Add user feedback (e.g., toast notification) for errors if desired
    } finally {
      // 4. IMPORTANT: Always restore guideline visibility afterwards
      console.log("Restoring guideline visibility...");
      setGuidelinesVisible(canvas, true);
      // The setGuidelinesVisible function already calls requestRenderAll when making visible.
    }
  };
  const commandOptions = [
    {
      icon: Save,
      name: "Save",
      size: "sm row-start-1 col-start-1 col-span-1 flex flex-row items-center text-xs justify-start",
      action: handleSave,
    },
    {
      icon: ImageDown,
      name: "Import Image",
      size: "sm col-start-1 row-start-2 row-span-1 flex flex-row items-center text-xs justify-start",
      action: handleImportImage,
    },

    {
      icon: Bitcoin,
      name: "Mint",
      size: "lg row-span-2 row-start-1 h-[70px] w-full  col-start-2 text-white bg-btn-primary dark:bg-btn-primary flex flex-col gap-1 justify-center align-center",
      action: () => {
        setGuidelinesVisible(canvas, false); // Hide guidelines before minting
        setIsMintModalOpen(true); // Open Mint Modal
      }, // Open Mint Modal
    },
  ];

  // --- Function Implementations ---

  /**
   * Permanently removes all guideline objects from the canvas.
   */
  const cleanGuidelines = () => {
    // Assuming 'canvas' is accessible from the component's scope via useCanvas()
    if (!canvas) {
      console.error("Canvas not available for cleaning guidelines.");
      return;
    }
    const guidelines = findGuidelines(canvas);

    if (guidelines.length > 0) {
      console.log(`Removing ${guidelines.length} guidelines...`);
      guidelines.forEach((guideline) => {
        canvas.remove(guideline);
      });
      canvas.requestRenderAll(); // Update canvas visually after removal
      console.log("Guidelines removed.");
    } else {
      console.log("No guidelines found to remove.");
    }
  };

  /**
   * Saves the current canvas state as a PNG image, temporarily hiding guidelines.
   */

  // Function to get icon size based on the grid cell size
  const getIconSize = (size) => {
    if (size.includes("sm")) {
      console.log("yay");
      return 22;
    }
    if (size.includes("lg")) return 32;
    return 28;
  };
  return (
    <div className="my-2 px-5 h-full border-r m-0 sticky left-0 bg-background">
      <div className="grid grid-rows-[auto_auto] grid-cols-[auto_50px] h-full gap-x-3 gap-y-1 py-1 items-center">
        {commandOptions.map(({ icon: Icon, name, size, action }, index) => (
          <Button
            variant={"default"}
            key={index}
            className={`bg-white text-btn-primary p-0 active:scale-95 active:text-btn-primary cursor-pointer dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm hover:bg-gray-50 hover:text-btn-primary dark:hover:bg-gray-700 transition-colors  ${size}`}
            onClick={action}
          >
            <Icon strokeWidth={1.5} size={getIconSize(size)} />
            <span>{name}</span>
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
