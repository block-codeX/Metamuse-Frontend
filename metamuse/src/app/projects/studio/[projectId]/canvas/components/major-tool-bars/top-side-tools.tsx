import Strokes from "../formatting/strokes";
import Commands from "../commands/command";
import { CanvasOrientationSwitcher } from "../orientation/tools/switcher";
export default function TopSideTools() {


  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full">
      {/* Color Palette Component */}
      {/* Pencil & Eraser Width Controls */}
      <Commands />
      <div className="p-1 flexflex-col space-y-2 space-x-2 w-65 border-r ">
        <Strokes />
      </div>
      <CanvasOrientationSwitcher />
      </div>
  );
}
