"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

const CanvasContext = createContext(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const canvasRef: any = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fff",
      selection: false,
    });
    fabricCanvas.setWidth(window.innerWidth);
    fabricCanvas.setHeight(window.innerHeight - 100);
    setCanvas(fabricCanvas);

    const handleResize = () => {
      fabricCanvas.setWidth(window.innerWidth);
      fabricCanvas.setHeight(window.innerHeight - 100);
      fabricCanvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  return (
    <CanvasContext.Provider value={{ canvas, canvasRef }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  return useContext(CanvasContext);
}
