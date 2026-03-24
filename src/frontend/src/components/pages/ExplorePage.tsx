import { Loader2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSearchYouTube, useTrendingMusic } from "../../hooks/useQueries";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const genres = [
  { label: "Punjabi", color: "#23E6E2", query: "Punjabi songs 2024" },
  { label: "Bollywood", color: "#FF4FD8", query: "Bollywood hits 2024" },
  { label: "Hip-Hop", color: "#8A5CFF", query: "hip hop music 2024" },
  { label: "Lo-fi", color: "#FFB347", query: "lo-fi beats chill" },
  { label: "EDM", color: "#35C7FF", query: "EDM electronic music 2024" },
  { label: "Pop", color: "#FF4FD8", query: "pop hits 2024" },
  { label: "Rock", color: "#8A5CFF", query: "rock music 2024" },
  { label: "Classical", color: "#FFB347", query: "Indian classical music" },
];

interface ExplorePageProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export function ExplorePage({
  searchQuery,
  onSearch,
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
}: ExplorePageProps) {
  const [activeGenre, setActiveGenre] = useState("");
  const query = activeGenre || searchQuery;
  const { data: searchResults = [], isLoading } = useSearchYouTube(query);
  const { data: trending = [] } = useTrendingMusic();
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const displaySongs = query ? searchResults : trending;

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      data-ocid="explore.page"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-1" style={{ color: "#E9EEF6" }}>
          Explore Music
        </h2>
        <p className="text-sm" style={{ color: "#9AA6B2" }}>
          Discover new sounds powered by YouTube
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {genres.map((g, i) => (
          <motion.button
            key={g.label}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            data-ocid={`explore.tab.${i + 1}`}
            onClick={() => {
              setActiveGenre(g.query === activeGenre ? "" : g.query);
              onSearch("");
            }}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background:
                activeGenre === g.query ? `${g.color}20` : "rgba(20,26,34,0.9)",
              border: `1px solid ${activeGenre === g.query ? g.color : "rgba(42,52,65,0.8)"}`,
              color: activeGenre === g.query ? g.color : "#9AA6B2",
              boxShadow:
                activeGenre === g.query ? `0 0 12px ${g.color}30` : "none",
            }}
          >
            {g.label}
          </motion.button>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          {isLoading ? (
            <Loader2
              className="animate-spin"
              size={18}
              style={{ color: "#23E6E2" }}
            />
          ) : (
            <Search size={18} style={{ color: "#23E6E2" }} />
          )}
          <h3 className="font-bold" style={{ color: "#E9EEF6" }}>
            {query ? `Results for "${query}"` : "Trending Music"}
          </h3>
          <span className="text-sm" style={{ color: "#9AA6B2" }}>
            ({displaySongs.length} tracks)
          </span>
        </div>
        {isLoading ? (
          <div
            data-ocid="explore.loading_state"
            className="flex flex-col gap-2"
          >
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <div
                key={k}
                className="h-14 rounded-lg"
                style={{ background: "rgba(20,26,34,0.9)" }}
              />
            ))}
          </div>
        ) : displaySongs.length === 0 ? (
          <div data-ocid="explore.empty_state" className="text-center py-12">
            <p style={{ color: "#9AA6B2" }}>
              No results found. Try searching above.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {displaySongs.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                queue={displaySongs}
                isFavorite={favoriteIds.has(song.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                ocidPrefix="explore"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
