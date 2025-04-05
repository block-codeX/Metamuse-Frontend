import { useCanvas } from "../contexts/canvas-context";
import ColorPalette from "../formatting/color-palette";

const RightSideTools: React.FC = () => {
  const { setBackgroundColor, setForegroundColor, canvas, isEraser } = useCanvas();

  const updateForeColor = (color: string) => {
    if (!canvas) return;
    setForegroundColor(color);
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const updateBackColor = (color: string) => {
    setBackgroundColor(color);
    if (isEraser) {
      canvas.freeDrawingBrush.color = color;
    }
  };
  return (
    <div className="w-full h-full py-2 flex flex-row items-center justify-center">
      <ColorPalette
        onSelectFore={updateForeColor}
        onSelectBack={updateBackColor}
      />
    </div>
  );
};
export default RightSideTools;
