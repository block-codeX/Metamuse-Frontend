import ToolOption from "./tool-options";
import { useNavigateTools } from "./tools/navigate-tools";
import { useFreeDrawingTools } from "./tools/free-drawing-tools";
import { useShapeTools } from "./tools/shape-tools";
import { useFillTools } from "./tools/fill-tools";
import { useClipTools } from "./tools/clip-tools";
import { useState } from "react";
export default function LeftSideTools() {
  const navigateTools = useNavigateTools();
 const freeDrawingTools = useFreeDrawingTools();
 const shapeTools  = useShapeTools();
 const fillTools = useFillTools();
 const clipTools = useClipTools();
 const [activeTool, setActiveTool] = useState("nav")
  return (
    <div className=" flex flex-col bg-background  space-y-2 border h-full mb-2 border-t-0 p-3">
      <ToolOption tools={navigateTools} group="nav"current={activeTool} use={setActiveTool}/>
      <ToolOption tools={freeDrawingTools} group="draw" current={activeTool} use={setActiveTool}/>
      <ToolOption tools={shapeTools} group="shape" current={activeTool} use={setActiveTool}/>
      <ToolOption tools={fillTools} group="fill" current={activeTool} use={setActiveTool}/>
      <ToolOption tools={clipTools} group="clip" current={activeTool} use={setActiveTool}/>
    </div>
  );
}
