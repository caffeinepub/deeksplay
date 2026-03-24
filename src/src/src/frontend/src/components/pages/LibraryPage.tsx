import { Clock, Music } from "lucide-react";
import { motion } from "motion/react";
import { useRecentlyPlayed } from "../../hooks/useQueries";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

interface LibraryPageProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export function LibraryPage({
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
}: LibraryPageProps) {
  const { data: recentlyPlayed = [], isLoading } = useRecentlyPlayed();
  const favoriteIds = new Set(favorites.map((f) => f.id));

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      data-ocid="library.page"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-1" style={{ color: "#E9EEF6" }}>
          Your Library
        </h2>
        <p className="text-sm" style={{ color: "#9AA6B2" }}>
          Your listening history
        </p>
      </motion.div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} style={{ color: "#23E6E2" }} />
          <h3 className="font-bold" style={{ color: "#E9EEF6" }}>
            Recently Played
          </h3>
        </div>
        {isLoading ? (
          <div data-ocid="library.loading_state" className="space-y-2">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="h-14 rounded-lg"
                style={{ background: "rgba(20,26,34,0.9)" }}
              />
            ))}
          </div>
        ) : recentlyPlayed.length === 0 ? (
          <div data-ocid="library.empty_state" className="text-center py-12">
            <Music
              size={40}
              className="mx-auto mb-3"
              style={{ color: "rgba(35,230,226,0.3)" }}
            />
            <p className="font-medium" style={{ color: "#E9EEF6" }}>
              No history yet
            </p>
            <p className="text-sm mt-1" style={{ color: "#9AA6B2" }}>
              Start playing music to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentlyPlayed.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                queue={recentlyPlayed}
                isFavorite={favoriteIds.has(song.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                ocidPrefix="library"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
