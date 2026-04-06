import { motion } from "motion/react";
import { useState } from "react";
import { THEMES, useTheme } from "../../context/ThemeContext";
import { useApiQuota } from "../../hooks/useApiQuota";
import { resetAllKeys } from "../../utils/ytApiKey";

const KEY_LABELS = ["key-1", "key-2", "key-3"] as const;

function KeyStatusBadge({
  index,
  total,
  exhaustedCount,
}: { index: number; total: number; exhaustedCount: number }) {
  const allExhausted = exhaustedCount >= total;
  return (
    <div className="flex items-center gap-2">
      {KEY_LABELS.slice(0, total).map((label, i) => {
        const isExhausted = i < exhaustedCount && i !== index - 1;
        const isActive = i === index - 1;
        const color = isActive
          ? "#23E6E2"
          : isExhausted
            ? "rgba(255,79,216,0.4)"
            : "rgba(42,52,65,0.8)";
        return (
          <div
            key={label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isActive
                ? "rgba(35,230,226,0.15)"
                : "rgba(42,52,65,0.4)",
              border: `1px solid ${color}`,
              color,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: color,
                boxShadow: isActive ? `0 0 6px ${color}` : "none",
              }}
            />
            Key {i + 1}
          </div>
        );
      })}
      {allExhausted && (
        <span className="text-xs" style={{ color: "#FF4FD8" }}>
          All exhausted!
        </span>
      )}
    </div>
  );
}

function QuotaGauge({
  used,
  total,
  totalRemaining,
  totalAll,
}: {
  used: number;
  total: number;
  totalRemaining: number;
  totalAll: number;
}) {
  const pct = used / total;
  const remaining = total - used;
  const color =
    remaining > 5000 ? "#23E6E2" : remaining > 2000 ? "#FFB347" : "#FF4FD8";
  const shadowColor =
    remaining > 5000
      ? "rgba(35,230,226,0.5)"
      : remaining > 2000
        ? "rgba(255,179,71,0.5)"
        : "rgba(255,79,216,0.5)";

  const r = 80;
  const cx = 100;
  const cy = 100;
  const stroke = 14;
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 200, height: 110 }}>
        <svg
          width="200"
          height="110"
          viewBox="0 0 200 110"
          role="img"
          aria-label="API quota gauge"
        >
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(42,52,65,0.8)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 6px ${shadowColor})`,
              transition: "stroke-dashoffset 1s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className="text-3xl font-bold"
            style={{ color, textShadow: `0 0 12px ${shadowColor}` }}
          >
            {remaining.toLocaleString()}
          </span>
          <span className="text-xs" style={{ color: "#9AA6B2" }}>
            units on active key
          </span>
        </div>
      </div>

      {/* Per-key bar */}
      <div className="w-full max-w-xs">
        <div
          className="flex justify-between text-xs mb-1"
          style={{ color: "#9AA6B2" }}
        >
          <span>Used: {used.toLocaleString()}</span>
          <span>Per key: {total.toLocaleString()}</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(42,52,65,0.8)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}99)`,
              boxShadow: `0 0 8px ${shadowColor}`,
            }}
          />
        </div>
      </div>

      {/* Total remaining across all keys */}
      <div
        className="w-full max-w-xs flex items-center justify-between px-3 py-2 rounded-xl"
        style={{
          background: "rgba(138,92,255,0.08)",
          border: "1px solid rgba(138,92,255,0.3)",
        }}
      >
        <span className="text-xs" style={{ color: "#9AA6B2" }}>
          Total remaining (all 3 keys)
        </span>
        <span className="text-sm font-bold" style={{ color: "#8A5CFF" }}>
          {totalRemaining.toLocaleString()}
          <span className="text-xs font-normal" style={{ color: "#9AA6B2" }}>
            /{totalAll.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}

function CountdownTimer({ ms }: { ms: number }) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (ms <= 0) return <span style={{ color: "#23E6E2" }}>Resetting now…</span>;

  return (
    <span>
      <span style={{ color: "#23E6E2" }}>
        {hours}h {minutes}m
      </span>
    </span>
  );
}

