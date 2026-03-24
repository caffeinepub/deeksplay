import { Flame, Globe } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTrendingByRegion } from "../../hooks/useQueries";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const regions = [
  { label: "🇮🇳 India", regionCode: "IN", color: "#FF9933" },
  {
    label: "🎵 Punjabi",
    regionCode: "IN",
    query: "Punjabi trending 2025",
    color: "#FF4FD8",
  },
  {
    label: "🎬 Bollywood",
    regionCode: "IN",
    query: "Bollywood trending 2025",
    color: "#23E6E2",
  },
  { label: "🌍 Global", regionCode: "US", color: "#8A5CFF" },
  {
    label: "🎤 Hip-Hop",
    regionCode: "US",
    query: "hip hop trending 2025",
    color: "#FFB347",
  },
];

const SKELETON_KEYS = [
  "sk-0",
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
];

interface TrendingPageProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export function TrendingPage({
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
}: TrendingPageProps) {
  const [activeRegion, setActiveRegion] = useState(regions[0]);
  const { data: songs = [], isLoading } = useTrendingByRegion(
    activeRegion.regionCode,
    activeRegion.query,
  );
  const favoriteIds = new Set(favorites.map((f) => f.id));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Flame size={24} style={{ color: "#FF4FD8" }} />
          <h2 className="text-2xl font-bold" style={{ color: "#E9EEF6" }}>
            Trending Now
          </h2>
        </div>
        <p className="text-sm" style={{ color: "#9AA6B2" }}>
          Real-time charts powered by YouTube
        </p>
      </motion.div>

      {/* Region tabs */}
      <div className="flex flex-wrap gap-2">
        {regions.map((r, i) => (
          <motion.button
            key={r.label}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveRegion(r)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background:
                activeRegion.label === r.label
                  ? `${r.color}20`
                  : "rgba(20,26,34,0.9)",
              border: `1px solid ${activeRegion.label === r.label ? r.color : "rgba(42,52,65,0.8)"}`,
              color: activeRegion.label === r.label ? r.color : "#9AA6B2",
              boxShadow:
                activeRegion.label === r.label
                  ? `0 0 14px ${r.color}30`
                  : "none",
            }}
          >
            {r.label}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} style={{ color: activeRegion.color }} />
          <h3 className="font-bold" style={{ color: "#E9EEF6" }}>
            {activeRegion.label} Charts
          </h3>
          <span className="text-sm" style={{ color: "#9AA6B2" }}>
            ({songs.length} tracks)
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="h-14 rounded-lg animate-pulse"
                style={{ background: "rgba(20,26,34,0.9)" }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, i) => (
              <div key={song.id} className="relative">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      i < 3
                        ? `linear-gradient(135deg, ${activeRegion.color}, ${activeRegion.color}80)`
                        : "rgba(42,52,65,0.8)",
                    color: i < 3 ? "#fff" : "#9AA6B2",
                    marginLeft: "-2px",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ paddingLeft: "24px" }}>
                  <SongRow
                    song={song}
                    index={i}
                    queue={songs}
                    isFavorite={favoriteIds.has(song.id)}
                    onToggleFavorite={onToggleFavorite}
                    onAddToPlaylist={onAddToPlaylist}
                    ocidPrefix="trending"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
