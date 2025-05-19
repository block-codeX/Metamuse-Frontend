import { useCanvas } from "./contexts/canvas-context";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import * as fabric from "fabric";
import useEditFunctions from "./tools/edit-functions";
import {
  Clipboard,
  Copy,
  Delete,
  Redo,
  Scissors,
  Trash,
  Trash2,
  Undo,
} from "lucide-react";

export default function CanvasContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canvas } = useCanvas();
  const {
    cut,
    duplicate,
    deleteObj,
    copy,
    paste,
    group,
    ungroup,
    bringToBack,
    sendToFront,
    lock,
    unlock,
    setTargetObject,
  } = useEditFunctions();

  // Store the right-clicked object
  const handleContextMenuOpen = (event: React.MouseEvent) => {
    if (!canvas) return;
    const targetObject = canvas.findTarget(event.nativeEvent);
    console.log("Right-clicked object:", targetObject);
    setTargetObject(targetObject as any);
  };

  return (
    <ContextMenu onOpenChange={(open) => !open && setTargetObject(null)}>
      <ContextMenuTrigger onContextMenu={handleContextMenuOpen}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <div className="flex flex-row items-center justify-evenly gap-3 py-2 px-2">
          <Scissors
            strokeWidth={3}
            size={18}
            color={"#ff8b2c"}
            className="active:scale-95 transition-all transition-200 cursor-pointer"
            onClick={cut}
          />
          <Copy
            strokeWidth={3}
            size={18}
            color={"#ff8b2c"}
            className="active:scale-95  transition-all transition-200 cursor-pointer"
            onClick={copy}
          />
          <Clipboard
            strokeWidth={3}
            size={18}
            color={"#ff8b2c"}
            className="active:scale-95 transition-all transition-200 cursor-pointer"
            onClick={paste}
          />
          <Trash2
            strokeWidth={3}
            size={18}
            color={"#ff8b2c"}
            className="active:scale-95 transition-all transition-200 cursor-pointer"
            onClick={deleteObj}
          />
        </div>
                <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={duplicate}
        >
          Duplicate
          <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl D
          </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={group}
        >
          Group
          <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl G
          </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={ungroup}
        >
          Ungroup
                    <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl Shift G
          </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={sendToFront}
        >
          Send to Front
            <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl &#93;
            </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={bringToBack}
        >
          Send to Back
            <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl &#91;
            </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between gap-4"
          onClick={lock}
        >
          Lock
          <span className="font-satoshi font-semibold text-xs text-text-primary/50">
            Ctrl L
          </span>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex flex-row items-center justify-between"
          onClick={unlock}
        >
          Unlock
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
