import { useCanvas } from "./contexts/canvas-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import * as fabric from "fabric";
export default function CanvasContextMenu({ children }) {
  const { canvas } = useCanvas();

  const handleGroup = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      const group = new fabric.Group(activeObjects);
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    }
  };

  const handleUngroup = () => {
    if (!canvas) return;
  
    const activeObject = canvas.getActiveObject();
  
    if (activeObject && activeObject.type === "group") {
      const items = activeObject._objects; // Get grouped objects
      activeObject._restoreObjectsState(); // Restore objects' original positions
  
      // Remove the group itself from the canvas
      canvas.remove(activeObject);
  
      // Add each object back to the canvas separately
      items.forEach((item) => {
        canvas.add(item);
        item.set("active", true); // Ensure they remain selectable
      });
  
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };
  

  const handleSendToFront = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.bringToFront(obj);
      canvas.renderAll();
    }
  };

  const handleSendToBack = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.sendToBack(obj);
      canvas.renderAll();
    }
  };

  const handleLock = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.selectable = false;
      obj.evented = false;
      canvas.renderAll();
    }
  };

  const handleUnlock = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.selectable = true;
      obj.evented = true;
      canvas.renderAll();
    }
  };

  const handleDelete = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleGroup}>Group</ContextMenuItem>
        <ContextMenuItem onClick={handleUngroup}>Ungroup</ContextMenuItem>
        <ContextMenuItem onClick={handleSendToFront}>Send to Front</ContextMenuItem>
        <ContextMenuItem onClick={handleSendToBack}>Send to Back</ContextMenuItem>
        <ContextMenuItem onClick={handleLock}>Lock</ContextMenuItem>
        <ContextMenuItem onClick={handleUnlock}>Unlock</ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-red-500">
          Delete Object
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}