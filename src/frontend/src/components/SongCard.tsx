import { Play, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlayer } from "../context/PlayerContext";
import type { Song } from "../types/music";
import { type Rating, getRating, setRating } from "../utils/ratings";

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
  const [rating, setRatingState] = useState<Rating>(() => getRating(song.id));

  const handleRating = (e: React.MouseEvent, newRating: "like" | "dislike") => {
    e.stopPropagation();
    const next: Rating = rating === newRating ? null : newRating;
    setRating(song.id, next);
    setRatingState(next);
    if (next === "like") toast.success("👍 Liked!", { duration: 1500 });
    else if (next === "dislike") toast("👎 Disliked", { duration: 1500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`${ocidPrefix}.item.${index + 1}`}
      className="glass-card rounded-xl p-3 cursor-pointer flex-shrink-0 w-40 group"
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
        {/* Hover overlay with play + ratings */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(35,230,226,0.9)", color: "#0B0F14" }}
          >
            <Play size={16} fill="currentColor" />
          </div>
          {/* Rating row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => handleRating(e, "like")}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                color: rating === "like" ? "#23E6E2" : "rgba(255,255,255,0.7)",
                background:
                  rating === "like" ? "rgba(35,230,226,0.2)" : "transparent",
              }}
            >
              <ThumbsUp
                size={11}
                fill={rating === "like" ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              onClick={(e) => handleRating(e, "dislike")}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                color:
                  rating === "dislike" ? "#FF4FD8" : "rgba(255,255,255,0.7)",
                background:
                  rating === "dislike" ? "rgba(255,79,216,0.2)" : "transparent",
              }}
            >
              <ThumbsDown
                size={11}
                fill={rating === "dislike" ? "currentColor" : "none"}
              />
            </button>
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
