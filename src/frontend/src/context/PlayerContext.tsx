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

const SILENT_AUDIO_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

function startWebAudioKeepalive(): () => void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.00001;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    return () => {
      try {
        oscillator.stop();
        ctx.close();
      } catch (_e) {}
    };
  } catch (_e) {
    return () => {};
  }
}

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
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const webAudioCleanupRef = useRef<(() => void) | null>(null);
  const wakeLockRef = useRef<any>(null);

  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const repeatModeRef = useRef<"none" | "all" | "one">("none");
  const isShuffleRef = useRef(false);

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
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = new Audio(SILENT_AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.001;
    silentAudioRef.current = audio;
    return () => {
      audio.pause();
      silentAudioRef.current = null;
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request(
          "screen",
        );
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch (_e) {}
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (_e) {}
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        if (isPlayingRef.current && playerRef.current) {
          try {
            playerRef.current.playVideo();
          } catch (_e) {}
        }
        if (isPlayingRef.current) await requestWakeLock();
        silentAudioRef.current?.play().catch(() => {});
        if (isPlayingRef.current && !webAudioCleanupRef.current) {
          webAudioCleanupRef.current = startWebAudioKeepalive();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [requestWakeLock]);

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

  const playSongInternalRef = useRef<(song: Song, q: Song[]) => void>(() => {});
  const nextSongRef = useRef<() => void>(() => {});
  const prevSongRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist || "Deeksplay",
      artwork: [
        { src: currentSong.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: currentSong.thumbnail, sizes: "128x128", type: "image/jpeg" },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () =>
      playerRef.current?.playVideo(),
    );
    navigator.mediaSession.setActionHandler("pause", () =>
      playerRef.current?.pauseVideo(),
    );
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      nextSongRef.current(),
    );
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      prevSongRef.current(),
    );
  }, [currentSong]);

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
      playSongInternalRef.current(q[Math.floor(Math.random() * q.length)], q);
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < q.length) playSongInternalRef.current(q[nextIndex], q);
      else if (repeat === "all" && q.length > 0)
        playSongInternalRef.current(q[0], q);
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
            silentAudioRef.current?.play().catch(() => {});
            if (webAudioCleanupRef.current) webAudioCleanupRef.current();
            webAudioCleanupRef.current = startWebAudioKeepalive();
            requestWakeLock();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(e.target.getDuration());
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(
                () => setCurrentTime(e.target.getCurrentTime()),
                500,
              );
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "playing";
              silentAudioRef.current?.play().catch(() => {});
              if (!webAudioCleanupRef.current)
                webAudioCleanupRef.current = startWebAudioKeepalive();
              requestWakeLock();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "paused";
              releaseWakeLock();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "none";
              releaseWakeLock();
              handleSongEndRef.current();
            }
          },
        },
      });
    },
    [ytReady, volume, requestWakeLock, releaseWakeLock],
  );

  const playSongInternal = useCallback(
    (song: Song, _q: Song[]) => {
      setCurrentSong(song);
      currentSongRef.current = song;
      setCurrentTime(0);
      clearInterval(intervalRef.current);
      if (ytReady) initPlayer(song.videoId);
      else pendingSongRef.current = song;
    },
    [ytReady, initPlayer],
  );

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
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
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

  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [nextSong]);
  useEffect(() => {
    prevSongRef.current = prevSong;
  }, [prevSong]);

  useEffect(() => {
    return () => {
      if (webAudioCleanupRef.current) webAudioCleanupRef.current();
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

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
