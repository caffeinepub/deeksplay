import { Play } from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "../context/PlayerContext";
import type { Song } from "../types/music";

interface SongCardProps {
  song: Song;
  index: number;
  queue: Song[];
  ocidPrefix?: string;
}

export function SongCard({
  song,
  index,
  queue,
  ocidPrefix = "card",
}: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`${ocidPrefix}.item.${index + 1}`}
      className="glass-card rounded-xl p-3 cursor-pointer flex-shrink-0 w-40"
      style={{
        border: isActive ? "1px solid rgba(35,230,226,0.5)" : undefined,
        boxShadow: isActive ? "0 0 20px rgba(35,230,226,0.2)" : undefined,
      }}
      onClick={() => playSong(song, queue)}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(35,230,226,0.9)", color: "#0B0F14" }}
          >
            <Play size={16} fill="currentColor" />
          </div>
        </div>
        {isActive && isPlaying && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full eq-bar-${i + 1}`}
                style={{ background: "#23E6E2", minHeight: "4px" }}
              />
            ))}
          </div>
        )}
      </div>
      <p
        className="text-xs font-semibold truncate"
        style={{ color: isActive ? "#23E6E2" : "#E9EEF6" }}
      >
        {song.title}
      </p>
      <p className="text-xs truncate mt-0.5" style={{ color: "#9AA6B2" }}>
        {song.artist}
      </p>
    </motion.div>
  );
}
