"use client";
import { useCanvas } from "./contexts/canvas-context";
import CanvasContextMenu from "./right-click-menu";
import { useKeyBindingTools } from "./tools/delete-tool";
import { useEffect, useState, useRef, useCallback } from "react";

export default function CanvasComponent() {
  const { canvasRef, dimensions } = useCanvas();
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [prevDimensions, setPrevDimensions] = useState({ width: 0, height: 0 });
  
  useKeyBindingTools();
  
  // Function to calculate the initial scale to fit canvas in container
  const calculateInitialScale = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return 1;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Add padding (80% of container)
    const paddingFactor = 0.8;
    const widthRatio = (containerWidth * paddingFactor) / canvas.width;
    const heightRatio = (containerHeight * paddingFactor) / canvas.height;
    
    // Return the smaller ratio to ensure the entire canvas fits
    return Math.min(widthRatio, heightRatio);
  }, [canvasRef]);
  

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
      // Zoom if control/command key is pressed
      e.preventDefault();
      
      const delta = e.deltaY * -0.001; // Adjust sensitivity as needed
      const newScale = Math.min(Math.max(0.1, scale + delta), 5); // Limit zoom range
      
      // Get mouse position relative to canvas
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate new position to zoom towards mouse cursor
      const newX = position.x - (mouseX - position.x) * (newScale / scale - 1);
      const newY = position.y - (mouseY - position.y) * (newScale / scale - 1);
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
  
  };
  
  // Pan handling
  const handleMouseDown = (e) => {
    // Pan with middle mouse button (button === 1) or when holding space key with left mouse button
    // or when zoomed in beyond 1.0 and using left mouse button directly
    if (e.button === 1 || 
        (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
      
      // Change cursor to indicate panning
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }
  };
  
  const handleMouseMove = (e) => {  
    if (isPanning) {
      setPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
    
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  };
  
  // Center the canvas in the container
  const centerCanvas = useCallback((scale = 1) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Center the canvas in the viewport
    const newX = (container.clientWidth - canvas.width * scale) / 2;
    const newY = (container.clientHeight - canvas.height * scale) / 2;
    
    setPosition({ x: newX, y: newY });
  }, [canvasRef]);
  
  // Reset to fit canvas in view
  const resetView = useCallback(() => {
    const newScale = calculateInitialScale();
    setScale(newScale);
    centerCanvas(newScale);
  }, [calculateInitialScale, centerCanvas]);
  
  // Handle dimension changes from canvas context
  useEffect(() => {
    if (dimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height)) {
      // Store new dimensions for future comparison
      setPrevDimensions({ width: dimensions.width, height: dimensions.height });
      
      // When dimensions change, reset view to center the canvas with proper scaling
      if (dimensions.width > 0 && dimensions.height > 0) {
        setTimeout(() => {
          resetView();
        }, 50); // Small delay to ensure canvas has updated
      }
    }
  }, [dimensions, prevDimensions, resetView]);

  // Initialize and handle container resize
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      // Initial scaling
      const initialScale = calculateInitialScale();
      setScale(initialScale);
      centerCanvas(initialScale);
      
      // Handle window resize
      const handleResize = () => {
        resetView();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [calculateInitialScale, centerCanvas, resetView]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        // Clear any event listeners
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [canvasRef]);
  
  return (
    <div className="relative w-full h-full overflow-hidden cursor-grab touch-none" 
         ref={containerRef}
         onWheel={handleWheel}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}>
      
      {/* Canvas wrapper with transform */}
      <div
        className="absolute transform-gpu"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <CanvasContextMenu>
        <canvas
          ref={canvasRef}
          className="border border-gray-300 shadow-md"
        />
        </CanvasContextMenu>
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-75 p-2 rounded-md shadow-md flex gap-2">
        <button 
          onClick={() => {
            const newScale = Math.min(scale * 1.2, 5);
            setScale(newScale);
            
            // If we're not already panned, keep canvas centered during zoom
            if (!isPanning) {
              centerCanvas(newScale);
            }
          }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          title="Zoom In"
        >
          +
        </button>
        <button 
          onClick={() => {
            const newScale = Math.max(scale / 1.2, 0.1);
            setScale(newScale);
            
            // If we're not already panned, keep canvas centered during zoom
            if (!isPanning  ) {
              centerCanvas(newScale);
            }
          }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          title="Zoom Out"
        >
          -
        </button>
        <button 
          onClick={resetView}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          title="Reset View"
        >
          Reset
        </button>
        <span className="p-2">
          {Math.round(scale * 100)}%
        </span>
      </div>
      
      {/* Panning info overlay - shows only when zoomed in */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-75 p-2 rounded-md shadow-md text-sm">
          <p>Click and drag to pan</p>
          <p className="text-xs text-gray-600 mt-1">Mousewheel to zoom</p>
          <p className="text-xs text-gray-600">Ctrl + hold and drag to pan</p>
        </div>
      
      {/* Context menu */}
      {/* <CanvasContextMenu /> */}
    </div>
  );
}