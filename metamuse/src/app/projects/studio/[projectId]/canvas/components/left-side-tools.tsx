import ToolOption from "./tool-options";
import { useNavigateTools } from "./tools/navigate-tools";
import { useFreeDrawingTools } from "./tools/free-drawing-tools";
import { useShapeTools } from "./tools/shape-tools";
import { useFillTools } from "./tools/fill-tools";
import { useClipTools } from "./tools/clip-tools";
export default function LeftSideTools() {
  const navigateTools = useNavigateTools();
 const freeDrawingTools = useFreeDrawingTools();
 const shapeTools  = useShapeTools();
 const fillTools = useFillTools();
 const clipTools = useClipTools();
  return (
    <div className=" flex flex-col bg-background shadow-md space-y-2 border h-full mb-2 mx-2 rounded-md ">
      <ToolOption tools={navigateTools} />
      <ToolOption tools={freeDrawingTools} />
      <ToolOption tools={shapeTools} />
      <ToolOption tools={fillTools} />
      <ToolOption tools={clipTools} />
    </div>
  );
}
