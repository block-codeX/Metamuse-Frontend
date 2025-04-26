import Strokes from "../drawing/formatting/strokes";
import Commands from "../commands/command";
import { CanvasOrientationSwitcher } from "../orientation/tools/switcher";
export default function TopSideTools() {
  return (
    <div className="flex flex-row items-center justify-start bg-background space-y-2 border h-full overflow-x-auto overflow-y-hidden">
      <Commands />
      <Strokes />
      <CanvasOrientationSwitcher />
    </div>
  );
}