const unitCosts = [
  { icon: "🔍", label: "Search", cost: 100, note: "~100 searches/day per key" },
  { icon: "🤖", label: "AI Music Expert", cost: 100, note: "per query" },
  { icon: "🔥", label: "Trending Tab", cost: 100, note: "per tab load" },
  { icon: "🎵", label: "Song Playback", cost: 0, note: "FREE, unlimited" },
];

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-3 flex-wrap">
      {(
        Object.entries(THEMES) as [
          import("../../context/ThemeContext").ThemeName,
          (typeof THEMES)[keyof typeof THEMES],
        ][]
      ).map(([name, t]) => (
        <button
          key={name}
          type="button"
          onClick={() => setTheme(name)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
          style={{
            background: theme === name ? `${t.color}20` : "rgba(42,52,65,0.4)",
            border: `1px solid ${theme === name ? t.color : "rgba(42,52,65,0.6)"}`,
            boxShadow: theme === name ? `0 0 12px ${t.glow}` : "none",
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: theme === name ? t.color : "#9AA6B2" }}
          >
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SettingsPage() {
  const {
    usedUnits,
    remainingUnits,
    totalUnits,
    totalAllUnits,
    totalRemainingUnits,
    keyStatus,
    msUntilReset,
    resetTimeIST,
  } = useApiQuota();

  const [resetDone, setResetDone] = useState(false);

  function handleForceReset() {
    resetAllKeys();
    setResetDone(true);
    setTimeout(() => {
      setResetDone(false);
      window.location.reload();
    }, 1200);
  }

  const quotaColor =
    remainingUnits > 5000
      ? "#23E6E2"
      : remainingUnits > 2000
        ? "#FFB347"
        : "#FF4FD8";

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6"
      style={{ scrollbarWidth: "thin" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-text mb-1">Settings</h1>
          <p className="text-sm" style={{ color: "#9AA6B2" }}>
            API quota, app info, and preferences
          </p>
        </div>

        {/* Quota Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 mb-4"
          style={{
            background: "rgba(20,26,34,0.9)",
            border: `1px solid ${quotaColor}40`,
            boxShadow: `0 0 24px ${quotaColor}15`,
          }}
          data-ocid="settings.panel"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚡</span>
            <h2
              className="text-base font-semibold"
              style={{ color: "#E9EEF6" }}
            >
              YouTube API Quota
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${quotaColor}20`,
                border: `1px solid ${quotaColor}50`,
                color: quotaColor,
              }}
            >
              {Math.round((remainingUnits / totalUnits) * 100)}% left
            </span>
          </div>

          {/* Key status row */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: "#9AA6B2" }}>
              Active key:{" "}
              <span style={{ color: "#23E6E2" }}>
                Key {keyStatus.index} of {keyStatus.total}
              </span>
              {keyStatus.exhaustedCount > 0 && (
                <span style={{ color: "#FFB347" }}>
                  {" "}
                  ({keyStatus.exhaustedCount} exhausted, auto-switched)
                </span>
              )}
            </p>
            <KeyStatusBadge
              index={keyStatus.index}
              total={keyStatus.total}
              exhaustedCount={keyStatus.exhaustedCount}
            />
          </div>

          <QuotaGauge
            used={usedUnits}
            total={totalUnits}
            totalRemaining={totalRemainingUnits}
            totalAll={totalAllUnits}
          />

          <div
            className="mt-5 flex flex-col sm:flex-row gap-3 items-center justify-center text-sm"
            style={{ color: "#9AA6B2" }}
          >
            <div className="flex items-center gap-1.5">
              <span>⏱</span>
              <span>
                Resets in <CountdownTimer ms={msUntilReset} />
              </span>
            </div>
            <span
              className="hidden sm:inline"
              style={{ color: "rgba(42,52,65,0.8)" }}
            >
              |
            </span>
            <div className="flex items-center gap-1.5">
              <span>🕐</span>
              <span>
                Next reset:{" "}
                <span style={{ color: "#23E6E2" }}>{resetTimeIST}</span>
              </span>
            </div>
          </div>

          {/* Force Reset Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleForceReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: resetDone
                  ? "rgba(35,230,226,0.15)"
                  : "rgba(255,79,216,0.1)",
                border: `1px solid ${resetDone ? "rgba(35,230,226,0.5)" : "rgba(255,79,216,0.4)"}`,
                color: resetDone ? "#23E6E2" : "#FF4FD8",
              }}
            >
              {resetDone
                ? "✅ Reset ho gaya! Reload ho raha hai..."
                : "🔄 Force Reset Key Status"}
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "#9AA6B2" }}>
            Agar keys galti se exhausted mark ho gayi hain toh yeh press karo
          </p>
        </motion.div>

        {/* Unit Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(20,26,34,0.9)",
            border: "1px solid rgba(42,52,65,0.8)",
          }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "#E9EEF6" }}
          >
            Unit Cost Breakdown
          </h2>
          <div className="space-y-3">
            {unitCosts.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(42,52,65,0.4)" }}
              >
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#E9EEF6" }}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: "#9AA6B2" }}>
                    {item.note}
                  </p>
                </div>
                <div className="text-right">
                  {item.cost === 0 ? (
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(35,230,226,0.15)",
                        border: "1px solid rgba(35,230,226,0.4)",
                        color: "#23E6E2",
                      }}
                    >
                      FREE
                    </span>
                  ) : (
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#FF4FD8" }}
                    >
                      {item.cost} units
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(20,26,34,0.9)",
            border: "1px solid rgba(42,52,65,0.8)",
          }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "#E9EEF6" }}
          >
            App Info
          </h2>
          <div className="space-y-3 text-sm">
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid rgba(42,52,65,0.4)" }}
            >
              <span style={{ color: "#9AA6B2" }}>App Name</span>
              <span className="font-semibold gradient-text">Deeksplay</span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid rgba(42,52,65,0.4)" }}
            >
              <span style={{ color: "#9AA6B2" }}>Version</span>
              <span style={{ color: "#E9EEF6" }}>v39.0.0</span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid rgba(42,52,65,0.4)" }}
            >
              <span style={{ color: "#9AA6B2" }}>API Keys</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(35,230,226,0.1)",
                  border: "1px solid rgba(35,230,226,0.3)",
                  color: "#23E6E2",
                }}
              >
                3 keys active
              </span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid rgba(42,52,65,0.4)" }}
            >
              <span style={{ color: "#9AA6B2" }}>Daily Quota</span>
              <span style={{ color: "#E9EEF6" }}>
                30,000 units/day (3 × 10k)
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span style={{ color: "#9AA6B2" }}>Made by</span>
              <span>
                <span style={{ color: "#FF4FD8", fontWeight: 600 }}>
                  Deepak Katal
                </span>{" "}
                from Punjab ❤️
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quota Tips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: "rgba(138,92,255,0.08)",
            border: "1px solid rgba(138,92,255,0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span>💡</span>
            <h2
              className="text-base font-semibold"
              style={{ color: "#8A5CFF" }}
            >
              Tips to save quota
            </h2>
          </div>
          <ul className="space-y-2 text-sm" style={{ color: "#9AA6B2" }}>
            <li className="flex items-start gap-2">
              <span style={{ color: "#23E6E2", marginTop: 2 }}>•</span>
              Song playback is completely free — listen unlimited!
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#23E6E2", marginTop: 2 }}>•</span>3 API
              keys = 30,000 units/day — app auto-switches when one is exhausted.
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#23E6E2", marginTop: 2 }}>•</span>
              Avoid reloading trending tabs repeatedly — results are cached for
              10 mins.
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#23E6E2", marginTop: 2 }}>•</span>
              Quota resets every day at 12:30 AM IST automatically.
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#FF4FD8", marginTop: 2 }}>•</span>
              Agar app kaam karna band kar de toh Settings mein "Force Reset Key
              Status" dabao.
            </li>
          </ul>
        </motion.div>

        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-5 mb-4 mt-4"
          style={{
            background: "rgba(35,230,226,0.06)",
            border: "1px solid rgba(35,230,226,0.2)",
          }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "#E9EEF6" }}
          >
            Theme
          </h2>
          <ThemeSelector />
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{
            background: "rgba(138,92,255,0.06)",
            border: "1px solid rgba(138,92,255,0.2)",
          }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "#E9EEF6" }}
          >
            ⌨️ Keyboard Shortcuts
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Space", "Play / Pause"],
              ["→", "Next Song"],
              ["←", "Previous Song"],
              ["M", "Mute / Unmute"],
              ["Alt + ↑", "Volume Up"],
              ["Alt + ↓", "Volume Down"],
            ].map(([key, action]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                style={{ background: "rgba(42,52,65,0.4)" }}
              >
                <span style={{ color: "#9AA6B2" }}>{action}</span>
                <kbd
                  className="px-2 py-0.5 rounded text-xs font-mono"
                  style={{
                    background: "rgba(138,92,255,0.2)",
                    color: "#8A5CFF",
                    border: "1px solid rgba(138,92,255,0.3)",
                  }}
                >
                  {key}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "#9AA6B2" }}>
            Shortcuts are disabled when typing in a search box.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
