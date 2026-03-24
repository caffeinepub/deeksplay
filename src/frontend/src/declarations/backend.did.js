/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

const Song = IDL.Record({
  id: IDL.Text,
  title: IDL.Text,
  artist: IDL.Text,
  thumbnail: IDL.Text,
  videoId: IDL.Text,
  duration: IDL.Text,
});

const Playlist = IDL.Record({
  id: IDL.Text,
  name: IDL.Text,
  songs: IDL.Vec(Song),
});

export const idlService = IDL.Service({
  addRecentlyPlayed: IDL.Func([Song], [], []),
  getRecentlyPlayed: IDL.Func([], [IDL.Vec(Song)], ['query']),
  toggleFavorite: IDL.Func([Song], [IDL.Bool], []),
  getFavorites: IDL.Func([], [IDL.Vec(Song)], ['query']),
  isFavorite: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  createPlaylist: IDL.Func([IDL.Text], [Playlist], []),
  addSongToPlaylist: IDL.Func([IDL.Text, Song], [IDL.Bool], []),
  removeSongFromPlaylist: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  deletePlaylist: IDL.Func([IDL.Text], [IDL.Bool], []),
  getPlaylists: IDL.Func([], [IDL.Vec(Playlist)], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Song = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    artist: IDL.Text,
    thumbnail: IDL.Text,
    videoId: IDL.Text,
    duration: IDL.Text,
  });
  const Playlist = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    songs: IDL.Vec(Song),
  });
  return IDL.Service({
    addRecentlyPlayed: IDL.Func([Song], [], []),
    getRecentlyPlayed: IDL.Func([], [IDL.Vec(Song)], ['query']),
    toggleFavorite: IDL.Func([Song], [IDL.Bool], []),
    getFavorites: IDL.Func([], [IDL.Vec(Song)], ['query']),
    isFavorite: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    createPlaylist: IDL.Func([IDL.Text], [Playlist], []),
    addSongToPlaylist: IDL.Func([IDL.Text, Song], [IDL.Bool], []),
    removeSongFromPlaylist: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    deletePlaylist: IDL.Func([IDL.Text], [IDL.Bool], []),
    getPlaylists: IDL.Func([], [IDL.Vec(Playlist)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
