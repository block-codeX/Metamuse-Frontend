"use client"
import React, { useState, useEffect } from 'react';
import { AlertCircle, Monitor } from 'lucide-react';

const MinimumWidthGuard = ({ 
  minWidth = 768, // Default minimum width in pixels
  children 
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 769
  );
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width
    setWindowWidth(window.innerWidth);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (windowWidth < minWidth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6 z-50">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-full mb-4">
          <Monitor className="w-12 h-12 text-gray-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Screen Too Small
        </h2>
        
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-gray-500" />
          <p className="text-gray-500 font-medium">
            Minimum width: {minWidth}px
          </p>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
          This application requires a larger screen width to function properly. 
          Please use a desktop or tablet device with a screen width of at least {minWidth}px.
        </p>
        
        <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800 rounded-full h-4 mb-6">
          <div 
            className="bg-gray-500 h-4 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(100, (windowWidth / minWidth) * 100)}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Current width: {windowWidth}px
        </p>
      </div>
    );
  }
  
  return children;
};

export default MinimumWidthGuard;