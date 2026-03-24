import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Song } from "../types/music";

const YT_API_KEY = "AIzaSyAK_oUtuutw46grbpCUx484TiXQEXtvOUc";

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_FAVORITES = "deeksplay_favorites";
const LS_PLAYLISTS = "deeksplay_playlists";
const LS_RECENTLY_PLAYED = "deeksplay_recently_played";
const LS_PLAYLIST_NEXT_ID = "deeksplay_playlist_next_id";
const LS_SEARCH_HISTORY = "deeksplay_search_history";

function lsGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── YouTube search ──────────────────────────────────────────────────────────
export function useSearchYouTube(query: string) {
  return useQuery({
    queryKey: ["yt-search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&key=${YT_API_KEY}&q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || "YouTube API error");
      }
      if (!data.items) return [];
      // biome-ignore lint/suspicious/noExplicitAny: YouTube API
      return data.items.map(
        (item: any): Song => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
          videoId: item.id.videoId,
          duration: "",
        }),
      );
    },
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTrendingMusic() {
  return useQuery({
    queryKey: ["yt-trending"],
    queryFn: async () => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${YT_API_KEY}`,
      );
      const data = await res.json();
      if (!data.items) return [];
      return data.items.map(
        (item: any): Song => ({
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
          videoId: item.id,
          duration: item.contentDetails?.duration || "",
        }),
      );
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Recently Played (localStorage) ─────────────────────────────────────────
export function useRecentlyPlayed() {
  return useQuery({
    queryKey: ["recently-played"],
    queryFn: async () => lsGet<Song[]>(LS_RECENTLY_PLAYED, []),
    staleTime: 0,
  });
}

export function useAddRecentlyPlayed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (song: Song) => {
      const current = lsGet<Song[]>(LS_RECENTLY_PLAYED, []);
      const filtered = current.filter((s) => s.id !== song.id);
      const limited = [song, ...filtered].slice(0, 20);
      lsSet(LS_RECENTLY_PLAYED, limited);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recently-played"] }),
  });
}

// ─── Favorites (localStorage) ────────────────────────────────────────────────
export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => lsGet<Song[]>(LS_FAVORITES, []),
    staleTime: 0,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (song: Song) => {
      const current = lsGet<Song[]>(LS_FAVORITES, []);
      const exists = current.some((s) => s.id === song.id);
      if (exists) {
        lsSet(
          LS_FAVORITES,
          current.filter((s) => s.id !== song.id),
        );
        return false;
      }
      lsSet(LS_FAVORITES, [...current, song]);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

// ─── Playlists (localStorage) ────────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => lsGet<Playlist[]>(LS_PLAYLISTS, []),
    staleTime: 0,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const current = lsGet<Playlist[]>(LS_PLAYLISTS, []);
      let nextId = lsGet<number>(LS_PLAYLIST_NEXT_ID, 1);
      const newPlaylist: Playlist = { id: String(nextId), name, songs: [] };
      lsSet(LS_PLAYLISTS, [...current, newPlaylist]);
      lsSet(LS_PLAYLIST_NEXT_ID, nextId + 1);
      return newPlaylist;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: string) => {
      const current = lsGet<Playlist[]>(LS_PLAYLISTS, []);
      lsSet(
        LS_PLAYLISTS,
        current.filter((p) => p.id !== playlistId),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useAddSongToPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      song,
    }: { playlistId: string; song: Song }) => {
      const current = lsGet<Playlist[]>(LS_PLAYLISTS, []);
      const updated = current.map((p) => {
        if (p.id !== playlistId) return p;
        const alreadyIn = p.songs.some((s) => s.id === song.id);
        if (alreadyIn) return p;
        return { ...p, songs: [...p.songs, song] };
      });
      lsSet(LS_PLAYLISTS, updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useRemoveSongFromPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: { playlistId: string; songId: string }) => {
      const current = lsGet<Playlist[]>(LS_PLAYLISTS, []);
      const updated = current.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
          : p,
      );
      lsSet(LS_PLAYLISTS, updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

// ─── Search History (localStorage) ──────────────────────────────────────────
export function useSearchHistory() {
  return useQuery({
    queryKey: ["search-history"],
    queryFn: async () => lsGet<string[]>(LS_SEARCH_HISTORY, []),
    staleTime: 0,
  });
}

export function useAddSearchHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim()) return;
      const current = lsGet<string[]>(LS_SEARCH_HISTORY, []);
      const filtered = current.filter((q) => q !== query.trim());
      lsSet(LS_SEARCH_HISTORY, [query.trim(), ...filtered].slice(0, 20));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });
}

// ─── Trending by Region ──────────────────────────────────────────────────────
export function useTrendingByRegion(regionCode: string, query?: string) {
  return useQuery({
    queryKey: ["yt-trending-region", regionCode, query],
    queryFn: async () => {
      if (query) {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&key=${YT_API_KEY}&q=${encodeURIComponent(query)}&regionCode=${regionCode}`,
        );
        const data = await res.json();
        if (!data.items) return [];
        return data.items.map(
          (item: any): Song => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail:
              item.snippet.thumbnails?.medium?.url ||
              item.snippet.thumbnails?.default?.url ||
              "",
            videoId: item.id.videoId,
            duration: "",
          }),
        );
      }
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=${regionCode}&key=${YT_API_KEY}`,
      );
      const data = await res.json();
      if (!data.items) return [];
      return data.items.map(
        (item: any): Song => ({
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
          videoId: item.id,
          duration: item.contentDetails?.duration || "",
        }),
      );
    },
    staleTime: 10 * 60 * 1000,
  });
}
