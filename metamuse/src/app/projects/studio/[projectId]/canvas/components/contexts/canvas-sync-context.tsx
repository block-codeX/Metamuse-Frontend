
import { useEffect } from "react";
import { useCanvas } from "./canvas-context";
import useCanvasSync from "../canvas-sync-component";

const CanvasSyncProvider = ({ children, projectId }: { children: React.ReactNode; projectId: string }) => {
  const { canvas } = useCanvas();
  const { yDoc, provider } = useCanvasSync(projectId);

  useEffect(() => {
    if (!canvas || !yDoc || !provider) return;

    // Additional setup if needed

    return () => {
      // Cleanup if needed
    };
  }, [canvas, yDoc, provider]);

  return <>{children}</>;
};

export default CanvasSyncProvider;