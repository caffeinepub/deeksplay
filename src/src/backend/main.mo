import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

persistent actor {
  type Song = {
    id: Text;
    title: Text;
    artist: Text;
    thumbnail: Text;
    videoId: Text;
    duration: Text;
  };

  type Playlist = {
    id: Text;
    name: Text;
    songs: [Song];
  };

  stable var recentlyPlayed: [Song] = [];
  stable var favorites: [Song] = [];
  stable var playlists: [Playlist] = [];
  stable var nextPlaylistId: Nat = 1;

  public func addRecentlyPlayed(song: Song) : async () {
    let filtered = Array.filter(recentlyPlayed, func(s: Song) : Bool { s.id != song.id });
    let limited = if (filtered.size() >= 19) { Array.tabulate(19, func(i: Nat) : Song { filtered[i] }) } else { filtered };
    recentlyPlayed := Array.append([song], limited);
  };

  public query func getRecentlyPlayed() : async [Song] {
    recentlyPlayed;
  };

  public func toggleFavorite(song: Song) : async Bool {
    for (s in favorites.vals()) {
      if (s.id == song.id) {
        favorites := Array.filter(favorites, func(f: Song) : Bool { f.id != song.id });
        return false;
      };
    };
    favorites := Array.append(favorites, [song]);
    return true;
  };

  public query func getFavorites() : async [Song] {
    favorites;
  };

  public query func isFavorite(songId: Text) : async Bool {
    for (s in favorites.vals()) {
      if (s.id == songId) { return true; };
    };
    false;
  };

  public func createPlaylist(name: Text) : async Playlist {
    let id = Nat.toText(nextPlaylistId);
    nextPlaylistId += 1;
    let pl: Playlist = { id; name; songs = [] };
    playlists := Array.append(playlists, [pl]);
    pl;
  };

  public func addSongToPlaylist(playlistId: Text, song: Song) : async Bool {
    var found = false;
    playlists := Array.map(playlists, func(pl: Playlist) : Playlist {
      if (pl.id == playlistId) {
        found := true;
        var exists = false;
        for (s in pl.songs.vals()) {
          if (s.id == song.id) { exists := true; };
        };
        if (not exists) {
          { id = pl.id; name = pl.name; songs = Array.append(pl.songs, [song]) };
        } else { pl };
      } else { pl };
    });
    found;
  };

  public func removeSongFromPlaylist(playlistId: Text, songId: Text) : async Bool {
    var found = false;
    playlists := Array.map(playlists, func(pl: Playlist) : Playlist {
      if (pl.id == playlistId) {
        found := true;
        { id = pl.id; name = pl.name; songs = Array.filter(pl.songs, func(s: Song) : Bool { s.id != songId }) };
      } else { pl };
    });
    found;
  };

  public func deletePlaylist(playlistId: Text) : async Bool {
    let before = playlists.size();
    playlists := Array.filter(playlists, func(pl: Playlist) : Bool { pl.id != playlistId });
    playlists.size() < before;
  };

  public query func getPlaylists() : async [Playlist] {
    playlists;
  };
};
