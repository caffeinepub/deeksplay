import { SlidersHorizontal, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { applyEQ, getEQState } from "../utils/equalizer";
import type { EQState } from "../utils/equalizer";

function EQSlider({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  const pct = ((value + 12) / 24) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold" style={{ color: "#9AA6B2" }}>
        {label}
      </span>
      {/* Vertical slider */}
      <div
        className="relative flex flex-col items-center"
        style={{ height: "120px" }}
      >
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute"
          style={{
            writingMode: "vertical-lr" as any,
            direction: "rtl",
            appearance: "none",
            WebkitAppearance: "slider-vertical",
            width: "28px",
            height: "120px",
            cursor: "pointer",
            background: `linear-gradient(to top, ${accent} ${pct}%, rgba(42,52,65,0.8) ${pct}%)`,
            borderRadius: "4px",
            outline: "none",
          }}
        />
      </div>
      <span
        className="text-xs font-mono font-bold"
        style={{
          color: value === 0 ? "#9AA6B2" : value > 0 ? accent : "#FF4FD8",
          minWidth: "36px",
          textAlign: "center",
        }}
      >
        {value > 0 ? `+${value}` : value}dB
      </span>
    </div>
  );
}

interface EqualizerPanelProps {
  onClose: () => void;
}

export function EqualizerPanel({ onClose }: EqualizerPanelProps) {
  const { accent, accentGlow } = useTheme();
  const [eq, setEq] = useState<EQState>(getEQState);

  // Apply EQ whenever state changes
  useEffect(() => {
    applyEQ(eq);
  }, [eq]);

  const setVal = (key: keyof EQState, val: number | boolean) => {
    setEq((prev) => {
      const next = { ...prev, [key]: val };
      applyEQ(next);
      return next;
    });
  };

  const reset = () => {
    setEq({ enabled: true, bass: 0, mid: 0, treble: 0 });
  };

  return (
    <motion.div
      data-ocid="equalizer.panel"
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="fixed right-4 z-[90] w-72 rounded-2xl overflow-hidden"
      style={{
        bottom: "80px",
        background: "rgba(14,20,30,0.97)",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 30px ${accentGlow}, 0 16px 48px rgba(0,0,0,0.6)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${accent}25` }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: accent }} />
          <span className="text-sm font-bold" style={{ color: "#E9EEF6" }}>
            Equalizer
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Power toggle */}
          <button
            type="button"
            data-ocid="equalizer.toggle"
            onClick={() => setVal("enabled", !eq.enabled)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: eq.enabled ? `${accent}20` : "rgba(255,255,255,0.06)",
              border: `1px solid ${eq.enabled ? accent : "rgba(255,255,255,0.12)"}`,
              color: eq.enabled ? accent : "#9AA6B2",
              boxShadow: eq.enabled ? `0 0 8px ${accentGlow}` : "none",
            }}
          >
            <Zap size={11} fill={eq.enabled ? "currentColor" : "none"} />
            {eq.enabled ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            data-ocid="equalizer.close_button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)", color: "#9AA6B2" }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div
        className="px-4 py-5"
        style={{ opacity: eq.enabled ? 1 : 0.4, transition: "opacity 0.2s" }}
      >
        <div className="flex items-end justify-around gap-4">
          <EQSlider
            label="Bass"
            value={eq.bass}
            onChange={(v) => setVal("bass", v)}
            accent={accent}
          />
          <EQSlider
            label="Mid"
            value={eq.mid}
            onChange={(v) => setVal("mid", v)}
            accent={accent}
          />
          <EQSlider
            label="Treble"
            value={eq.treble}
            onChange={(v) => setVal("treble", v)}
            accent={accent}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid rgba(42,52,65,0.6)" }}
      >
        <span className="text-[10px]" style={{ color: "#9AA6B280" }}>
          EQ applies to device audio
        </span>
        <button
          type="button"
          data-ocid="equalizer.secondary_button"
          onClick={reset}
          className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#9AA6B2",
          }}
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
}

// EQ trigger button — renders open/close button + panel
export function EQButton() {
  const [open, setOpen] = useState(false);
  const { accent, accentGlow } = useTheme();

  return (
    <>
      <button
        type="button"
        data-ocid="equalizer.open_modal_button"
        onClick={() => setOpen((v) => !v)}
        title="Equalizer"
        className="transition-all hover:scale-110 flex items-center justify-center"
        style={{
          color: open ? accent : "#9AA6B2",
          filter: open ? `drop-shadow(0 0 4px ${accentGlow})` : "none",
        }}
      >
        <SlidersHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && <EqualizerPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
