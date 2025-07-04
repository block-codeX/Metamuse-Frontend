import { useEffect, useState } from "react";

export function FlashingText({ text, color }: { text: string; color?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Flash for 2 seconds, then hide
    const timeout = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <span
      className={`animate-pulse font-semibold text-xs z-30 whitespace-nowrap ${
        color ? color : "text-success"
      }`}
    >
      {text}
    </span>
  );
}