import { useCanvas } from "../contexts/canvas-context";
import GradientFormatting from "../formatting/gradient";
import PatternFormatting from "../formatting/patterns";
import PictureFormatting from "../formatting/picture-filters";
import TextFormatting from "../formatting/text";

const FloatingTools: React.FC = () => {
    const { floating } = useCanvas();
    return ["text", "gradient", "pattern", "picture"].includes(floating)
            ? (
            <div className="absolute top-30 right-20 z-50 flex max-h-90 max-w-60 items-center justify-center bg-background/80 backdrop-blur-sm rounded-md shadow-md border border-gray-300">
                <div className="flex flex-col justify-start items-start w-full p-3 h-full py-3 gap-2">
                    {floating === "text" && <TextFormatting/>}
                    {floating === "gradient" && <GradientFormatting/>}
                    {floating === "pattern" && <PatternFormatting/>}
                    {floating === "picture" && <PictureFormatting/>}
                </div>
            </div>
            )
            : <></>
}

export default FloatingTools;