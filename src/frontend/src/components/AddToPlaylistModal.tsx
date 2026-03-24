import { ListMusic, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useAddSongToPlaylist, usePlaylists } from "../hooks/useQueries";
import type { Song } from "../types/music";

interface AddToPlaylistModalProps {
  song: Song | null;
  onClose: () => void;
}

export function AddToPlaylistModal({ song, onClose }: AddToPlaylistModalProps) {
  const { data: playlists = [] } = usePlaylists();
  const addSong = useAddSongToPlaylist();

  const handleAdd = async (playlistId: string) => {
    if (!song) return;
    await addSong.mutateAsync({ playlistId, song });
    toast.success("Added to playlist!");
    onClose();
  };

  return (
    <AnimatePresence>
      {song && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={onClose}
          data-ocid="playlist.modal"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card rounded-2xl p-6 w-80"
            style={{ border: "1px solid rgba(35,230,226,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "#E9EEF6" }}>
                Add to Playlist
              </h3>
              <button
                type="button"
                data-ocid="playlist.close_button"
                onClick={onClose}
                style={{ color: "#9AA6B2" }}
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs mb-4 truncate" style={{ color: "#9AA6B2" }}>
              {song.title}
            </p>
            {playlists.length === 0 ? (
              <p
                className="text-sm text-center py-4"
                style={{ color: "#9AA6B2" }}
              >
                No playlists. Create one first.
              </p>
            ) : (
              <div className="space-y-2">
                {playlists.map((pl: any, i: number) => (
                  <button
                    type="button"
                    key={pl.id}
                    data-ocid={`playlist.item.${i + 1}`}
                    onClick={() => handleAdd(pl.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all hover:bg-white/5"
                    style={{ color: "#E9EEF6" }}
                  >
                    <ListMusic size={16} style={{ color: "#23E6E2" }} />
                    <span className="flex-1 truncate">{pl.name}</span>
                    <Plus size={14} style={{ color: "#9AA6B2" }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
