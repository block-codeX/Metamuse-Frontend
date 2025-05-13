"use client";
import * as fabric from "fabric";
export function preserveCustomPatternProps(
  sourceObj: fabric.Object,
  targetObj: fabric.Object
) {
  const srcFill = sourceObj.fill as any;
  const tgtFill = targetObj.fill as any;

  if (
    srcFill &&
    srcFill.source &&
    typeof srcFill === "object" &&
    tgtFill &&
    tgtFill.source
  ) {
    if (srcFill.name) tgtFill.name = srcFill.name;
    if (srcFill.color) tgtFill.color = srcFill.color;
  }
}
export const findObjects = (canvas: fabric.Canvas, isMulti=false, ...ids: string[]) => {
    if (!canvas || ids.length === 0) return [];
    const pool =  canvas.getObjects().filter((obj: any) => ids.includes(obj.id));
    if (isMulti) {
        return pool;
    } else {
        return pool[0] || null;
    }

};
export const group = (canvas: fabric.Canvas, objects: any[], recipient) => {
  if (!canvas) return;
  if (objects.length === 0) return;
  const group = new fabric.Group(objects);
  if (recipient) {
    group.id = recipient;
    group.commanded = true
}
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.renderAll();
};
export const ungroup = (canvas: fabric.Canvas, group: any) => {
  if (!canvas) return;
  if (!group || group.type !== "group") {
    return;
  }
  const sel = new fabric.ActiveSelection(group.removeAll(), {
    canvas: canvas,
  });
  canvas.remove(group);
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
};
export const sendToFront = (canvas: fabric.Canvas, obj: any) => {
  if (!canvas) return;
  if (obj) {
    canvas.bringObjectForward(obj);
    canvas.renderAll();
  }
};
export const bringToBack = (canvas: fabric.Canvas, obj: any) => {
  if (!canvas) return;
  if (obj) {
    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
  }
};

export const lock = (canvas: fabric.Canvas, obj) => {
  if (!canvas) return;
  if (obj) {
    obj.selectable = false;
    obj.currentLock = `lock ${obj.getX()} ${obj.getY()}`;
    obj.evented = false;
    canvas.renderAll();
  }
};
export const unlock = (canvas: fabric.Canvas, targetObject: any) => {
  if (!canvas) return;
  // Only unlock if we found an object and it's locked
  if (targetObject && targetObject.selectable === false) {
    targetObject.selectable = true;
    targetObject.hoverCursor = "move";
    targetObject.evented = true;
    // Only rendering the specific object is more efficient
    canvas.requestRenderAll();
  }
};

const handleCommands = (command: string, target: any, canvas: fabric.Canvas, recipient = null) => {
    switch (command) {
        case "group": {
            const objects = findObjects(canvas, true, ...(target as string[]));
            group(canvas, (objects as any[]), recipient);
            break;
        }
        case "ungroup": {
            const object = findObjects(canvas, target)
            ungroup(canvas, object);
            break;
        }
        case "lock": {
            const object = findObjects(canvas, target)
            lock(canvas, object);
            break;
        }
        case "unlock": {
            const object = findObjects(canvas, target)
            unlock(canvas, object);
            break;
        }
        case "sendToBack": {
            const object = findObjects(canvas, target)
            bringToBack(canvas, object);
            break;
        }
        case "sendToFront": {
            const object = findObjects(canvas, target)
            sendToFront(canvas, object);
            break;
        }

    }

}
export default handleCommands