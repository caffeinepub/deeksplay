import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePlayer } from "../context/PlayerContext";

const TIPS = [
  "Try mood playlists for the perfect vibe! 🎵",
  "Use Space bar to play/pause on PC! ⌨️",
  "Add songs to queue for non-stop music! 📋",
  "Set a sleep timer before bed! 😴",
  "Artist Radio finds similar songs automatically! 📻",
  "Try different themes in Settings! 🎨",
];

const NEON_CYAN = "#23E6E2";

function pickTarget() {
  const margin = 80;
  return {
    x: margin + Math.random() * (window.innerWidth - margin * 2),
    y: margin + Math.random() * (window.innerHeight - margin * 2 - 100),
  };
}

export function DeekBot() {
  const { isPlaying, volume, togglePlay } = usePlayer();
  const [pos, setPos] = useState({ x: window.innerWidth - 120, y: 200 });
  const [minimized, setMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const targetRef = useRef({ x: window.innerWidth - 120, y: 200 });
  const animFrameRef = useRef<number>(0);
  const lastClickRef = useRef(0);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Pick a new random target every 3-6 seconds when not minimized
  // biome-ignore lint/correctness/useExhaustiveDependencies: minimized is the only meaningful dep here
  useEffect(() => {
    if (minimized) return;
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        targetRef.current = pickTarget();
        schedule();
      }, delay);
    };
    const id = schedule();
    return () => clearTimeout(id);
  }, [minimized]);

  // Smooth movement via requestAnimationFrame
  useEffect(() => {
    if (minimized) return;
    const speed = isPlaying ? 0.012 : 0.006;
    const animate = () => {
      setPos((prev) => {
        const dx = targetRef.current.x - prev.x;
        const dy = targetRef.current.y - prev.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return prev;
        return { x: prev.x + dx * speed, y: prev.y + dy * speed };
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, minimized]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();
      if (now - lastClickRef.current < 300) {
        togglePlay();
        return;
      }
      lastClickRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastClickRef.current >= 299) {
          setIsClicked(true);
          setTimeout(() => setIsClicked(false), 600);
          const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
          toast(tip, {
            icon: "🤖",
            style: {
              background: "#141A22",
              border: `1px solid ${NEON_CYAN}`,
              color: "#fff",
            },
          });
        }
      }, 300);
    },
    [togglePlay],
  );

  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized((m) => !m);
  }, []);

  const handleHoverStart = useCallback(() => {
    setIsHovered(true);
    setShowTooltip(true);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(false), 2000);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setIsHovered(false);
  }, []);

  const eyeSize = volume > 70 ? 14 : 11;
  const eyeGlow = isPlaying
    ? `0 0 8px ${NEON_CYAN}, 0 0 16px ${NEON_CYAN}`
    : `0 0 4px ${NEON_CYAN}66`;

  if (minimized) {
    return (
      <motion.div
        data-ocid="deekbot.toggle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: "fixed",
          bottom: 80,
          right: 12,
          zIndex: 999,
          cursor: "pointer",
          width: 36,
          height: 22,
          background: "rgba(20,26,34,0.95)",
          borderRadius: 6,
          border: `1.5px solid ${NEON_CYAN}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          boxShadow: `0 0 10px ${NEON_CYAN}33`,
        }}
        onClick={handleMinimize}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <div
          style={{
            width: eyeSize - 2,
            height: eyeSize - 2,
            background: NEON_CYAN,
            borderRadius: 2,
            boxShadow: eyeGlow,
            animation: isPlaying
              ? "eyePulse 0.5s ease-in-out infinite alternate"
              : "none",
          }}
        />
        <div
          style={{
            width: eyeSize - 2,
            height: eyeSize - 2,
            background: NEON_CYAN,
            borderRadius: 2,
            boxShadow: eyeGlow,
            animation: isPlaying
              ? "eyePulse 0.5s ease-in-out infinite alternate 0.25s"
              : "none",
          }}
        />
      </motion.div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes eyePulse {
          from { opacity: 0.6; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1.08); }
        }
        @keyframes eyePulseSlow {
          from { opacity: 0.4; transform: scale(0.95); }
          to { opacity: 0.75; transform: scale(1.05); }
        }
        @keyframes bodyGlow {
          0%, 100% { box-shadow: 0 0 8px ${NEON_CYAN}44, 0 0 20px ${NEON_CYAN}22, inset 0 1px 0 rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 16px ${NEON_CYAN}66, 0 0 32px ${NEON_CYAN}33, inset 0 1px 0 rgba(255,255,255,0.05); }
        }
      `}</style>

      <motion.div
        data-ocid="deekbot.card"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 999,
          cursor: "pointer",
          userSelect: "none",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          y: isClicked ? [-10, 0, -6, 0] : [0, -6, 0],
          rotate: isClicked ? [0, -15, 15, -8, 0] : isHovered ? [-3, 3, -3] : 0,
        }}
        transition={{
          y: {
            duration: isClicked ? 0.5 : 2.4,
            repeat: isClicked ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: isClicked ? 0.5 : 0.4,
            repeat: isClicked ? 0 : isHovered ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          },
        }}
        onClick={handleClick}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        whileTap={{ scale: 0.88 }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              style={{
                position: "absolute",
                bottom: "110%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(20,26,34,0.95)",
                border: `1px solid ${NEON_CYAN}55`,
                borderRadius: 6,
                padding: "4px 10px",
                whiteSpace: "nowrap",
                fontSize: 11,
                color: NEON_CYAN,
                fontWeight: 600,
                boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 8px ${NEON_CYAN}22`,
                pointerEvents: "none",
              }}
            >
              Deek-Bot 🤖
            </motion.div>
          )}
        </AnimatePresence>

        {/* Robot container */}
        <div style={{ position: "relative", width: 60, height: 60 }}>
          {/* Minimize button */}
          <button
            data-ocid="deekbot.close_button"
            type="button"
            onClick={handleMinimize}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "rgba(20,26,34,0.95)",
              border: `1px solid ${NEON_CYAN}66`,
              color: NEON_CYAN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 10,
              padding: 0,
              fontWeight: 700,
            }}
          >
            −
          </button>

          {/* Body */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              width: 60,
              height: 52,
              borderRadius: 10,
              background: "linear-gradient(145deg, #1C2532, #141A22)",
              border: `1.5px solid ${NEON_CYAN}55`,
              animation: isPlaying
                ? "bodyGlow 1s ease-in-out infinite"
                : "bodyGlow 3s ease-in-out infinite",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "10px 0 6px",
            }}
          >
            {/* Eyes row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: eyeSize,
                  height: eyeSize,
                  background: NEON_CYAN,
                  borderRadius: 2,
                  boxShadow: eyeGlow,
                  animation: isPlaying
                    ? "eyePulse 0.5s ease-in-out infinite alternate"
                    : "eyePulseSlow 2s ease-in-out infinite alternate",
                }}
              />
              <div
                style={{
                  width: eyeSize,
                  height: eyeSize,
                  background: NEON_CYAN,
                  borderRadius: 2,
                  boxShadow: eyeGlow,
                  animation: isPlaying
                    ? "eyePulse 0.5s ease-in-out infinite alternate 0.25s"
                    : "eyePulseSlow 2s ease-in-out infinite alternate 1s",
                }}
              />
            </div>

            {/* Mouth / speaker grill */}
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: isPlaying ? 6 + Math.sin(i * 1.2) * 4 : 4,
                    background: `${NEON_CYAN}${isPlaying ? "CC" : "66"}`,
                    borderRadius: 2,
                    transition: "height 0.3s ease, background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
