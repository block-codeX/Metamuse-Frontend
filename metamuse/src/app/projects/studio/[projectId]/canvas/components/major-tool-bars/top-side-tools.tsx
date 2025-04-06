import Strokes from "../formatting/strokes";
import Commands from "../commands/command";
import { CanvasOrientationSwitcher } from "../orientation/tools/switcher";
export default function TopSideTools() {
  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full">
      <Commands />
      <Strokes />
      <CanvasOrientationSwitcher />
    </div>
  );
}
