interface EqualizerProps {
  isPlaying: boolean;
  size?: "sm" | "md" | "lg";
}

export function Equalizer({ isPlaying, size = "md" }: EqualizerProps) {
  const staticHeights: Record<string, string[]> = {
    sm: ["8px", "12px", "8px", "16px", "8px"],
    md: ["12px", "20px", "12px", "24px", "12px"],
    lg: ["16px", "28px", "16px", "32px", "16px"],
  };
  const w = size === "sm" ? "w-0.5" : size === "md" ? "w-1" : "w-1.5";
  const barClasses = [
    "eq-bar-1",
    "eq-bar-2",
    "eq-bar-3",
    "eq-bar-4",
    "eq-bar-5",
  ];

  return (
    <div className="flex items-end gap-0.5">
      {barClasses.map((barClass, i) => (
        <div
          key={barClass}
          className={`${w} rounded-full transition-all ${isPlaying ? barClass : ""}`}
          style={{
            background: "linear-gradient(to top, #23E6E2, #FF4FD8)",
            height: isPlaying ? undefined : staticHeights[size][i],
            minHeight: "4px",
          }}
        />
      ))}
    </div>
  );
}
