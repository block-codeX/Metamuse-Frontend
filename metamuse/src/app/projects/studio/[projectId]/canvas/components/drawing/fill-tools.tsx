import * as fabric from "fabric";
import { useCanvas } from "../contexts/canvas-context";
import { PaintBucket, SquarePen, Waves, Palette, Image as ImageIcon, Copy } from "lucide-react"; // New icons
import { useRef } from "react";

export function useFillTools() {
    const { canvas, foregroundColor, backgroundColor, pencilWidth } = useCanvas(); // Get required context values

    // Ref to prevent attaching multiple 'click-to-fill' listeners
    const isClickModeActive = useRef(false);

    // --- Cleanup Function ---
    const cleanupToolEventListeners = () => {
        if (!canvas) return;
        canvas.off("mouse:down"); // Remove the specific click-to-fill listener if active
        canvas.defaultCursor = "default";
        canvas.selection = true; // Ensure selection is enabled
        canvas.forEachObject(o => o.selectable = true);
        isClickModeActive.current = false; // Reset flag
        console.log("Fill tool listeners cleaned up.");
        // No need to renderAll here usually, action would have triggered render
    };

    // --- Core Action Functions ---

    // Applies solid fill or outline to selected object or activates click-to-fill/background
    const applySolidAction = (actionType: 'fill' | 'stroke') => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        const color = foregroundColor; // Use current foreground color
        const strokeWidth = pencilWidth; // Use current width for outline

        if (activeObject) {
            // Mode 1: Apply to selected object
            const properties: Partial<fabric.Object> = {};
            if (actionType === 'fill') {
                properties.fill = color;
                 // Also set stroke if filling, maybe? Or keep separate? Keep separate for now.
            } else { // stroke
                properties.stroke = color;
                properties.strokeWidth = strokeWidth;
                 // Ensure stroke isn't erased by fill being set later? Fabric handles this okay.
            }
            activeObject.set(properties);
            canvas.renderAll();
            console.log(`${actionType} applied to selected object.`);
        } else if (actionType === 'fill' && !isClickModeActive.current) {
            // Mode 2: Activate click-to-fill/background mode (only for fill)
            console.log("Activating click-to-fill mode...");
            isClickModeActive.current = true;
            canvas.defaultCursor = 'copy'; // Indicate fill action
            canvas.selection = false; // Disable selection during this mode
            canvas.forEachObject(o => o.selectable = false);

            const handleFillClick = (opt: fabric.IEvent<MouseEvent>) => {
                const target = canvas.findTarget(opt.e, false); // Find object under click
                if (target && target.type !== 'activeSelection') { // Don't fill the selection box itself
                    console.log("Filling clicked object:", target.type);
                    target.set('fill', color);
                } else {
                    // Clicked on background
                    console.log("Filling background");
                    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
                }
                cleanupToolEventListeners(); // Cleanup after the click action is done
            };

            // Add listener *once*
            canvas.once("mouse:down", handleFillClick); // Use once to auto-remove after firing
        } else if (actionType === 'stroke') {
             console.log("Outline tool requires an object to be selected.");
             // Optionally provide user feedback here (e.g., toast notification)
        }
    };


    // Applies gradient fill to selected object or activates click-to-fill/background
    const applyGradientAction = (gradientType: 'linear' | 'radial') => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        const colors = [foregroundColor, backgroundColor]; // Use current fore/back colors for gradient

        // Default linear gradient (left to right)
        let coords: fabric.IGradientOptions['coords'] = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
        if (gradientType === 'radial') {
            // Default radial gradient (center out)
            coords = { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 0.5 }; // r2=0.5 to fill object bounds
        }
        // Note: Angle isn't easily supported by default Fabric gradients without recalculating coords based on object bounds.
        // Sticking to default orientations for simplicity.

        const gradient = new fabric.Gradient({
            type: gradientType,
            gradientUnits: "percentage", // relative to object bounds
            coords: coords,
            colorStops: [
                { offset: 0, color: colors[0] || foregroundColor }, // Fallback just in case
                { offset: 1, color: colors[1] || backgroundColor },
            ],
        });

        if (activeObject) {
            // Mode 1: Apply to selected object
            activeObject.set("fill", gradient);
            canvas.renderAll();
            console.log(`${gradientType} gradient applied to selected object.`);
        } else if (!isClickModeActive.current) {
            // Mode 2: Activate click-to-fill mode
             console.log(`Activating click-to-fill mode (${gradientType} gradient)...`);
             isClickModeActive.current = true;
             canvas.defaultCursor = 'copy';
             canvas.selection = false;
             canvas.forEachObject(o => o.selectable = false);

             const handleGradientClick = (opt: fabric.IEvent<MouseEvent>) => {
                 const target = canvas.findTarget(opt.e, false);
                 if (target && target.type !== 'activeSelection') {
                     console.log("Applying gradient fill to clicked object:", target.type);
                     target.set('fill', gradient);
                      canvas.renderAll(); // Render after applying to object
                 } else {
                      console.log("Cannot apply gradient to background via click.");
                      // Optionally provide user feedback
                 }
                 cleanupToolEventListeners(); // Cleanup after action
             };
             canvas.once("mouse:down", handleGradientClick);
        }
    };

    // Applies pattern fill - Mode 1 ONLY (selected object)
    const applyPatternFillAction = (imageUrl: string) => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();

        if (!activeObject) {
             console.log("Pattern fill requires an object to be selected.");
             // Provide user feedback if desired
             return; // Exit if no object selected
        }

        if (!imageUrl) {
            console.warn("No image URL provided for pattern fill.");
            return;
        }

        console.log("Applying pattern fill to selected object...");
        fabric.util.loadImage(imageUrl, (img) => {
            if (!img) { console.error("Failed to load pattern image."); return; }

            const pattern = new fabric.Pattern({
                source: img,
                repeat: "repeat", // Or 'repeat-x', 'repeat-y', 'no-repeat'
            });

            activeObject.set("fill", pattern);
            canvas.renderAll();
            console.log("Pattern fill applied.");

        }, { crossOrigin: 'anonymous' }); // Handle CORS if necessary
    };


    // --- Return Tool Definitions ---
    return [
        // Fill Tool (Solid Color Bucket)
        {
            icon: <PaintBucket />,
            toolName: "Fill Color",
            function: () => applySolidAction('fill'), // Calls with 'fill' type
            function_args: [], // Arguments are handled internally now
        },
        // Outline Tool
        {
            icon: <SquarePen />, // Changed Icon
            toolName: "Outline Color",
            function: () => applySolidAction('stroke'), // Calls with 'stroke' type
            function_args: [],
        },
        // Linear Gradient Tool
        {
            icon: <Waves />, // Changed Icon (represents direction)
            toolName: "Linear Gradient",
            function: () => applyGradientAction('linear'), // Calls with 'linear' type
            function_args: [],
        },
         // Radial Gradient Tool
        {
            icon: <Palette />, // Changed Icon (represents color spread)
            toolName: "Radial Gradient",
            function: () => applyGradientAction('radial'), // Calls with 'radial' type
            function_args: [],
        },
        // Pattern Fill Tool
        {
            icon: <ImageIcon />, // Keep Image icon
            toolName: "Pattern Fill",
            // Example URL - needs UI to select image in practice
            function: () => applyPatternFillAction('https://via.placeholder.com/50/09f/fff.png'),
            function_args: [], // URL passed directly for now
        },
    ];
}