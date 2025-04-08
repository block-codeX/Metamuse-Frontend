import {
  Bold,
  Italic,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import { useCanvas } from "../../contexts/canvas-context";
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
    isStrikethrough,
    setIsStrikethrough,
    isSubscript,
    setIsSubscript,
    isSuperscript,
    setIsSuperscript,
  } = useCanvas();

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex flex-row items-center justify-between w-full p-1 space-x-2">
        <div className="flex-1 self-stretch w-full">
          <Select
            value={fontStyle}
            onValueChange={(value) => setFontStyle(value)}
          >
            <SelectTrigger className="p-1  w-full shadow-none">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {myFonts.map((font) => (
                <SelectItem
                  key={font}
                  value={font}
                  // Apply the font family directly to the item
                  style={{ fontFamily: `'${font}', sans-serif` }} // Use quotes for names with spaces, add fallback
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <Input
          className="px-1 w-16 text-center focus:outline-none shadow-none"
          type="number"
          min="10"
          max="100"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        />
      </div>

      {/* Bold, Italic, Underline Buttons */}
      <div className="p-2 self-stretch border flex flex-row items-center justify-evenly gap-2 rounded-md shadow-none">
        <Bold
          onClick={() => setIsBold(!isBold)}
          strokeWidth={isBold ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
        <Italic
          onClick={() => setIsItalic(!isItalic)}
          strokeWidth={isItalic ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
        <Underline
          onClick={() => setIsUnderline(!isUnderline)}
          strokeWidth={isUnderline ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
        <Strikethrough
          onClick={() => setIsStrikethrough(!isStrikethrough)}
          strokeWidth={isStrikethrough ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
        <Superscript
          onClick={() => setIsSuperscript(!isSuperscript)}
          strokeWidth={isSuperscript ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
        <Subscript
          onClick={() => setIsSubscript(!isSubscript)}
          strokeWidth={isSubscript ? 4 : 1.5}
          size={16}
          color="var(--btn-primary)"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
