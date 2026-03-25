import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ListMusic,
  Play,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
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

function FeaturedPlaylistsSection() {
  const [activeQuery, setActiveQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const { playSong } = usePlayer();
  const { data: results, isFetching } = useSearchYouTube(activeQuery);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - trigger only when results arrive
  React.useEffect(() => {
    if (results && results.length > 0 && activeQuery) {
      playSong(results[0], results);
      const pl = FEATURED_PLAYLISTS.find((p) => p.id === activeId);
      toast.success(`Playing ${pl?.name ?? "playlist"} 🎵`);
      setActiveQuery("");
      setActiveId("");
    }
  }, [results]);

  const handlePlay = (pl: (typeof FEATURED_PLAYLISTS)[0]) => {
    if (isFetching) return;
    setActiveId(pl.id);
    setActiveQuery(pl.query);
    toast.loading(`Loading ${pl.name}...`, { id: "featured-pl" });
    setTimeout(() => toast.dismiss("featured-pl"), 5000);
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
          const isLoading = isFetching && activeId === pl.id;
          return (
            <motion.button
              key={pl.id}
              type="button"
              data-ocid={`featured_playlists.item.${i + 1}`}
              onClick={() => handlePlay(pl)}
              disabled={isFetching}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: isFetching ? 1 : 1.03 }}
              whileTap={{ scale: isFetching ? 1 : 0.97 }}
              className="relative rounded-xl overflow-hidden text-left group"
              style={{
                height: "120px",
                background: pl.gradient,
                opacity: isFetching && activeId !== pl.id ? 0.55 : 1,
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
