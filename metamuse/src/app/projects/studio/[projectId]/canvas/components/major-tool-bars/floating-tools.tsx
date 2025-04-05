import { useCanvas } from "../contexts/canvas-context";
import GradientFormatting from "../formatting/gradient";
import TextFormatting from "../formatting/text";

const FloatingTools: React.FC = () => {
    const { floating } = useCanvas();
    return floating
            ? (
            <div className="absolute top-30 right-20 z-50 flex max-h-90 w-60 items-center justify-center bg-background/80 backdrop-blur-sm rounded-md shadow-md border border-gray-300">
                <div className="flex flex-col justify-start items-start w-full p-3 h-full py-3 gap-2">
                    {floating === "text" && <TextFormatting/>}
                    <GradientFormatting/>
                </div>
            </div>
            )
            : <></>
}

export default FloatingTools;