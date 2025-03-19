"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

const CanvasContext = createContext(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [pencilWidth, setPencilWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [fontStyle, setFontStyle] = useState('Arial')
  const [fontSize, setFontSize] = useState(24);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: backgroundColor,
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
    <CanvasContext.Provider
      value={{
        canvas,
        canvasRef,
        foregroundColor,
        setForegroundColor,
        backgroundColor,
        setBackgroundColor,
        pencilWidth,
        setPencilWidth,
        eraserWidth,
        setEraserWidth,
        fontStyle,
        setFontStyle,
        fontSize,
        setFontSize,
        isBold,
        setIsBold,
        isItalic,
        setIsItalic,
        isUnderline,
        setIsUnderline,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  return useContext(CanvasContext);
}
