import { Heart, Pause, Play, Plus, Radio, Share2 } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePlayer } from "../context/PlayerContext";
import { useSearchYouTube } from "../hooks/useQueries";
import type { Song } from "../types/music";
import { Equalizer } from "./Equalizer";

interface SongRowProps {
  song: Song;
  index: number;
  queue: Song[];
  isFavorite?: boolean;
  onToggleFavorite?: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
  ocidPrefix?: string;
}

function ArtistRadioButton({ song }: { song: Song }) {
  const { playSong } = usePlayer();
  const [query, setQuery] = useState("");
  const { data: results } = useSearchYouTube(query);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - trigger only when results arrive
  useEffect(() => {
    if (results && results.length > 0 && query) {
      playSong(results[0], results);
      toast.success(`📻 Artist Radio: ${song.artist}`);
      setQuery("");
    }
  }, [results]);

  const startRadio = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading(`Loading ${song.artist} radio...`, { id: "radio" });
    setQuery(`${song.artist} songs`);
    setTimeout(() => toast.dismiss("radio"), 3000);
  };

  return (
    <button
      type="button"
      onClick={startRadio}
      title={`${song.artist} Radio`}
      className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ color: "#9AA6B2" }}
    >
      <Radio size={13} />
    </button>
  );
}

export function SongRow({
  song,
  index,
  queue,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  ocidPrefix = "song",
}: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playSong(song, queue);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `https://youtube.com/watch?v=${song.videoId}`,
    );
    toast.success("Link copied! 🔗");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`${ocidPrefix}.item.${index + 1}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-all"
      style={{
        background: isActive ? "rgba(26,43,45,0.8)" : "transparent",
        border: isActive
          ? "1px solid rgba(35,230,226,0.3)"
          : "1px solid transparent",
      }}
      onClick={handlePlay}
    >
      <div className="relative w-10 h-10 rounded flex-shrink-0 overflow-hidden">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          {isActive && isPlaying ? (
            <Pause size={14} style={{ color: "#23E6E2" }} />
          ) : (
            <Play size={14} style={{ color: "#23E6E2" }} />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isActive ? "#23E6E2" : "#E9EEF6" }}
        >
          {song.title}
        </p>
        <p className="text-xs truncate" style={{ color: "#9AA6B2" }}>
          {song.artist}
        </p>
      </div>
      {isActive && isPlaying && <Equalizer isPlaying size="sm" />}
      {onToggleFavorite && (
        <button
          type="button"
          data-ocid={`${ocidPrefix}.toggle.${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(song);
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
          style={{ color: isFavorite ? "#FF4FD8" : "#9AA6B2" }}
        >
          <Heart size={14} fill={isFavorite ? "#FF4FD8" : "none"} />
        </button>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArtistRadioButton song={song} />
        <button
          type="button"
          onClick={handleShare}
          title="Share"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ color: "#9AA6B2" }}
        >
          <Share2 size={13} />
        </button>
        {onAddToPlaylist && (
          <button
            type="button"
            data-ocid={`${ocidPrefix}.secondary_button.${index + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(song);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: "#9AA6B2" }}
          >
            <Plus size={14} />
          </button>
        )}
        <span className="text-xs" style={{ color: "#9AA6B2" }}>
          {song.duration || ""}
        </span>
      </div>
    </motion.div>
  );
}
