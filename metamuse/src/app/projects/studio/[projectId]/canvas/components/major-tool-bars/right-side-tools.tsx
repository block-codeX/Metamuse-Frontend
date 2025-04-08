import { useCanvas } from "../contexts/canvas-context";
import ColorPalette from "../drawing/formatting/color-palette";

const RightSideTools: React.FC = () => {
  const { setBackgroundColor, setForegroundColor} = useCanvas();
  return (
    <div className="w-full h-full py-2 flex flex-row items-center justify-center">
      <ColorPalette
        onSelectFore={setForegroundColor}
        onSelectBack={setBackgroundColor}
      />
    </div>
  );
};
export default RightSideTools;
