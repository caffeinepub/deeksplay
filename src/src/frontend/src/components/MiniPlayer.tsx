import { Slider } from "@/components/ui/slider";
import {
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { Equalizer } from "./Equalizer";

function formatTime(s: number) {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const {
    currentSong,
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

  return (
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
                i % 3 === 0 ? "#23E6E2" : i % 3 === 1 ? "#FF4FD8" : "#8A5CFF",
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex md:hidden flex-col px-3 py-2 gap-1 z-10 relative">
        {/* Row: art + info + prev + play + next */}
        <div className="flex items-center gap-2">
          {/* Album art */}
          <div
            className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
            style={{
              border: "2px solid transparent",
              backgroundImage:
                "linear-gradient(#111720,#111720),linear-gradient(135deg,#23E6E2,#FF4FD8)",
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
                <Music size={16} style={{ color: "#23E6E2" }} />
              </div>
            )}
          </div>

          {/* Song info */}
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

          {/* Controls */}
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
                background: "linear-gradient(135deg, #23E6E2, #35C7FF)",
                color: "#0B0F14",
                boxShadow: isPlaying ? "0 0 16px rgba(35,230,226,0.5)" : "none",
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

        {/* Seek bar */}
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
              background: `linear-gradient(to right, #23E6E2 ${progress}%, rgba(42,52,65,0.8) ${progress}%)`,
            }}
          />
          <span className="text-[10px] w-6" style={{ color: "#9AA6B2" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
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
              backgroundImage:
                "linear-gradient(#111720,#111720),linear-gradient(135deg,#23E6E2,#FF4FD8)",
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
                <Music size={20} style={{ color: "#23E6E2" }} />
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
              style={{ color: isShuffle ? "#23E6E2" : "#9AA6B2" }}
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
                background: "linear-gradient(135deg, #23E6E2, #35C7FF)",
                color: "#0B0F14",
                boxShadow: isPlaying ? "0 0 20px rgba(35,230,226,0.5)" : "none",
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
              style={{ color: repeatMode !== "none" ? "#23E6E2" : "#9AA6B2" }}
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
                  background: `linear-gradient(to right, #23E6E2 ${progress}%, rgba(42,52,65,0.8) ${progress}%)`,
                }}
              />
            </div>
            <span className="text-xs w-8" style={{ color: "#9AA6B2" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32 flex-shrink-0 z-10">
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
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
