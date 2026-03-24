import { Heart, Music } from "lucide-react";
import { motion } from "motion/react";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

interface FavoritesPageProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  isLoading: boolean;
}

export function FavoritesPage({
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
  isLoading,
}: FavoritesPageProps) {
  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-6"
      data-ocid="favorites.page"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <Heart size={24} style={{ color: "#FF4FD8" }} fill="#FF4FD8" />
          <h2 className="text-2xl font-bold" style={{ color: "#E9EEF6" }}>
            Favorites
          </h2>
        </div>
        <p className="text-sm" style={{ color: "#9AA6B2" }}>
          {favorites.length} saved songs
        </p>
      </motion.div>

      {isLoading ? (
        <div data-ocid="favorites.loading_state" className="space-y-2">
          {SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="h-14 rounded-lg"
              style={{ background: "rgba(20,26,34,0.9)" }}
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div data-ocid="favorites.empty_state" className="text-center py-16">
          <Heart
            size={48}
            className="mx-auto mb-4"
            style={{ color: "rgba(255,79,216,0.3)" }}
          />
          <p className="text-lg font-semibold" style={{ color: "#E9EEF6" }}>
            No favorites yet
          </p>
          <p className="text-sm mt-2" style={{ color: "#9AA6B2" }}>
            Like songs to add them to your favorites
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {favorites.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              queue={favorites}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              ocidPrefix="favorites"
            />
          ))}
        </div>
      )}
    </div>
  );
}
