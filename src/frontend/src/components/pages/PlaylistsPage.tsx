import { ListMusic, Music, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylists,
} from "../../hooks/useQueries";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

interface PlaylistsPageProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
}

export function PlaylistsPage({
  favorites,
  onToggleFavorite,
}: PlaylistsPageProps) {
  const { data: playlists = [], isLoading } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const favoriteIds = new Set(favorites.map((f) => f.id));

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPlaylist.mutateAsync(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const handleStartCreating = () => {
    setCreating(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selected = playlists.find((p: any) => p.id === selectedId);

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-6"
      data-ocid="playlists.page"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#E9EEF6" }}>
            Playlists
          </h2>
          <p className="text-sm" style={{ color: "#9AA6B2" }}>
            Manage your music collections
          </p>
        </div>
        <button
          type="button"
          data-ocid="playlist.open_modal_button"
          onClick={handleStartCreating}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: "rgba(35,230,226,0.15)",
            border: "1px solid rgba(35,230,226,0.5)",
            color: "#23E6E2",
            boxShadow: "0 0 15px rgba(35,230,226,0.15)",
          }}
        >
          <Plus size={16} />
          New Playlist
        </button>
      </div>

      {creating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="playlist.dialog"
          className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <input
            ref={inputRef}
            data-ocid="playlist.input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist name..."
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#E9EEF6" }}
          />
          <button
            type="button"
            data-ocid="playlist.submit_button"
            onClick={handleCreate}
            disabled={createPlaylist.isPending}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "rgba(35,230,226,0.15)",
              border: "1px solid rgba(35,230,226,0.5)",
              color: "#23E6E2",
            }}
          >
            Create
          </button>
          <button
            type="button"
            data-ocid="playlist.cancel_button"
            onClick={() => {
              setCreating(false);
              setNewName("");
            }}
            style={{ color: "#9AA6B2" }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div
          data-ocid="playlists.loading_state"
          className="grid grid-cols-2 gap-3"
        >
          {SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="h-24 rounded-xl"
              style={{ background: "rgba(20,26,34,0.9)" }}
            />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div data-ocid="playlists.empty_state" className="text-center py-12">
          <ListMusic
            size={40}
            className="mx-auto mb-3"
            style={{ color: "rgba(35,230,226,0.3)" }}
          />
          <p className="font-medium" style={{ color: "#E9EEF6" }}>
            No playlists yet
          </p>
          <p className="text-sm mt-1" style={{ color: "#9AA6B2" }}>
            Create your first playlist above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {playlists.map((pl: any, i: number) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`playlists.item.${i + 1}`}
              className="glass-card rounded-xl p-4 cursor-pointer"
              style={{
                border:
                  selectedId === pl.id
                    ? "1px solid rgba(35,230,226,0.5)"
                    : undefined,
              }}
              onClick={() => setSelectedId(selectedId === pl.id ? null : pl.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(35,230,226,0.15)",
                      border: "1px solid rgba(35,230,226,0.3)",
                    }}
                  >
                    <ListMusic size={18} style={{ color: "#23E6E2" }} />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#E9EEF6" }}
                    >
                      {pl.name}
                    </p>
                    <p className="text-xs" style={{ color: "#9AA6B2" }}>
                      {pl.songs?.length || 0} songs
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid={`playlists.delete_button.${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist.mutate(pl.id);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ color: "#9AA6B2" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selected?.songs && selected.songs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <h3 className="font-bold mb-3" style={{ color: "#E9EEF6" }}>
            {selected.name}
          </h3>
          <div className="space-y-1">
            {selected.songs.map((song: Song, i: number) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                queue={selected.songs}
                isFavorite={favoriteIds.has(song.id)}
                onToggleFavorite={onToggleFavorite}
                ocidPrefix="playlist_songs"
              />
            ))}
          </div>
        </motion.div>
      )}

      {selected && (!selected.songs || selected.songs.length === 0) && (
        <div
          data-ocid="playlist_songs.empty_state"
          className="mt-6 text-center py-8"
        >
          <Music
            size={32}
            className="mx-auto mb-2"
            style={{ color: "rgba(35,230,226,0.3)" }}
          />
          <p className="text-sm" style={{ color: "#9AA6B2" }}>
            This playlist is empty. Add songs from Explore.
          </p>
        </div>
      )}
    </div>
  );
}
