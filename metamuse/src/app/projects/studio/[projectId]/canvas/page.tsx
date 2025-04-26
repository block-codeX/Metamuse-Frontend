"use client";
import { CanvasProvider } from "./components/contexts/canvas-context";
import CanvasComponent from "./components/canvas-component";
import LeftSideTools from "./components/major-tool-bars/left-side-tools";
import TopSideTools from "./components/major-tool-bars/top-side-tools";
import { CanvasSyncProvider } from "./components/contexts/canvas-sync-context";
import { useParams } from "next/navigation";
import RightSideTools from "./components/major-tool-bars/right-side-tools";
import FloatingTools from "./components/major-tool-bars/floating-tools";
import MinimumWidthGuard from "@/app/components/minimum-width";

export default function Home() {
  const { projectId } = useParams();

  return (
    <MinimumWidthGuard minWidth={768}>
      <CanvasProvider>
        <CanvasSyncProvider projectId={projectId?.toString() as string}>
          <div className="w-full h-full my-6 flex flex-col">
            {/* Top Toolbar */}
            <div className="w-full h-24">
              <TopSideTools />
            </div>

            {/* Middle Section with Side Tools and Canvas */}
            <div className="flex flex-1 w-full overflow-hidden">
              {/* Left Side Tools */}
              <div className="w-auto h-full">
                <LeftSideTools />
              </div>

              {/* Canvas Area - Central and Largest */}
              <div className="flex-1 bg-gray-300 overflow-auto   flex flex-row items-center justify-center relative">
                <CanvasComponent />
              </div>

              {/* Right Side Tools */}
              <FloatingTools />
              <div className="w-20 h-full ">
                <RightSideTools />
              </div>
              {/* Popover tools that expand functionality*/}
            </div>
          </div>
        </CanvasSyncProvider>
      </CanvasProvider>
    </MinimumWidthGuard>
  );
}
