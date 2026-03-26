import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { usePlayer } from "../../context/PlayerContext";
import {
  useRecentlyPlayed,
  useSearchYouTube,
  useTrendingMusic,
} from "../../hooks/useQueries";
import { useRecentPlaylists } from "../../hooks/useRecentPlaylists";
import type { Song } from "../../types/music";
import { SongCard } from "../SongCard";
import { SongRow } from "../SongRow";

const MOODS = [
  {
    emoji: "😊",
    label: "Happy",
    query: "happy upbeat songs 2024",
    color: "#FFB800",
    bg: "linear-gradient(135deg, #FFB80030, #FF850015)",
  },
  {
    emoji: "😢",
    label: "Sad",
    query: "sad emotional songs hindi",
    color: "#35C7FF",
    bg: "linear-gradient(135deg, #35C7FF30, #1A90FF15)",
  },
  {
    emoji: "💪",
    label: "Workout",
    query: "workout gym motivation songs",
    color: "#FF4FD8",
    bg: "linear-gradient(135deg, #FF4FD830, #CC2BAA15)",
  },
  {
    emoji: "🚗",
    label: "Drive",
    query: "road trip driving songs",
    color: "#23E6E2",
    bg: "linear-gradient(135deg, #23E6E230, #0BB8B415)",
  },
  {
    emoji: "🧘",
    label: "Chill",
    query: "chill lofi relax music",
    color: "#8A5CFF",
    bg: "linear-gradient(135deg, #8A5CFF30, #5E32D815)",
  },
  {
    emoji: "💃",
    label: "Party",
    query: "party dance hits 2024",
    color: "#FF6B35",
    bg: "linear-gradient(135deg, #FF6B3530, #E0420015)",
  },
];

