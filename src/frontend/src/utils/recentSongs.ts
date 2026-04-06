import type { Song } from "../types/music";

const LS_KEY = "deeksplay_recently_played";

export function getRecentSongs(): Song[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentSong(song: Song): void {
  const current = getRecentSongs();
  const filtered = current.filter((s) => s.id !== song.id);
  const limited = [song, ...filtered].slice(0, 20);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(limited));
  } catch {}
}
