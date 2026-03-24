export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId: string;
  duration: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export type ActivePage =
  | "home"
  | "explore"
  | "library"
  | "playlists"
  | "favorites";