const FEATURED_PLAYLISTS = [
  {
    id: "punjabi-hiphop",
    name: "Punjabi Hip-Hop",
    subtitle: "Street anthems & bars",
    query: "punjabi hip hop songs 2024",
    emoji: "🎤",
    gradient: "linear-gradient(135deg, #23E6E2, #0BB8B4)",
    accent: "#23E6E2",
  },
  {
    id: "punjabi-rap",
    name: "Punjabi Rap",
    subtitle: "Diljit • Sidhu • Moosewala",
    query: "punjabi rap songs diljit sidhu moosewala",
    emoji: "🔥",
    gradient: "linear-gradient(135deg, #FF4FD8, #CC2BAA)",
    accent: "#FF4FD8",
  },
  {
    id: "90s-hits",
    name: "Old 90s Hits",
    subtitle: "Golden era Bollywood",
    query: "90s bollywood superhit songs",
    emoji: "🎸",
    gradient: "linear-gradient(135deg, #FFB800, #FF8500)",
    accent: "#FFB800",
  },
  {
    id: "bollywood-romantic",
    name: "Bollywood Romantic",
    subtitle: "Love songs & melodies",
    query: "bollywood romantic love songs",
    emoji: "💖",
    gradient: "linear-gradient(135deg, #FF6B35, #E04200)",
    accent: "#FF6B35",
  },
  {
    id: "punjabi-hits-2024",
    name: "Punjabi Hits 2024",
    subtitle: "Latest bangers",
    query: "punjabi hits 2024 new songs",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #8A5CFF, #5E32D8)",
    accent: "#8A5CFF",
  },
  {
    id: "workout",
    name: "Workout Bangers",
    subtitle: "Pump it up 💪",
    query: "workout gym pump up songs",
    emoji: "🏋️",
    gradient: "linear-gradient(135deg, #FF4444, #CC0000)",
    accent: "#FF4444",
  },
  {
    id: "late-night-drive",
    name: "Late Night Drive",
    subtitle: "Cruise & vibe",
    query: "late night drive songs hindi",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #35C7FF, #1A90FF)",
    accent: "#35C7FF",
  },
  {
    id: "desi-hiphop",
    name: "Desi Hip-Hop",
    subtitle: "Raftaar • Divine • MC Stan",
    query: "desi hip hop raftaar divine mc stan",
    emoji: "🎧",
    gradient: "linear-gradient(135deg, #00D46A, #00A050)",
    accent: "#00D46A",
  },
  {
    id: "arijit-hits",
    name: "Arijit Singh Hits",
    subtitle: "Soulful & emotional",
    query: "arijit singh best songs",
    emoji: "🎶",
    gradient: "linear-gradient(135deg, #FF4FD8, #8A5CFF)",
    accent: "#FF4FD8",
  },
  {
    id: "old-punjabi-classics",
    name: "Old Punjabi Classics",
    subtitle: "Timeless folk vibes",
    query: "old punjabi classic songs 90s",
    emoji: "🌾",
    gradient: "linear-gradient(135deg, #FFB800, #8A5CFF)",
    accent: "#FFB800",
  },
  {
    id: "party-anthems",
    name: "Party Anthems",
    subtitle: "Dance floor hits",
    query: "party dance bollywood hits",
    emoji: "🥳",
    gradient: "linear-gradient(135deg, #FF6B35, #FF4FD8)",
    accent: "#FF6B35",
  },
  {
    id: "sad-songs",
    name: "Sad Songs",
    subtitle: "Feel the emotions",
    query: "sad hindi songs heartbreak",
    emoji: "💔",
    gradient: "linear-gradient(135deg, #35C7FF, #23E6E2)",
    accent: "#35C7FF",
  },
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatTime(secs: number) {
  if (!secs || Number.isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type FeaturedPlaylist = (typeof FEATURED_PLAYLISTS)[0];

function PlaylistPopup({
  playlist,
  songs,
  loading,
  onClose,
}: {
  playlist: FeaturedPlaylist;
  songs: Song[];
  loading: boolean;
  onClose: () => void;
}) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playSong,
    togglePlay,
    seekTo,
    nextSong,
    prevSong,
  } = usePlayer();

  const [activePopupSong, setActivePopupSong] = useState<Song | null>(null);

  const handleSongClick = (song: Song) => {
    playSong(song, songs);
    setActivePopupSong(song);
  };

  const displaySong = currentSong;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      data-ocid="playlist_popup.modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "rgba(14,20,30,0.97)",
          border: `1px solid ${playlist.accent}55`,
          boxShadow: `0 0 40px ${playlist.accent}25, 0 20px 60px rgba(0,0,0,0.6)`,
        }}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: `linear-gradient(90deg, ${playlist.accent}18, transparent)`,
            borderBottom: `1px solid ${playlist.accent}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{playlist.emoji}</span>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#E9EEF6" }}>
                {playlist.name}
              </h2>
              <p className="text-xs" style={{ color: "#9AA6B2" }}>
                {loading ? "Loading songs..." : `${songs.length} songs`}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="playlist_popup.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#9AA6B2",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div
            data-ocid="playlist_popup.loading_state"
            className="flex-1 flex items-center justify-center py-16"
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: `${playlist.accent}80`,
                  borderTopColor: "transparent",
                }}
              />
              <p className="text-sm" style={{ color: "#9AA6B2" }}>
                Fetching songs...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Desktop: Left mini player */}
            <div
              className="hidden md:flex flex-col flex-shrink-0 p-5 gap-4"
              style={{
                width: "40%",
                borderRight: `1px solid ${playlist.accent}20`,
                background: "rgba(0,0,0,0.2)",
              }}
            >
              {displaySong ? (
                <>
                  {/* Album art */}
                  <div
                    className="w-full aspect-square rounded-xl overflow-hidden relative"
                    style={{
                      boxShadow: `0 8px 32px ${playlist.accent}30`,
                      maxWidth: "220px",
                      margin: "0 auto",
                    }}
                  >
                    <img
                      src={displaySong.thumbnail}
                      alt={displaySong.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://i.ytimg.com/vi/default/mqdefault.jpg";
                      }}
                    />
                    {isPlaying && (
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `radial-gradient(circle at center, ${playlist.accent}10, transparent 70%)`,
                        }}
                      />
                    )}
                  </div>

                  {/* Song info */}
                  <div className="text-center">
                    <p
                      className="font-bold text-sm leading-tight truncate"
                      style={{ color: "#E9EEF6" }}
                    >
                      {displaySong.title}
                    </p>
                    <p
                      className="text-xs mt-1 truncate"
                      style={{ color: "#9AA6B2" }}
                    >
                      {displaySong.artist}
                    </p>
                  </div>

                  {/* Seek bar */}
                  <div className="px-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) =>
                        seekTo((Number(e.target.value) / 100) * duration)
                      }
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${playlist.accent} ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
                        accentColor: playlist.accent,
                      }}
                    />
                    <div
                      className="flex justify-between text-xs mt-1"
                      style={{ color: "#9AA6B2" }}
                    >
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-5">
                    <button
                      type="button"
                      data-ocid="playlist_popup.secondary_button"
                      onClick={() => prevSong()}
                      className="transition-all hover:scale-110 active:scale-95"
                      style={{ color: "#9AA6B2" }}
                    >
                      <SkipBack size={20} />
                    </button>
                    <button
                      type="button"
                      data-ocid="playlist_popup.primary_button"
                      onClick={() => togglePlay()}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: playlist.accent,
                        boxShadow: `0 0 16px ${playlist.accent}60`,
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={20} fill="#0E141E" color="#0E141E" />
                      ) : (
                        <Play size={20} fill="#0E141E" color="#0E141E" />
                      )}
                    </button>
                    <button
                      type="button"
                      data-ocid="playlist_popup.secondary_button"
                      onClick={() => nextSong()}
                      className="transition-all hover:scale-110 active:scale-95"
                      style={{ color: "#9AA6B2" }}
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <span className="text-5xl">{playlist.emoji}</span>
                  <p
                    className="text-sm text-center"
                    style={{ color: "#9AA6B2" }}
                  >
                    Pick a song to start playing
                  </p>
                </div>
              )}
            </div>

            {/* Songs list */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div
                className="flex-1 overflow-y-auto px-3 py-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: `${playlist.accent}40 transparent`,
                }}
              >
                {songs.map((song, i) => {
                  const isActive =
                    currentSong?.id === song.id ||
                    activePopupSong?.id === song.id;
                  return (
                    <motion.button
                      key={song.id}
                      type="button"
                      data-ocid={`playlist_popup.item.${i + 1}`}
                      onClick={() => handleSongClick(song)}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-all"
                      style={{
                        background: isActive
                          ? `${playlist.accent}18`
                          : "transparent",
                        border: isActive
                          ? `1px solid ${playlist.accent}40`
                          : "1px solid transparent",
                      }}
                    >
                      {/* Index / play icon */}
                      <div
                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{
                          color: isActive ? playlist.accent : "#9AA6B2",
                        }}
                      >
                        {isActive && isPlaying ? (
                          <span className="flex gap-0.5 items-end h-4">
                            <span
                              className="w-0.5 rounded-full animate-bounce"
                              style={{
                                height: "60%",
                                background: playlist.accent,
                                animationDelay: "0ms",
                              }}
                            />
                            <span
                              className="w-0.5 rounded-full animate-bounce"
                              style={{
                                height: "100%",
                                background: playlist.accent,
                                animationDelay: "150ms",
                              }}
                            />
                            <span
                              className="w-0.5 rounded-full animate-bounce"
                              style={{
                                height: "70%",
                                background: playlist.accent,
                                animationDelay: "300ms",
                              }}
                            />
                          </span>
                        ) : (
                          <span className="group-hover:hidden">{i + 1}</span>
                        )}
                        {!isActive && (
                          <Play
                            size={14}
                            fill={playlist.accent}
                            color={playlist.accent}
                            className="hidden group-hover:block"
                          />
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://i.ytimg.com/vi/default/mqdefault.jpg";
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate leading-tight"
                          style={{
                            color: isActive ? playlist.accent : "#E9EEF6",
                          }}
                        >
                          {song.title}
                        </p>
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: "#9AA6B2" }}
                        >
                          {song.artist}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Mobile: sticky mini player strip */}
              {currentSong && (
                <div
                  className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
                  style={{
                    borderTop: `1px solid ${playlist.accent}30`,
                    background: `linear-gradient(135deg, ${playlist.accent}18, rgba(14,20,30,0.98))`,
                  }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://i.ytimg.com/vi/default/mqdefault.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: "#E9EEF6" }}
                    >
                      {currentSong.title}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "#9AA6B2" }}
                    >
                      {currentSong.artist}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => prevSong()}
                      className="transition-all hover:scale-110"
                      style={{ color: "#9AA6B2" }}
                    >
                      <SkipBack size={18} />
                    </button>
                    <button
                      type="button"
                      data-ocid="playlist_popup.toggle"
                      onClick={() => togglePlay()}
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: playlist.accent,
                        boxShadow: `0 0 10px ${playlist.accent}50`,
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={16} fill="#0E141E" color="#0E141E" />
                      ) : (
                        <Play size={16} fill="#0E141E" color="#0E141E" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => nextSong()}
                      className="transition-all hover:scale-110"
                      style={{ color: "#9AA6B2" }}
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FeaturedPlaylistsSection() {
  const [popupPlaylist, setPopupPlaylist] = useState<FeaturedPlaylist | null>(
    null,
  );
  const [popupQuery, setPopupQuery] = useState("");
  const [popupSongs, setPopupSongs] = useState<Song[]>([]);
  const [popupLoading, setPopupLoading] = useState(false);

  const { data: popupResults, isFetching: isFetchingPopup } =
    useSearchYouTube(popupQuery);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - trigger only when results arrive
  React.useEffect(() => {
    if (popupResults && popupResults.length > 0 && popupQuery) {
      setPopupSongs(popupResults);
      setPopupLoading(false);
    }
  }, [popupResults]);

  const handleCardClick = (pl: FeaturedPlaylist) => {
    if (isFetchingPopup) return;
    setPopupPlaylist(pl);
    setPopupSongs([]);
    setPopupLoading(true);
    setPopupQuery(pl.query);
  };

  const closePopup = () => {
    setPopupPlaylist(null);
    setPopupSongs([]);
    setPopupLoading(false);
    setPopupQuery("");
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎵</span>
        <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
          Featured Playlists
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FEATURED_PLAYLISTS.map((pl, i) => {
          const isLoading = isFetchingPopup && popupPlaylist?.id === pl.id;
          return (
            <motion.button
              key={pl.id}
              type="button"
              data-ocid={`featured_playlists.item.${i + 1}`}
              onClick={() => handleCardClick(pl)}
              disabled={isFetchingPopup}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: isFetchingPopup ? 1 : 1.03 }}
              whileTap={{ scale: isFetchingPopup ? 1 : 0.97 }}
              className="relative rounded-xl overflow-hidden text-left group"
              style={{
                height: "120px",
                background: pl.gradient,
                opacity:
                  isFetchingPopup && popupPlaylist?.id !== pl.id ? 0.55 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)",
                }}
              />

              {/* Decorative large emoji background */}
              <span
                className="absolute -right-2 -top-2 text-5xl opacity-25 pointer-events-none select-none"
                aria-hidden="true"
              >
                {pl.emoji}
              </span>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-3">
                <span className="text-2xl leading-none">{pl.emoji}</span>
                <div>
                  <p
                    className="font-bold text-sm leading-tight"
                    style={{
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {pl.name}
                  </p>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {isLoading ? "Loading..." : pl.subtitle}
                  </p>
                </div>
              </div>

              {/* Loading spinner overlay */}
              {isLoading && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                >
                  <div className="w-7 h-7 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              )}

              {/* Play icon on hover */}
              {!isLoading && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Play size={16} fill="white" color="white" />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Playlist Popup */}
      <AnimatePresence>
        {popupPlaylist && (
          <PlaylistPopup
            playlist={popupPlaylist}
            songs={popupSongs}
            loading={popupLoading || isFetchingPopup}
            onClose={closePopup}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function MoodSection() {
  const [moodQuery, setMoodQuery] = useState("");
  const [activeMood, setActiveMood] = useState("");
  const { playSong } = usePlayer();
  const { data: moodResults, isFetching } = useSearchYouTube(moodQuery);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - trigger only when results arrive
  React.useEffect(() => {
    if (moodResults && moodResults.length > 0 && moodQuery) {
      playSong(moodResults[0], moodResults);
      toast.success(`Playing ${activeMood} vibes! 🎵`);
      setMoodQuery("");
    }
  }, [moodResults]);

  const handleMood = (mood: (typeof MOODS)[0]) => {
    setActiveMood(mood.label);
    setMoodQuery(mood.query);
    toast.loading(`Loading ${mood.label} playlist...`, { id: "mood" });
    setTimeout(() => toast.dismiss("mood"), 4000);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎭</span>
        <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
          Mood
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.label}
            type="button"
            onClick={() => handleMood(mood)}
            disabled={isFetching}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl py-4 px-4 flex items-center gap-3 transition-all text-left"
            style={{
              background: mood.bg,
              border: `1px solid ${mood.color}35`,
              opacity: isFetching ? 0.6 : 1,
            }}
          >
            <span className="text-2xl leading-none">{mood.emoji}</span>
            <span
              className="font-semibold text-sm"
              style={{ color: mood.color }}
            >
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

interface JumpBackCardProps {
  song: Song;
  queue: Song[];
}

function JumpBackCard({ song, queue }: JumpBackCardProps) {
  const { playSong } = usePlayer();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => playSong(song, queue)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 rounded-lg overflow-hidden text-left transition-all relative"
      style={{
        background: hovered
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="w-14 h-14 flex-shrink-0 relative">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://i.ytimg.com/vi/default/mqdefault.jpg";
          }}
        />
        {hovered && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <Play size={18} fill="#23E6E2" color="#23E6E2" />
          </div>
        )}
      </div>
      <p
        className="text-sm font-semibold truncate pr-2"
        style={{ color: "#E9EEF6" }}
      >
        {song.title}
      </p>
    </motion.button>
  );
}

interface HomePageProps {
  onAddToPlaylist: (song: Song) => void;
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onNavigateToPlaylists: () => void;
}

export function HomePage({
  onAddToPlaylist,
  favorites,
  onToggleFavorite,
  onNavigateToPlaylists,
}: HomePageProps) {
  const { data: trending = [], isLoading: trendingLoading } =
    useTrendingMusic();
  const { data: recentlyPlayed = [] } = useRecentlyPlayed();
  const { recentPlaylists } = useRecentPlaylists();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right",
  ) => {
    if (ref.current)
      ref.current.scrollBy({
        left: dir === "left" ? -200 : 200,
        behavior: "smooth",
      });
  };

  // Jump Back In: use recently played if available, else trending
  const jumpBackSongs =
    recentlyPlayed.length > 0
      ? recentlyPlayed.slice(0, 6)
      : trending.slice(0, 6);
  const recentScrollSongs =
    recentlyPlayed.length > 0 ? recentlyPlayed : trending.slice(0, 10);
  const newReleases = trending.slice(10, 18);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-2xl md:text-3xl font-extrabold"
          style={{ color: "#E9EEF6" }}
        >
          {getGreeting()}
        </h1>
      </motion.div>

      {/* Jump Back In */}
      {jumpBackSongs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
              Jump back in
            </h2>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
              hidden: {},
            }}
          >
            {jumpBackSongs.map((song, i) => (
              <motion.div
                key={song.id}
                data-ocid={`jump_back.item.${i + 1}`}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <JumpBackCard song={song} queue={jumpBackSongs} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Featured Playlists */}
      <FeaturedPlaylistsSection />

      {/* Mood */}
      <MoodSection />

      {/* Recently Played Playlists */}
      {recentPlaylists.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ListMusic size={18} style={{ color: "#8A5CFF" }} />
            <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
              Recently Played Playlists
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recentPlaylists.map((pl) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="recent_playlists.item.1"
                onClick={onNavigateToPlaylists}
                className="glass-card rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all"
                style={{ border: "1px solid rgba(138,92,255,0.2)" }}
                whileHover={{ borderColor: "rgba(138,92,255,0.5)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(138,92,255,0.15)",
                    border: "1px solid rgba(138,92,255,0.3)",
                  }}
                >
                  <ListMusic size={18} style={{ color: "#8A5CFF" }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "#E9EEF6" }}
                  >
                    {pl.name}
                  </p>
                  <p className="text-xs" style={{ color: "#9AA6B2" }}>
                    {pl.songCount} songs
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: "#23E6E2" }} />
            <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
              Recently Played
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="recent.pagination_prev"
              onClick={() => scroll(recentScrollRef, "left")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(35,230,226,0.1)",
                border: "1px solid rgba(35,230,226,0.3)",
                color: "#23E6E2",
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              data-ocid="recent.pagination_next"
              onClick={() => scroll(recentScrollRef, "right")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(35,230,226,0.1)",
                border: "1px solid rgba(35,230,226,0.3)",
                color: "#23E6E2",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
        <div
          ref={recentScrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {recentScrollSongs.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              queue={recentScrollSongs}
              ocidPrefix="recent"
            />
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: "#FF4FD8" }} />
            <h2 className="text-xl font-bold" style={{ color: "#E9EEF6" }}>
              Trending Now
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="trending.pagination_prev"
              onClick={() => scroll(scrollRef, "left")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(255,79,216,0.1)",
                border: "1px solid rgba(255,79,216,0.3)",
                color: "#FF4FD8",
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              data-ocid="trending.pagination_next"
              onClick={() => scroll(scrollRef, "right")}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(255,79,216,0.1)",
                border: "1px solid rgba(255,79,216,0.3)",
                color: "#FF4FD8",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
        {trendingLoading ? (
          <div className="flex gap-3">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="w-36 h-48 rounded-xl flex-shrink-0"
                style={{ background: "rgba(20,26,34,0.9)" }}
              />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {trending.slice(0, 10).map((song, i) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={i}
                  queue={trending}
                  ocidPrefix="trending"
                />
              ))}
            </div>
            {newReleases.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1">
                {newReleases.map((song, i) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={i}
                    queue={newReleases}
                    isFavorite={favoriteIds.has(song.id)}
                    onToggleFavorite={onToggleFavorite}
                    onAddToPlaylist={onAddToPlaylist}
                    ocidPrefix="releases"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
