import ToolOption from "./tool-options";
import { useNavigateTools } from "./tools/navigate-tools";
import { useFreeDrawingTools } from "./tools/free-drawing-tools";
import { useShapeTools } from "./tools/shape-tools";
import { useFillTools } from "./tools/fill-tools";
import { useClipTools } from "./tools/clip-tools";
export default function Toolbar() {
  const navigateTools = useNavigateTools();
 const freeDrawingTools = useFreeDrawingTools();
 const shapeTools  = useShapeTools();
 const fillTools = useFillTools();
 const clipTools = useClipTools();
  return (
    <div className="absolute left-4 top-3 flex flex-col bg-background shadow-xl space-y-2 border h-[85%] rounded-md ">
      <ToolOption tools={navigateTools} />
      <ToolOption tools={freeDrawingTools} />
      <ToolOption tools={shapeTools} />
      <ToolOption tools={fillTools} />
      <ToolOption tools={clipTools} />

    </div>
  );
}
