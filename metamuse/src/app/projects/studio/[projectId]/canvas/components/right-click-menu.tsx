import { useCanvas } from "./contexts/canvas-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import * as fabric from "fabric";
import useEditFunctions from "./tools/edit-functions";
import { Clipboard, Copy, Delete, Scissors, Trash, Trash2 } from "lucide-react";
export default function CanvasContextMenu({ children }) {
  const { canvas } = useCanvas();
  const { cut, deleteObj, copy, paste, duplicate, group, ungroup, bringToBack, sendToFront, lock, unlock} = useEditFunctions()


  

  const handleSendToBack = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.sendToBack(obj);
      canvas.renderAll();
    }
  };




  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <div className="flex flex-row items-center justify-evenly gap-2 py-2">
          <Scissors strokeWidth={1.5} size={18} className="text-btn-primary active:scale-95 cursor-pointer"
          onClick={cut}/>
          <Copy strokeWidth={1.5} size={18} className="text-btn-primary active:scale-95 cursor-pointer"
          onClick={copy}/>
          <Clipboard strokeWidth={1.5} size={18} className="text-btn-primary active:scale-95 cursor-pointer"
          onClick={paste}/>
          <Trash2 strokeWidth={1.5} size={18} className="text-red-500 active:scale-95 cursor-pointer"
          onClick={deleteObj}/>
          </div>
        <ContextMenuItem onClick={group}>Group</ContextMenuItem>
        <ContextMenuItem onClick={ungroup}>Ungroup</ContextMenuItem>
        <ContextMenuItem onClick={sendToFront}>Send to Front</ContextMenuItem>
        <ContextMenuItem onClick={bringToBack}>Send to Back</ContextMenuItem>
        <ContextMenuItem onClick={lock}>Lock</ContextMenuItem>
        <ContextMenuItem onClick={unlock}>Unlock</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}