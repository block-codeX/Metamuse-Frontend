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

interface IActiveObj {
  width: number,
  height: number,
  objType: "object" | "picture" | string
}

export interface CanvasSettings {
  dimensions: {
    width: number;
    height: number
  }
  preset: any
}
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
  preset: string
  setPreset: Dispatch<SetStateAction<string>>
  setDimensions: Dispatch<SetStateAction<{ width: number; height: number }>>
  dimensions: { width: number; height: number };
  isEraser: boolean,
  setEraser: Dispatch<SetStateAction<boolean>>,
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
  isShape: boolean,
  setIsShape: Dispatch<SetStateAction<boolean>>,
  isFill: boolean,
  setFill: Dispatch<SetStateAction<boolean>>,activeObjDimensions: IActiveObj,
  setActiveObjDimensions: Dispatch<SetStateAction<IActiveObj>>
  brushType: string
  setBrushType: Dispatch<SetStateAction<string>>
  canvasSettings: CanvasSettings | null
  setCanvasSettings: Dispatch<SetStateAction<CanvasSettings | null>>
  isYjsSettingsUpdate: RefObject<boolean>
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
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isShape, setIsShape] = useState(false);
  const [isFill, setFill] = useState(false)
  const [gradientType, setGradientType] = useState("linear");
  const [angle, setAngle] = useState(0);
  const [fromColor, setFromColor] = useState("#000000");
  const [toColor, setToColor] = useState("#FFFFFF");
  const [pattern, setPattern] = useState("adire");
  const [preset, setPreset] = useState("Portrait (Mobile)")
  const [brushType, setBrushType] = useState("pencil")
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings | null>(null)
  const isYjsSettingsUpdate = useRef(false)
  const [activeObjDimensions, setActiveObjDimensions] = useState(
    {
      width: 0,
      height: 0,
      objType: ""
    }
  )
  const [dimensions, setDimensions] = useState({
    width: 375,
    height: 667,
  });
  const undoStack: RefObject<string[]> = useRef([])
  const redoStack: RefObject<string[]> = useRef([])
  fabric.FabricObject.prototype.erasable = "deep";
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
    if (isYjsSettingsUpdate.current) {
        console.log("Provider: Skipping Yjs update (change was from Yjs)");
        return;
    }
    console.log("Provider: Local change detected, updating Fabric & preparing Yjs update", dimensions, preset, isYjsSettingsUpdate.current);
     if (canvas) {
         if (canvas.getWidth() !== dimensions.width || canvas.getHeight() !== dimensions.height) {
             canvas.setDimensions(dimensions);
             canvas.renderAll();
         }
     }

}, [dimensions, preset, canvas]); // Add canvas dependency


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
        saveState,
        isShape,
        setIsShape,
        activeObjDimensions,
        setActiveObjDimensions,
        preset,
        setPreset,
        isFill,
        setFill,
        brushType,
        setBrushType,
        canvasSettings,
        setCanvasSettings,
        isYjsSettingsUpdate
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
