"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  RefObject,
} from "react";
import * as fabric from "fabric";
import { CanvasPreset, PRESETS } from "../orientation/presets";

export interface CanvasContextType {
  canvas: fabric.Canvas | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  foregroundColor: string;
  setForegroundColor: Dispatch<SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: Dispatch<SetStateAction<string>>;
  pencilWidth: number;
  setPencilWidth: Dispatch<SetStateAction<number>>;
  eraserWidth: number;
  setEraserWidth: Dispatch<SetStateAction<number>>;
  fontStyle: string;
  setFontStyle: Dispatch<SetStateAction<string>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  isBold: boolean;
  setIsBold: Dispatch<SetStateAction<boolean>>;
  isItalic: boolean;
  setIsItalic: Dispatch<SetStateAction<boolean>>;
  isUnderline: boolean;
  setIsUnderline: Dispatch<SetStateAction<boolean>>;
  isStrikethrough: boolean;
  setIsStrikethrough: Dispatch<SetStateAction<boolean>>;
  isSubscript: boolean;
  setIsSubscript: Dispatch<SetStateAction<boolean>>;
  isSuperscript: boolean;
  setIsSuperscript: Dispatch<SetStateAction<boolean>>;

  setDimensions: Dispatch<SetStateAction<{ width: number; height: number }>>
  dimensions: { width: number; height: number };
  isEraser: boolean,
  setEraser: Dispatch<SetStateAction<boolean>>,
  floating: string,
  setFloating: Dispatch<SetStateAction<string>>,
  gradientType: string,
  setGradientType: Dispatch<SetStateAction<string>>,
  angle: number,
  setAngle: Dispatch<SetStateAction<number>>,
  fromColor: string,
  setFromColor: Dispatch<SetStateAction<string>>,
  toColor: string,
  setToColor: Dispatch<SetStateAction<string>>,
  pattern: string,
  setPattern: Dispatch<SetStateAction<string>>,
  undoStack: RefObject<string[]>,
  redoStack: RefObject<string[]>,
  saveState: () => void
}
const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [pencilWidth, setPencilWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [fontStyle, setFontStyle] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isEraser, setEraser] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [floating, setFloating] = useState("");
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(0);
  const [fromColor, setFromColor] = useState("#000000");
  const [toColor, setToColor] = useState("#FFFFFF");
  const [pattern, setPattern] = useState("adire");
  const [dimensions, setDimensions] = useState({
    width: 375,
    height: 667,
  });
  const undoStack: RefObject<string[]> = useRef([])
  const redoStack: RefObject<string[]> = useRef([])
  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: backgroundColor,
      selection: false,
    });
    fabricCanvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 100,
    });
    setCanvas(fabricCanvas);

    const handleResize = () => {
      fabricCanvas.setDimensions({
      });
      fabricCanvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvas.dispose();
    };
  }, []);
  const saveState = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    undoStack.current.push(json)
    redoStack.current = []
  };
  useEffect(() => {
    if (!canvas) return;
    canvas.setDimensions(dimensions);
    canvas.renderAll()
  }, [dimensions, canvas]);

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
        dimensions,
        setDimensions,
        isEraser,
        setEraser,
        floating,
        setFloating,
        isStrikethrough,
        setIsStrikethrough,
        isSubscript,
        setIsSubscript,
        isSuperscript,
        setIsSuperscript,
        gradientType,
        setGradientType,
        angle,
        setAngle,
        fromColor,
        setFromColor,
        toColor,
        setToColor,
        pattern,
        setPattern,
        undoStack,
        redoStack,
        saveState
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function   useCanvas(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
