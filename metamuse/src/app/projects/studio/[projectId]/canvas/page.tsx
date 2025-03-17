"use client"
import { CanvasProvider } from "./components/canvas-context";
import CanvasComponent from "./components/canvas-component";
import Toolbar from "./components/toolbar";
import FooterTools from "./components/footer-tools";

export default function Home() {
  return (
    <CanvasProvider>
      <div className="relative w-full h-screen">
        <CanvasComponent />
        <Toolbar />
        <FooterTools />
      </div>
    </CanvasProvider>
  );
}
