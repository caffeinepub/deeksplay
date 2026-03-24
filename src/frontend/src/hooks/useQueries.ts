import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Song } from "../types/music";
import { useActor } from "./useActor";

const YT_API_KEY = "AIzaSyAK_oUtuutw46grbpCUx484TiXQEXtvOUc";

export function useSearchYouTube(query: string) {
  return useQuery({
    queryKey: ["yt-search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&key=${YT_API_KEY}&q=${encodeURIComponent(query)}`,
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
    },
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
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

export function useRecentlyPlayed() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["recently-played"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).getRecentlyPlayed();
        return (result as Song[]) || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).getFavorites();
        return (result as Song[]) || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaylists() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).getPlaylists();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecentlyPlayed() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (song: Song) => {
      if (!actor) return;
      await (actor as any).addRecentlyPlayed(song);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recently-played"] }),
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (song: Song) => {
      if (!actor) return;
      await (actor as any).toggleFavorite(song);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) return;
      await (actor as any).createPlaylist(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useDeletePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!actor) return;
      await (actor as any).deletePlaylist(playlistId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useAddSongToPlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      song,
    }: { playlistId: string; song: Song }) => {
      if (!actor) return;
      await (actor as any).addSongToPlaylist(playlistId, song);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}
