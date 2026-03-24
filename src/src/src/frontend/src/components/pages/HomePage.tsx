import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ListMusic,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useRecentlyPlayed, useTrendingMusic } from "../../hooks/useQueries";
import { useRecentPlaylists } from "../../hooks/useRecentPlaylists";
import type { Song } from "../../types/music";
import { SongCard } from "../SongCard";
import { SongRow } from "../SongRow";

const featuredArtists = [
  {
    name: "Diljit Dosanjh",
    genre: "Punjabi Pop",
    color: "#23E6E2",
    thumbnail: "https://i.ytimg.com/vi/qHzYplFMFTk/mqdefault.jpg",
  },
  {
    name: "AP Dhillon",
    genre: "Punjabi R&B",
    color: "#FF4FD8",
    thumbnail: "https://i.ytimg.com/vi/2q0LOuIDqnU/mqdefault.jpg",
  },
  {
    name: "Sidhu Moosewala",
    genre: "Punjabi Hip-Hop",
    color: "#8A5CFF",
    thumbnail: "https://i.ytimg.com/vi/EVW-opO6QoA/mqdefault.jpg",
  },
];

const EQ_BARS = ["eq-1", "eq-2", "eq-3", "eq-4", "eq-5"];
const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

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
  const { playSong } = usePlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right",
  ) => {
    if (ref.current)
      ref.current.scrollBy({
        left: dir === "left" ? -180 : 180,
        behavior: "smooth",
      });
  };

  const displayRecent =
    recentlyPlayed.length > 0 ? recentlyPlayed : trending.slice(0, 8);
  const newReleases = trending.slice(8, 16);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h2
          className="text-4xl font-black uppercase tracking-widest mb-2"
          style={{
            color: "#E9EEF6",
            textShadow: "0 0 40px rgba(35,230,226,0.3)",
          }}
        >
          EXPLORE NEW SOUNDS
        </h2>
        <p className="text-sm" style={{ color: "#9AA6B2" }}>
          Powered by YouTube • No Ads • Futuristic Audio
        </p>
        <div className="flex justify-center gap-6 mt-8">
          {featuredArtists.map((artist, i) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              data-ocid={`featured.item.${i + 1}`}
              className="glass-card rounded-2xl p-4 w-44 cursor-pointer"
              style={{
                border: `1px solid ${artist.color}40`,
                boxShadow: i === 1 ? `0 0 25px ${artist.color}30` : undefined,
              }}
              onClick={() =>
                playSong(
                  {
                    id: artist.name,
                    title: artist.name,
                    artist: artist.genre,
                    thumbnail: artist.thumbnail,
                    videoId: "",
                    duration: "",
                  },
                  [],
                )
              }
            >
              <div
                className="w-full aspect-square rounded-xl overflow-hidden mb-3"
                style={{ border: `2px solid ${artist.color}60` }}
              >
                <img
                  src={artist.thumbnail}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p
                className="font-semibold text-sm truncate"
                style={{ color: "#E9EEF6" }}
              >
                {artist.name}
              </p>
              <p className="text-xs" style={{ color: artist.color }}>
                {artist.genre}
              </p>
              {i === 1 && (
                <div className="flex items-end gap-0.5 mt-2 justify-center">
                  {EQ_BARS.map((k, j) => (
                    <div
                      key={k}
                      className={`w-1 rounded-full eq-bar-${j + 1}`}
                      style={{ background: artist.color, minHeight: "4px" }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recently Played Playlists */}
      {recentPlaylists.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ListMusic size={18} style={{ color: "#8A5CFF" }} />
            <h3 className="text-lg font-bold" style={{ color: "#E9EEF6" }}>
              Recently Played Playlists
            </h3>
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
            <h3 className="text-lg font-bold" style={{ color: "#E9EEF6" }}>
              Recently Played
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="recent.pagination_prev"
              onClick={() => scroll(recentScrollRef, "left")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(35,230,226,0.1)",
                border: "1px solid rgba(35,230,226,0.3)",
                color: "#23E6E2",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              data-ocid="recent.pagination_next"
              onClick={() => scroll(recentScrollRef, "right")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(35,230,226,0.1)",
                border: "1px solid rgba(35,230,226,0.3)",
                color: "#23E6E2",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div
          ref={recentScrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {displayRecent.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              queue={displayRecent}
              ocidPrefix="recent"
            />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: "#FF4FD8" }} />
            <h3 className="text-lg font-bold" style={{ color: "#E9EEF6" }}>
              Trending Now
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="trending.pagination_prev"
              onClick={() => scroll(scrollRef, "left")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(255,79,216,0.1)",
                border: "1px solid rgba(255,79,216,0.3)",
                color: "#FF4FD8",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              data-ocid="trending.pagination_next"
              onClick={() => scroll(scrollRef, "right")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(255,79,216,0.1)",
                border: "1px solid rgba(255,79,216,0.3)",
                color: "#FF4FD8",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        {trendingLoading ? (
          <div className="flex gap-3">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="w-40 h-52 rounded-xl"
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
          </>
        )}
      </section>
    </div>
  );
}
