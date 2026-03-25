import { useEffect } from "react";
import type { PlayerContextType } from "../context/PlayerContext";

type Player = Pick<
  PlayerContextType,
  "togglePlay" | "nextSong" | "prevSong" | "setVolume" | "volume"
>;

export function useKeyboardShortcuts(player: Player) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        player.togglePlay();
      } else if (e.code === "ArrowRight" && !e.altKey) {
        e.preventDefault();
        player.nextSong();
      } else if (e.code === "ArrowLeft" && !e.altKey) {
        e.preventDefault();
        player.prevSong();
      } else if (e.code === "KeyM") {
        player.setVolume(player.volume > 0 ? 0 : 80);
      } else if (e.code === "ArrowUp" && e.altKey) {
        e.preventDefault();
        player.setVolume(Math.min(100, player.volume + 10));
      } else if (e.code === "ArrowDown" && e.altKey) {
        e.preventDefault();
        player.setVolume(Math.max(0, player.volume - 10));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [player]);
}
