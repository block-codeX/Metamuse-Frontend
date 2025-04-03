"use client";
import { CanvasProvider } from "./components/contexts/canvas-context";
import CanvasComponent from "./components/canvas-component";
// import LeftSide from "./components/left-side-tools";
import FooterTools from "./components/footer-tools";
import LeftSideTools from "./components/left-side-tools";
import TopSideTools from "./components/top-side-tools";
import CanvasSyncProvider from "./components/contexts/canvas-sync-context";
import { useParams } from "next/navigation";
import { useZoomPan } from "./components/orientation/tools/zoom";
import { useCanvasOrientation } from "./components/orientation/hooks/orientation";
// import RightSideTools from "./components/right-side-tools"; // You'll need to create this

export default function Home() {
  const { projectId } = useParams();
  
  return (
    <CanvasProvider >
      <CanvasSyncProvider projectId={projectId?.toString() as string}>
        <div className="w-full h-[calc(100vh-60px)] fixed flex flex-col border border-red">
          {/* Top Toolbar */}
          <div className="w-full h-22">
            <TopSideTools />
          </div>

          {/* Middle Section with Side Tools and Canvas */}
          <div className="flex flex-1 w-full overflow-hidden">
            {/* Left Side Tools */}
            <div className="w-10 h-full">
              <LeftSideTools />
            </div>

            {/* Canvas Area - Central and Largest */}
            <div className="flex-1 bg-gray-300 overflow-auto   flex flex-row items-center justify-center relative">
              <CanvasComponent />
            </div>

            {/* Right Side Tools */}
            <div className="w-10 h-full ">{/* <RightSideTools /> */}</div>
          </div>

          {/* Bottom Footer Tools */}
          {/* <div className="w-full h-16 flex flex-row justify-end items-center">
            <FooterTools />
          </div> */}
        </div>
      </CanvasSyncProvider>
    </CanvasProvider>
  );
}
