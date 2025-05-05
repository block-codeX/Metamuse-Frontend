export function PulseLoader() {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[pulse_1s_ease-in-out_infinite] delay-[200ms]" />
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[pulse_1s_ease-in-out_infinite] delay-[400ms]" />
    </div>
  );
}

// For a more pronounced wave effect, you can use this alternative version:
export function WaveDots() {
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full opacity-40"
          style={{
            animation: "wave 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
// src/components/ui/spinner.tsx
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full ${className}`} />
  );
}