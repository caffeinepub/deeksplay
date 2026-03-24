/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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
  songs: Array<Song>;
}
export interface _SERVICE {
  addRecentlyPlayed: ActorMethod<[Song], undefined>;
  getRecentlyPlayed: ActorMethod<[], Array<Song>>;
  toggleFavorite: ActorMethod<[Song], boolean>;
  getFavorites: ActorMethod<[], Array<Song>>;
  isFavorite: ActorMethod<[string], boolean>;
  createPlaylist: ActorMethod<[string], Playlist>;
  addSongToPlaylist: ActorMethod<[string, Song], boolean>;
  removeSongFromPlaylist: ActorMethod<[string, string], boolean>;
  deletePlaylist: ActorMethod<[string], boolean>;
  getPlaylists: ActorMethod<[], Array<Playlist>>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
