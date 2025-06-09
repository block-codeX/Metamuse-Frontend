import Strokes from "../drawing/formatting/strokes";
import Commands from "../commands/command";
import { CanvasOrientationSwitcher } from "../orientation/tools/switcher";
import { useCanvasSync } from "../contexts/canvas-sync-context";
import { useEffect, useState } from "react";
import { FlashingText } from "@/components/ui/flashing-text";
export default function TopSideTools() {
  const { initialized } = useCanvasSync();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    console.log("Current initialization", initialized);
    setLoaded(initialized);
  }, [initialized]);
  // const[isLoaded, setIsLoaded]
  // useE
  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full overflow-x-auto overflow-y-hidden">
      <div className="w-8 h-8 mx-4 self-start mt-3 flex flex-col items-start">
        <div
          className={`w-4 h-4 rounded-full ${
            loaded === true ? "bg-success" : "bg-error"
          }`}
        ></div>
        {loaded && <FlashingText text="Art Synced" color="text-success" />}
      </div>
      <Commands />
      <Strokes />
      <CanvasOrientationSwitcher />
    </div>
  );
}
