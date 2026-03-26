import {
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Loader2,
  Music,
  Pause,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { usePlayer } from "../../context/PlayerContext";
import {
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylists,
} from "../../hooks/useQueries";
import { useRecentPlaylists } from "../../hooks/useRecentPlaylists";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

interface PlaylistsPageProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
}

function formatTime(sec: number) {
  if (!sec || Number.isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlaylistModal({
  playlist,
  onClose,
  favorites,
  onToggleFavorite,
}: {
  playlist: any;
  onClose: () => void;
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
}) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    nextSong,
    prevSong,
  } = usePlayer();

  const favoriteIds = new Set(favorites.map((f) => f.id));
  const songs: Song[] = playlist.songs || [];

  const isCurrentFromPlaylist = songs.some((s) => s.id === currentSong?.id);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const CompactPlayer = () => (
    <div
      className="flex flex-col gap-3 p-4"
      style={{
        background: "rgba(10,14,20,0.9)",
        borderRight: "1px solid rgba(35,230,226,0.15)",
      }}
    >
      {/* Playlist header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(35,230,226,0.15)",
            border: "1px solid rgba(35,230,226,0.3)",
          }}
        >
          <ListMusic size={18} style={{ color: "#23E6E2" }} />
        </div>
        <div className="min-w-0">
          <p
            className="font-bold text-sm truncate"
            style={{ color: "#E9EEF6" }}
          >
            {playlist.name}
          </p>
          <p className="text-xs" style={{ color: "#9AA6B2" }}>
            {songs.length} songs
          </p>
        </div>
      </div>

      {/* Song thumbnail */}
      <div
        className="w-full aspect-square rounded-xl overflow-hidden mx-auto flex-shrink-0"
        style={{ maxWidth: "180px" }}
      >
        {currentSong && isCurrentFromPlaylist ? (
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "rgba(35,230,226,0.08)" }}
          >
            <Music size={40} style={{ color: "rgba(35,230,226,0.4)" }} />
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="text-center">
        {currentSong && isCurrentFromPlaylist ? (
          <>
            <p
              className="font-semibold text-sm truncate"
              style={{ color: "#23E6E2" }}
            >
              {currentSong.title}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: "#9AA6B2" }}>
              {currentSong.artist}
            </p>
          </>
        ) : (
          <p className="text-xs" style={{ color: "#9AA6B2" }}>
            Tap a song to play
          </p>
        )}
      </div>

      {/* Seek bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentSong && isCurrentFromPlaylist ? currentTime : 0}
          onChange={handleSeek}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #23E6E2 ${
              duration
                ? (
                    (currentSong && isCurrentFromPlaylist ? currentTime : 0) /
                      duration
                  ) * 100
                : 0
            }%, rgba(255,255,255,0.1) 0%)`,
            accentColor: "#23E6E2",
          }}
        />
        <div
          className="flex justify-between text-xs"
          style={{ color: "#9AA6B2" }}
        >
          <span>
            {formatTime(currentSong && isCurrentFromPlaylist ? currentTime : 0)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prevSong}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ color: "#9AA6B2" }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          data-ocid="playlist_modal.toggle"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "rgba(35,230,226,0.2)",
            border: "1px solid rgba(35,230,226,0.6)",
            boxShadow: "0 0 20px rgba(35,230,226,0.3)",
            color: "#23E6E2",
          }}
        >
          {isPlaying && isCurrentFromPlaylist ? (
            <Pause size={20} fill="#23E6E2" />
          ) : (
            <Play size={20} fill="#23E6E2" style={{ marginLeft: "2px" }} />
          )}
        </button>
        <button
          type="button"
          onClick={nextSong}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ color: "#9AA6B2" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const SongsList = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "rgba(35,230,226,0.15)" }}
      >
        <p className="font-bold text-sm" style={{ color: "#E9EEF6" }}>
          Songs
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {songs.length === 0 ? (
          <div
            data-ocid="playlist_modal.empty_state"
            className="flex flex-col items-center justify-center h-full py-12"
          >
            <Music
              size={32}
              className="mb-2"
              style={{ color: "rgba(35,230,226,0.3)" }}
            />
            <p className="text-sm" style={{ color: "#9AA6B2" }}>
              This playlist is empty
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {songs.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                queue={songs}
                isFavorite={favoriteIds.has(song.id)}
                onToggleFavorite={onToggleFavorite}
                ocidPrefix="playlist_modal_songs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          data-ocid="playlist_modal.modal"
          className="relative w-full md:max-w-3xl md:rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,14,20,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(35,230,226,0.2)",
            boxShadow:
              "0 0 60px rgba(35,230,226,0.08), 0 30px 80px rgba(0,0,0,0.8)",
            height: "90dvh",
            maxHeight: "640px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            data-ocid="playlist_modal.close_button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#9AA6B2",
            }}
          >
            <X size={16} />
          </button>

          {/* Desktop: side-by-side layout */}
          <div className="hidden md:flex h-full">
            {/* Left: Compact Player */}
            <div className="w-64 flex-shrink-0 flex flex-col justify-center">
              <CompactPlayer />
            </div>
            {/* Right: Songs list */}
            <div className="flex-1 min-w-0">
              <SongsList />
            </div>
          </div>

          {/* Mobile: stacked layout */}
          <div className="flex md:hidden flex-col h-full">
            {/* Songs list fills most space */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <SongsList />
            </div>
            {/* Compact player pinned at bottom */}
            <div
              className="flex-shrink-0 border-t"
              style={{ borderColor: "rgba(35,230,226,0.15)" }}
            >
              {/* Mobile horizontal player */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {currentSong && isCurrentFromPlaylist ? (
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "rgba(35,230,226,0.1)" }}
                    >
                      <Music
                        size={16}
                        style={{ color: "rgba(35,230,226,0.4)" }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{
                      color:
                        currentSong && isCurrentFromPlaylist
                          ? "#23E6E2"
                          : "#9AA6B2",
                    }}
                  >
                    {currentSong && isCurrentFromPlaylist
                      ? currentSong.title
                      : "Tap a song to play"}
                  </p>
                  {currentSong && isCurrentFromPlaylist && (
                    <p
                      className="text-xs truncate"
                      style={{ color: "#9AA6B2" }}
                    >
                      {currentSong.artist}
                    </p>
                  )}
                  {/* Mini seek bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={
                      currentSong && isCurrentFromPlaylist ? currentTime : 0
                    }
                    onChange={handleSeek}
                    className="w-full h-0.5 mt-1"
                    style={{ accentColor: "#23E6E2" }}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={prevSong}
                    className="w-7 h-7 flex items-center justify-center"
                    style={{ color: "#9AA6B2" }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(35,230,226,0.2)",
                      border: "1px solid rgba(35,230,226,0.5)",
                      color: "#23E6E2",
                    }}
                  >
                    {isPlaying && isCurrentFromPlaylist ? (
                      <Pause size={16} fill="#23E6E2" />
                    ) : (
                      <Play
                        size={16}
                        fill="#23E6E2"
                        style={{ marginLeft: "2px" }}
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={nextSong}
                    className="w-7 h-7 flex items-center justify-center"
                    style={{ color: "#9AA6B2" }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

export function PlaylistsPage({
  favorites,
  onToggleFavorite,
}: PlaylistsPageProps) {
  const { data: playlists = [], isLoading } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const { addRecentPlaylist } = useRecentPlaylists();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createPlaylist.mutateAsync(newName.trim());
      setNewName("");
      setCreating(false);
      toast.success("Playlist ban gayi! 🎵");
    } catch {
      toast.error("Playlist create nahi hui, dobara try karo!");
    }
  };

  const handleStartCreating = () => {
    setCreating(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const openPlaylist = playlists.find((p: any) => p.id === openPlaylistId);

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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: "rgba(35,230,226,0.15)",
              border: "1px solid rgba(35,230,226,0.5)",
              color: "#23E6E2",
            }}
          >
            {createPlaylist.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
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
              className="glass-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                border:
                  openPlaylistId === pl.id
                    ? "1px solid rgba(35,230,226,0.5)"
                    : undefined,
              }}
              onClick={() => {
                addRecentPlaylist(pl);
                setOpenPlaylistId(pl.id);
              }}
            >
              <div className="flex items-center justify-between">
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
                    if (openPlaylistId === pl.id) setOpenPlaylistId(null);
                    toast.success("Playlist delete ho gayi!");
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

      {/* Playlist Modal Portal */}
      {openPlaylist && (
        <PlaylistModal
          playlist={openPlaylist}
          onClose={() => setOpenPlaylistId(null)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
