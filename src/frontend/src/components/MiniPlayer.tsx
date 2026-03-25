import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  Clock,
  Heart,
  List,
  Mic2,
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePlayer } from "../context/PlayerContext";
import { useTheme } from "../context/ThemeContext";
import { Equalizer } from "./Equalizer";

function formatTime(s: number) {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SLEEP_OPTIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "60 min", minutes: 60 },
  { label: "90 min", minutes: 90 },
];

export function MiniPlayer() {
  const {
    currentSong,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlay,
    seekTo,
    setVolume,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  const { accent, accentGlow } = useTheme();

  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sync favorite state with localStorage
  useEffect(() => {
    if (!currentSong) return;
    try {
      const favs: string[] = JSON.parse(
        localStorage.getItem("deeksplay_favorites") || "[]",
      );
      setIsFavorite(favs.includes(currentSong.videoId));
    } catch {
      setIsFavorite(false);
    }
  }, [currentSong]);

  const toggleFavorite = () => {
    if (!currentSong) return;
    try {
      const favs: string[] = JSON.parse(
        localStorage.getItem("deeksplay_favorites") || "[]",
      );
      const next = isFavorite
        ? favs.filter((id) => id !== currentSong.videoId)
        : [...favs, currentSong.videoId];
      localStorage.setItem("deeksplay_favorites", JSON.stringify(next));
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites ❤️",
      );
    } catch {
      /* ignore */
    }
  };

  // Sleep timer countdown
  useEffect(() => {
    if (sleepRemaining === null) return;
    if (sleepRemaining <= 0) {
      if (isPlaying) togglePlay();
      setSleepRemaining(null);
      toast.info("Sleep timer ended — music paused");
      return;
    }
    const t = setTimeout(
      () => setSleepRemaining((r) => (r !== null ? r - 1 : null)),
      1000,
    );
    return () => clearTimeout(t);
  }, [sleepRemaining, isPlaying, togglePlay]);

  const startSleepTimer = (minutes: number) => {
    setSleepRemaining(minutes * 60);
    setShowSleepMenu(false);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  };

  const cancelSleepTimer = () => {
    setSleepRemaining(null);
    toast.info("Sleep timer cancelled");
  };

  const handleShare = () => {
    if (!currentSong) return;
    navigator.clipboard.writeText(
      `https://youtube.com/watch?v=${currentSong.videoId}`,
    );
    toast.success("Link copied! 🔗");
  };

  if (!currentSong) {
    return (
      <div
        className="player-bar flex items-center justify-center px-4 md:px-6 py-3"
        style={{ height: "56px" }}
        data-ocid="player.panel"
      >
        <p className="text-xs md:text-sm" style={{ color: "#9AA6B2" }}>
          Select a song to start playing
        </p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bgBars = Array.from({ length: 60 }, (_, i) => i);
  const sleepDisplay =
    sleepRemaining !== null
      ? `${Math.floor(sleepRemaining / 60)}:${String(sleepRemaining % 60).padStart(2, "0")}`
      : null;

  return (
    <>
      <div
        className="player-bar relative overflow-hidden"
        data-ocid="player.panel"
      >
        {/* BG equalizer */}
        <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-5 pointer-events-none">
          {bgBars.map((i) => (
            <div
              key={`bg-eq-${i}`}
              className={`w-1 rounded-t eq-bar-${(i % 5) + 1}`}
              style={{
                height: `${20 + Math.sin(i * 0.5) * 15}px`,
                background:
                  i % 3 === 0 ? accent : i % 3 === 1 ? "#FF4FD8" : "#8A5CFF",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* MOBILE LAYOUT */}
        <div className="flex md:hidden flex-col px-3 py-2 gap-1 z-10 relative">
          <div className="flex items-center gap-2">
            {/* Tappable thumbnail opens expanded player */}
            <button
              type="button"
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer active:scale-95 transition-transform p-0"
              style={{
                border: "2px solid transparent",
                backgroundImage: `linear-gradient(#111720,#111720),linear-gradient(135deg,${accent},#FF4FD8)`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box,border-box",
              }}
              onClick={() => setShowExpanded(true)}
              data-ocid="player.open_modal_button"
            >
              {currentSong.thumbnail ? (
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "#1A2B2D" }}
                >
                  <Music size={16} style={{ color: accent }} />
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "#E9EEF6" }}
              >
                {currentSong.title}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#9AA6B2" }}>
                {currentSong.artist}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                data-ocid="player.secondary_button"
                onClick={prevSong}
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: "#E9EEF6" }}
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              <button
                type="button"
                data-ocid="player.primary_button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #35C7FF)`,
                  color: "#0B0F14",
                  boxShadow: isPlaying ? `0 0 16px ${accentGlow}` : "none",
                }}
              >
                {isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                data-ocid="player.secondary_button"
                onClick={nextSong}
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: "#E9EEF6" }}
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-[10px] w-6 text-right"
              style={{ color: "#9AA6B2" }}
            >
              {formatTime(currentTime)}
            </span>
            <input
              data-ocid="player.input"
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="flex-1 h-1 rounded-full outline-none cursor-pointer"
              style={{
                appearance: "none",
                background: `linear-gradient(to right, ${accent} ${progress}%, rgba(42,52,65,0.8) ${progress}%)`,
              }}
            />
            <span className="text-[10px] w-6" style={{ color: "#9AA6B2" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex items-center gap-4 px-6 py-3">
          {/* Now playing */}
          <div className="flex items-center gap-3 w-64 flex-shrink-0 z-10">
            <p className="text-xs mr-1" style={{ color: "#9AA6B2" }}>
              Now Playing
            </p>
            <div
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                border: "2px solid transparent",
                backgroundImage: `linear-gradient(#111720,#111720),linear-gradient(135deg,${accent},#FF4FD8)`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box,border-box",
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
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "#1A2B2D" }}
                >
                  <Music size={20} style={{ color: accent }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#E9EEF6" }}
              >
                {currentSong.title}
              </p>
              <p className="text-xs truncate" style={{ color: "#9AA6B2" }}>
                {currentSong.artist}
              </p>
            </div>
            <Equalizer isPlaying={isPlaying} size="sm" />
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-2 z-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                data-ocid="player.toggle"
                onClick={toggleShuffle}
                className="transition-all hover:scale-110"
                style={{ color: isShuffle ? accent : "#9AA6B2" }}
              >
                <Shuffle size={16} />
              </button>
              <button
                type="button"
                data-ocid="player.secondary_button"
                onClick={prevSong}
                className="transition-all hover:scale-110"
                style={{ color: "#E9EEF6" }}
              >
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button
                type="button"
                data-ocid="player.primary_button"
                onClick={togglePlay}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 relative"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #35C7FF)`,
                  color: "#0B0F14",
                  boxShadow: isPlaying ? `0 0 20px ${accentGlow}` : "none",
                }}
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                data-ocid="player.secondary_button"
                onClick={nextSong}
                className="transition-all hover:scale-110"
                style={{ color: "#E9EEF6" }}
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
              <button
                type="button"
                data-ocid="player.toggle"
                onClick={toggleRepeat}
                className="transition-all hover:scale-110"
                style={{ color: repeatMode !== "none" ? accent : "#9AA6B2" }}
              >
                {repeatMode === "one" ? (
                  <Repeat1 size={16} />
                ) : (
                  <Repeat size={16} />
                )}
              </button>
            </div>
            {/* Seek bar */}
            <div className="flex items-center gap-2 w-full max-w-lg">
              <span
                className="text-xs w-8 text-right"
                style={{ color: "#9AA6B2" }}
              >
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative">
                <input
                  data-ocid="player.input"
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1 rounded-full outline-none cursor-pointer"
                  style={{
                    appearance: "none",
                    background: `linear-gradient(to right, ${accent} ${progress}%, rgba(42,52,65,0.8) ${progress}%)`,
                  }}
                />
              </div>
              <span className="text-xs w-8" style={{ color: "#9AA6B2" }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right controls: volume + extras */}
          <div className="flex items-center gap-3 w-48 flex-shrink-0 z-10">
            {/* Volume */}
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 80)}
              style={{ color: "#9AA6B2" }}
              data-ocid="player.toggle"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              min={0}
              max={100}
              step={1}
              className="w-20"
            />

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              title="Share song"
              className="transition-all hover:scale-110"
              style={{ color: "#9AA6B2" }}
            >
              <Share2 size={14} />
            </button>

            {/* Queue */}
            <button
              type="button"
              onClick={() => setShowQueue((v) => !v)}
              title="Queue"
              className="transition-all hover:scale-110"
              style={{ color: showQueue ? accent : "#9AA6B2" }}
            >
              <List size={14} />
            </button>

            {/* Lyrics */}
            <button
              type="button"
              onClick={() => setShowLyrics(true)}
              title="Lyrics"
              className="transition-all hover:scale-110"
              style={{ color: "#9AA6B2" }}
            >
              <Mic2 size={14} />
            </button>

            {/* Sleep Timer */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  sleepRemaining !== null
                    ? cancelSleepTimer()
                    : setShowSleepMenu((v) => !v)
                }
                title={
                  sleepRemaining !== null
                    ? `Cancel timer (${sleepDisplay})`
                    : "Sleep timer"
                }
                className="transition-all hover:scale-110 flex items-center gap-1"
                style={{ color: sleepRemaining !== null ? accent : "#9AA6B2" }}
              >
                <Clock size={14} />
                {sleepDisplay && (
                  <span className="text-[10px] font-mono">{sleepDisplay}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EXPANDED PLAYER (MOBILE FULLSCREEN) ===== */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            key="expanded-player"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
            data-ocid="player.modal"
            style={{ touchAction: "none" }}
          >
            {/* Blurred background */}
            {currentSong.thumbnail && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${currentSong.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(40px) brightness(0.3) saturate(1.6)",
                  transform: "scale(1.1)",
                }}
              />
            )}
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(11,15,20,0.55) 0%, rgba(11,15,20,0.85) 50%, rgba(11,15,20,0.97) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full px-6 pt-safe-top pb-safe-bottom overflow-y-auto">
              {/* Top bar */}
              <div className="flex items-center justify-between pt-10 pb-4">
                <button
                  type="button"
                  onClick={() => setShowExpanded(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#E9EEF6",
                  }}
                  data-ocid="player.close_button"
                >
                  <ChevronDown size={22} />
                </button>
                <div className="text-center">
                  <p
                    className="text-xs uppercase tracking-widest font-semibold"
                    style={{ color: accent }}
                  >
                    Now Playing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#9AA6B2",
                  }}
                  data-ocid="player.secondary_button"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Album art */}
              <div className="flex justify-center mt-4 mb-8">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="rounded-2xl overflow-hidden flex-shrink-0"
                  style={{
                    width: "min(62vw, 280px)",
                    height: "min(62vw, 280px)",
                    border: "3px solid transparent",
                    backgroundImage: `linear-gradient(#111720,#111720),linear-gradient(135deg,${accent},#FF4FD8)`,
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box,border-box",
                    boxShadow: isPlaying
                      ? `0 8px 48px ${accentGlow}, 0 0 0 1px ${accent}40`
                      : "0 8px 32px rgba(0,0,0,0.5)",
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
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "#1A2B2D" }}
                    >
                      <Music size={64} style={{ color: accent }} />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Song info + heart */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xl font-bold truncate leading-tight"
                    style={{ color: "#E9EEF6" }}
                  >
                    {currentSong.title}
                  </p>
                  <p
                    className="text-sm mt-1 truncate"
                    style={{ color: "#9AA6B2" }}
                  >
                    {currentSong.artist}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-full transition-all active:scale-90"
                  style={{
                    background: isFavorite
                      ? `${accent}20`
                      : "rgba(255,255,255,0.06)",
                    color: isFavorite ? accent : "#9AA6B2",
                  }}
                  data-ocid="player.toggle"
                >
                  <Heart
                    size={22}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Seek bar */}
              <div className="mb-5">
                <input
                  data-ocid="player.input"
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                  style={{
                    appearance: "none",
                    background: `linear-gradient(to right, ${accent} ${progress}%, rgba(42,52,65,0.9) ${progress}%)`,
                    accentColor: accent,
                  }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: "#9AA6B2" }}>
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-xs" style={{ color: "#9AA6B2" }}>
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Shuffle + Prev + Play + Next + Repeat */}
              <div className="flex items-center justify-between mb-6 px-2">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90"
                  style={{ color: isShuffle ? accent : "#9AA6B2" }}
                  data-ocid="player.toggle"
                >
                  <Shuffle size={20} />
                </button>
                <button
                  type="button"
                  onClick={prevSong}
                  className="w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90"
                  style={{ color: "#E9EEF6" }}
                  data-ocid="player.secondary_button"
                >
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, #35C7FF)`,
                    color: "#0B0F14",
                    boxShadow: isPlaying
                      ? `0 0 28px ${accentGlow}`
                      : "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                  data-ocid="player.primary_button"
                >
                  {isPlaying ? (
                    <Pause size={28} fill="currentColor" />
                  ) : (
                    <Play size={28} fill="currentColor" className="ml-1" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={nextSong}
                  className="w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90"
                  style={{ color: "#E9EEF6" }}
                  data-ocid="player.secondary_button"
                >
                  <SkipForward size={28} fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={toggleRepeat}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90"
                  style={{ color: repeatMode !== "none" ? accent : "#9AA6B2" }}
                  data-ocid="player.toggle"
                >
                  {repeatMode === "one" ? (
                    <Repeat1 size={20} />
                  ) : (
                    <Repeat size={20} />
                  )}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setVolume(volume > 0 ? 0 : 80)}
                  style={{ color: "#9AA6B2" }}
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>

              {/* Bottom action row: Sleep, Queue, Lyrics */}
              <div
                className="flex items-center justify-around py-4 rounded-2xl mb-6"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {/* Sleep Timer */}
                <button
                  type="button"
                  onClick={() =>
                    sleepRemaining !== null
                      ? cancelSleepTimer()
                      : setShowSleepMenu((v) => !v)
                  }
                  className="flex flex-col items-center gap-1 transition-all active:scale-90"
                  style={{
                    color: sleepRemaining !== null ? accent : "#9AA6B2",
                  }}
                  data-ocid="player.toggle"
                >
                  <Clock size={20} />
                  <span className="text-[10px]">
                    {sleepDisplay ? sleepDisplay : "Sleep"}
                  </span>
                </button>

                {/* Queue */}
                <button
                  type="button"
                  onClick={() => {
                    setShowExpanded(false);
                    setShowQueue((v) => !v);
                  }}
                  className="flex flex-col items-center gap-1 transition-all active:scale-90"
                  style={{ color: "#9AA6B2" }}
                  data-ocid="player.secondary_button"
                >
                  <List size={20} />
                  <span className="text-[10px]">Queue ({queue.length})</span>
                </button>

                {/* Lyrics */}
                <button
                  type="button"
                  onClick={() => {
                    setShowExpanded(false);
                    setShowLyrics(true);
                  }}
                  className="flex flex-col items-center gap-1 transition-all active:scale-90"
                  style={{ color: "#9AA6B2" }}
                  data-ocid="player.secondary_button"
                >
                  <Mic2 size={20} />
                  <span className="text-[10px]">Lyrics</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Panel */}
      {showQueue && (
        <div
          className="fixed bottom-14 right-4 w-80 max-h-96 rounded-2xl overflow-hidden shadow-2xl z-50 flex flex-col"
          style={{
            background: "#141A22",
            border: "1px solid rgba(42,52,65,0.8)",
            boxShadow: "0 0 30px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(42,52,65,0.6)" }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: "#E9EEF6" }}
            >
              Queue ({queue.length})
            </span>
            <button
              type="button"
              onClick={() => setShowQueue(false)}
              style={{ color: "#9AA6B2" }}
            >
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {queue.length === 0 ? (
              <p
                className="text-center py-8 text-sm"
                style={{ color: "#9AA6B2" }}
              >
                Queue is empty
              </p>
            ) : (
              queue.map((song, i) => {
                const isActive = song.id === currentSong?.id;
                return (
                  <div
                    key={`${song.id}-${i}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      background: isActive
                        ? "rgba(35,230,226,0.08)"
                        : "transparent",
                    }}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: isActive ? accent : "#E9EEF6" }}
                      >
                        {song.title}
                      </p>
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "#9AA6B2" }}
                      >
                        {song.artist}
                      </p>
                    </div>
                    {isActive && <Equalizer isPlaying={isPlaying} size="sm" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Lyrics Modal */}
      {showLyrics && currentSong && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          role="presentation"
          onKeyDown={(e) => e.key === "Escape" && setShowLyrics(false)}
          onClick={() => setShowLyrics(false)}
        >
          <dialog
            open
            className="rounded-2xl p-6 max-w-sm w-full text-center"
            style={{
              background: "#141A22",
              border: "1px solid rgba(42,52,65,0.8)",
              color: "inherit",
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🎵</div>
            <h3
              className="text-base font-bold mb-2"
              style={{ color: "#E9EEF6" }}
            >
              Lyrics
            </h3>
            <p className="text-sm mb-4" style={{ color: "#9AA6B2" }}>
              Lyrics feature coming soon!
              <br />
              Search for the song lyrics on Google:
            </p>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${currentSong.title} ${currentSong.artist} lyrics`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${accent}, #FF4FD8)`,
                color: "#0B0F14",
              }}
            >
              Search Lyrics on Google
            </a>
            <button
              type="button"
              className="mt-4 block w-full text-sm"
              style={{ color: "#9AA6B2" }}
              onClick={() => setShowLyrics(false)}
            >
              Close
            </button>
          </dialog>
        </div>
      )}
      {/* Sleep Timer Modal */}
      {showSleepMenu && (
        <div
          className="fixed inset-0 z-[210] flex items-end justify-center pb-20"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowSleepMenu(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowSleepMenu(false)}
          role="presentation"
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl w-64"
            style={{
              background: "#1A2332",
              border: "1px solid rgba(42,52,65,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 text-sm font-semibold"
              style={{
                color: "#9AA6B2",
                borderBottom: "1px solid rgba(42,52,65,0.8)",
              }}
            >
              Sleep Timer
            </div>
            {SLEEP_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                className="w-full px-4 py-3 text-sm text-left hover:bg-white/10 transition-colors"
                style={{ color: "#E9EEF6" }}
                onClick={() => startSleepTimer(opt.minutes)}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              className="w-full px-4 py-3 text-sm hover:bg-white/5 transition-colors"
              style={{
                color: "#9AA6B2",
                borderTop: "1px solid rgba(42,52,65,0.8)",
              }}
              onClick={() => setShowSleepMenu(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
