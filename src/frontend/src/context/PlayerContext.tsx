import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Song } from "../types/music";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: "none" | "all" | "one";
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [ytReady, setYtReady] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const pendingSongRef = useRef<Song | null>(null);

  // Always-fresh refs to avoid stale closures in YT event callbacks
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const repeatModeRef = useRef<"none" | "all" | "one">("none");
  const isShuffleRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    if (window.YT?.Player) {
      setYtReady(true);
      return;
    }
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  // Use a ref for playSongInternal to break circular dependency
  const playSongInternalRef = useRef<(song: Song, q: Song[]) => void>(() => {});

  const handleSongEnd = useCallback(() => {
    const q = queueRef.current;
    const song = currentSongRef.current;
    const repeat = repeatModeRef.current;
    const shuffle = isShuffleRef.current;

    if (q.length === 0) return;

    if (repeat === "one" && song) {
      playSongInternalRef.current(song, q);
      return;
    }

    const currentIndex = song ? q.findIndex((s) => s.id === song.id) : -1;

    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * q.length);
      playSongInternalRef.current(q[nextIdx], q);
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < q.length) {
        playSongInternalRef.current(q[nextIndex], q);
      } else if (repeat === "all" && q.length > 0) {
        playSongInternalRef.current(q[0], q);
      }
    }
  }, []);

  const handleSongEndRef = useRef(handleSongEnd);
  useEffect(() => {
    handleSongEndRef.current = handleSongEnd;
  }, [handleSongEnd]);

  const initPlayer = useCallback(
    (videoId: string) => {
      if (!ytReady) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new window.YT.Player("yt-player", {
        height: "1",
        width: "1",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(e.target.getDuration());
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                setCurrentTime(e.target.getCurrentTime());
              }, 500);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
              // Call via ref so we always get the latest version
              handleSongEndRef.current();
            }
          },
        },
      });
    },
    [ytReady, volume],
  );

  const playSongInternal = useCallback(
    (song: Song, _q: Song[]) => {
      setCurrentSong(song);
      currentSongRef.current = song;
      setCurrentTime(0);
      clearInterval(intervalRef.current);
      if (ytReady) {
        initPlayer(song.videoId);
      } else {
        pendingSongRef.current = song;
      }
    },
    [ytReady, initPlayer],
  );

  // Keep playSongInternalRef in sync
  useEffect(() => {
    playSongInternalRef.current = playSongInternal;
  }, [playSongInternal]);

  useEffect(() => {
    if (ytReady && pendingSongRef.current) {
      initPlayer(pendingSongRef.current.videoId);
      pendingSongRef.current = null;
    }
  }, [ytReady, initPlayer]);

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      const q = newQueue || [song];
      setQueue(q);
      queueRef.current = q;
      playSongInternal(song, q);
    },
    [playSongInternal],
  );

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (playerRef.current) playerRef.current.setVolume(vol);
  }, []);

  const nextSong = useCallback(() => {
    const q = queueRef.current;
    const song = currentSongRef.current;
    const shuffle = isShuffleRef.current;
    if (!song || q.length === 0) return;
    const idx = q.findIndex((s) => s.id === song.id);
    const nextIdx = shuffle ? Math.floor(Math.random() * q.length) : idx + 1;
    if (nextIdx < q.length) playSongInternalRef.current(q[nextIdx], q);
  }, []);

  const prevSong = useCallback(() => {
    const q = queueRef.current;
    const song = currentSongRef.current;
    if (!song || q.length === 0) return;
    const idx = q.findIndex((s) => s.id === song.id);
    if (idx > 0) playSongInternalRef.current(q[idx - 1], q);
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "none" ? "all" : m === "all" ? "one" : "none"));
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((q) => {
      const newQ = [...q, song];
      queueRef.current = newQ;
      return newQ;
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        playSong,
        togglePlay,
        seekTo,
        setVolume,
        nextSong,
        prevSong,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
      }}
    >
      {children}
      <div
        id="yt-player"
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
