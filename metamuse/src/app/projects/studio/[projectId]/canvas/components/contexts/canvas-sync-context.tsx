
import { useEffect } from "react";
import { useCanvas } from "./canvas-context";
import useCanvasSync from "../canvas-sync-component";

const CanvasSyncProvider = ({ children, projectId }: { children: React.ReactNode; projectId: string }) => {
  const { canvas } = useCanvas();
  const { yDoc } = useCanvasSync(projectId);

  useEffect(() => {
    if (!canvas || !yDoc) return;

    // Additional setup if needed

    return () => {
      // Cleanup if needed
    };
  }, [canvas, yDoc]);

  return <>{children}</>;
};

export default CanvasSyncProvider;