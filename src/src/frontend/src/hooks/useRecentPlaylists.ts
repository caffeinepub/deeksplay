import { useCallback, useState } from "react";

const STORAGE_KEY = "deeksplay_recent_playlists";
const MAX_RECENT = 6;

export interface RecentPlaylist {
  id: string;
  name: string;
  songCount: number;
  accessedAt: number;
}

export function useRecentPlaylists() {
  const [recentPlaylists, setRecentPlaylists] = useState<RecentPlaylist[]>(
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    },
  );

  const addRecentPlaylist = useCallback(
    (pl: { id: string; name: string; songs?: any[] }) => {
      setRecentPlaylists((prev) => {
        const filtered = prev.filter((p) => p.id !== pl.id);
        const updated = [
          {
            id: pl.id,
            name: pl.name,
            songCount: pl.songs?.length || 0,
            accessedAt: Date.now(),
          },
          ...filtered,
        ].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [],
  );

  return { recentPlaylists, addRecentPlaylist };
}
