import { Bold, Italic, Underline } from "lucide-react";
import { useCanvas } from "../contexts/canvas-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function TextFormatting() {
  const myFonts = [
    "Arial",
    "Courier New",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Roboto",
    "Lato",
    "Montserrat",
    "Poppins",
    "Open Sans",
    "Raleway",
  ];
  const {
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
  } = useCanvas();

  return (
    <div className="flex flex-row items-center gap-2 w-full pr-1">
      <div className="flex-1 self-stretch w-full">
        <Select
          value={fontStyle}
          onValueChange={(value) => setFontStyle(value)}
        >
          <SelectTrigger className="p-1 rounded-none w-full shadow-none">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {myFonts.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <Input
        className="rounded-none px-1 w-16 text-center focus:outline-none shadow-none"
        type="number"
        min="10"
        max="100"
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value))}
      />

      {/* Bold, Italic, Underline Buttons */}
      <div className="p-1 self-stretch border flex flex-row items-center justify-around ">
        <Bold
          onClick={() => setIsBold(!isBold)}
          strokeWidth={isBold ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
        />
        <Italic
          onClick={() => setIsItalic(!isItalic)}
          className=""
          strokeWidth={isItalic ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
        />
        <Underline
          onClick={() => setIsUnderline(!isUnderline)}
          strokeWidth={isUnderline ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
        />
      </div>
    </div>
  );
}
