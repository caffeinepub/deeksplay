import { ChevronDown, ChevronUp, Pause, Play, SkipForward } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useTheme } from "../context/ThemeContext";

export function FloatingMiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong } = usePlayer();
  const { accent, accentGlow } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="floating-mini-player"
        data-ocid="floating_player.panel"
        initial={{ opacity: 0, x: 80, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="fixed z-[45] select-none"
        style={{ bottom: "72px", right: "12px" }}
      >
        {collapsed ? (
          /* Collapsed pill */
          <motion.div
            layout
            className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer"
            style={{
              background: "rgba(14,20,30,0.92)",
              border: `1px solid ${accent}60`,
              boxShadow: `0 0 16px ${accentGlow}, 0 4px 20px rgba(0,0,0,0.5)`,
              backdropFilter: "blur(16px)",
            }}
          >
            <button
              type="button"
              data-ocid="floating_player.primary_button"
              onClick={togglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${accent}, #35C7FF)`,
                color: "#0B0F14",
                boxShadow: isPlaying ? `0 0 10px ${accentGlow}` : "none",
              }}
            >
              {isPlaying ? (
                <Pause size={12} fill="currentColor" />
              ) : (
                <Play size={12} fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              data-ocid="floating_player.open_modal_button"
              onClick={() => setCollapsed(false)}
              className="transition-all hover:scale-110"
              style={{ color: "#9AA6B2" }}
            >
              <ChevronUp size={14} />
            </button>
          </motion.div>
        ) : (
          /* Expanded card */
          <motion.div
            layout
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
            style={{
              background: "rgba(14,20,30,0.95)",
              border: `1px solid ${accent}50`,
              boxShadow: `0 0 20px ${accentGlow}, 0 8px 32px rgba(0,0,0,0.6)`,
              backdropFilter: "blur(20px)",
              minWidth: "220px",
              maxWidth: "260px",
            }}
          >
            {/* Thumbnail */}
            <div
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                border: `1px solid ${accent}40`,
                boxShadow: isPlaying ? `0 0 8px ${accentGlow}` : "none",
              }}
            >
              {currentSong.thumbnail ? (
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs"
                  style={{ background: "#1A2B2D", color: accent }}
                >
                  ♪
                </div>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate leading-tight"
                style={{ color: "#E9EEF6" }}
              >
                {currentSong.title}
              </p>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: "#9AA6B2" }}
              >
                {currentSong.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                data-ocid="floating_player.primary_button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #35C7FF)`,
                  color: "#0B0F14",
                  boxShadow: isPlaying ? `0 0 12px ${accentGlow}` : "none",
                }}
              >
                {isPlaying ? (
                  <Pause size={13} fill="currentColor" />
                ) : (
                  <Play size={13} fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                data-ocid="floating_player.secondary_button"
                onClick={nextSong}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110"
                style={{ color: "#9AA6B2" }}
              >
                <SkipForward size={13} />
              </button>
              <button
                type="button"
                data-ocid="floating_player.close_button"
                onClick={() => setCollapsed(true)}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:scale-110"
                style={{ color: "#9AA6B2" }}
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
