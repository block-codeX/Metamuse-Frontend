const handleLockCommand = (canvas: any, payload: any) => {
  const { objectId } = payload;
  const obj = canvas.getObjects().find((o: any) => o.id === objectId);
  if (obj) {
    obj.selectable = false;
    canvas.requestRenderAll();
  }
};

const handleUnlockCommand = (canvas: any, payload: any) => {
  const { objectId } = payload;
  const obj = canvas.getObjects().find((o: any) => o.id === objectId);
  if (obj) {
    obj.selectable = true;
    obj.hoverCursor = "move";
    obj.evented = true;

    canvas.requestRenderAll();
  }
};

const handleBringToFrontCommand = (canvas: any, payload: any) => {
  const { objectId } = payload;
  const obj = canvas.getObjects().find((o: any) => o.id === objectId);
  if (obj) {
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
  }
};

const handleSendToBackCommand = (canvas: any, payload: any) => {
  const { objectId } = payload;
  const obj = canvas.getObjects().find((o: any) => o.id === objectId);
  if (obj) {
    canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
  }
};

const handleGroupCommand = async (canvas: any, payload: any) => {
  const { objectIds, groupId } = payload;
  const objectsToGroup = canvas
    .getObjects()
    .filter((o: any) => objectIds.includes(o.id));

  if (objectsToGroup.length < 2) return;

  // Create the group
  try {
    const group = new fabric.Group(objectsToGroup);
    group.id = groupId;

    // Remove original objects from canvas
    objectsToGroup.forEach((obj) => canvas.remove(obj));

    // Add the group
    canvas.add(group);
    canvas.requestRenderAll();
  } catch (error) {
    console.error("Error creating group during sync:", error);
  }
};

const handleUngroupCommand = async (canvas: any, payload: any) => {
  const { groupId, objectIds } = payload;
  const group = canvas.getObjects().find((o: any) => o.id === groupId);

  if (!group || group.type !== "group") return;

  try {
    // Get objects from the group
    const items = group.getObjects();

    // Remove the group
    canvas.remove(group);

    // Add individual objects back to canvas
    items.forEach((obj, index) => {
      // Ensure IDs match what was sent
      if (objectIds[index]) {
        obj.id = objectIds[index];
      }
      canvas.add(obj);
    });

    canvas.requestRenderAll();
  } catch (error) {
    console.error("Error ungrouping during sync:", error);
  }
};

const handleCommands = async (canvas: any, commandData: any) => {
  switch (commandData.command) {
    case "group":
      await handleGroupCommand(canvas, commandData.payload);
      break;
    case "ungroup":
      await handleUngroupCommand(canvas, commandData.payload);
      break;
    case "lock":
      handleLockCommand(canvas, commandData.payload);
      break;
    case "unlock":
      handleUnlockCommand(canvas, commandData.payload);
      break;
    case "bringToFront":
      handleBringToFrontCommand(canvas, commandData.payload);
      break;
    case "sendToBack":
      handleSendToBackCommand(canvas, commandData.payload);
      break;
    default:
      console.warn("Unknown command:", commandData.command);
  }
};
export default handleCommands;
