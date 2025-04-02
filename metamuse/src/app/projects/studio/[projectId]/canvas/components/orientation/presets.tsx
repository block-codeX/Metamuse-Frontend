// src/lib/presets.ts
export type CanvasPreset = {
    name: string;
    dimensions: { width: number; height: number };
    aspectRatio?: number;
  };
  
  export const PRESETS: CanvasPreset[] = [
    { 
      name: "Portrait (Mobile)", 
      dimensions: { width: 375, height: 667 } 
    },
    { 
      name: "Landscape (HD)", 
      dimensions: { width: 1920, height: 1080 } 
    },
    { 
      name: "Letter (US)", 
      dimensions: { width: 2550, height: 3300 }, // 8.5" x 11" @ 300dpi
      aspectRatio: 8.5/11
    },
    { 
      name: "A4 (ISO)", 
      dimensions: { width: 2480, height: 3508 }, // 210mm x 297mm @ 300dpi
      aspectRatio: 210/297
    },
    { 
      name: "Square", 
      dimensions: { width: 1080, height: 1080 } 
    },
    {
      name: "Custom",
      dimensions: { width: 0, height: 0 }
    }
  ];