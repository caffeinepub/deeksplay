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
  const keepaliveIntervalRef = useRef<any>(null);
  const pendingSongRef = useRef<Song | null>(null);
  // The silent audio DOM element ref — attached directly to JSX below
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);

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
    durationRef.current = duration;
  }, [duration]);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // ─── Start silent audio (call after user gesture) ─────────────────────────
  // Uses /silence.wav — a proper 3-second looping WAV file.
  // This is what makes Android recognize the app as a media player.
  const startSilentAudio = useCallback(() => {
    const audio = silentAudioRef.current;
    if (!audio) return;
    audio.volume = 0.01; // low but non-zero — Android ignores volume=0 sources
    audio.play().catch(() => {});
  }, []);

  // ─── Screen Wake Lock ─────────────────────────────────────────────────────
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

  // ─── Periodic keepalive — every 5s ensure silent audio is still playing ───
  // Android can kill audio contexts silently; this revives them.
  const startKeepalive = useCallback(() => {
    clearInterval(keepaliveIntervalRef.current);
    keepaliveIntervalRef.current = setInterval(() => {
      const audio = silentAudioRef.current;
      if (audio?.paused && isPlayingRef.current) {
        audio.play().catch(() => {});
      }
    }, 5000);
  }, []);

  const stopKeepalive = useCallback(() => {
    clearInterval(keepaliveIntervalRef.current);
  }, []);

  // ─── Visibility change: re-acquire wake lock & resume silent audio ─────────
  // NEVER pause on visibility hidden — only resume when visible.
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible" && isPlayingRef.current) {
        await requestWakeLock();
        startSilentAudio();
        try {
          playerRef.current?.playVideo();
        } catch (_e) {}
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "playing";
      }
      // Intentionally do nothing when hidden — don't pause anything
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [requestWakeLock, startSilentAudio]);

  // ─── YouTube IFrame API load ───────────────────────────────────────────────
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

  // ─── Media Session API ────────────────────────────────────────────────────
  // Sets notification shade controls on Android.
  // Must be called AFTER silent audio has started playing.
  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist || "Deeksplay",
      album: "Deeksplay",
      artwork: [
        { src: currentSong.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: currentSong.thumbnail, sizes: "128x128", type: "image/jpeg" },
        { src: currentSong.thumbnail, sizes: "192x192", type: "image/jpeg" },
        { src: currentSong.thumbnail, sizes: "256x256", type: "image/jpeg" },
        { src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      playerRef.current?.playVideo();
      startSilentAudio();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      playerRef.current?.pauseVideo();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      nextSongRef.current(),
    );
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      prevSongRef.current(),
    );
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) {
        playerRef.current?.seekTo(details.seekTime, true);
        setCurrentTime(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skip = details.seekOffset ?? 10;
      const t = Math.min(currentTimeRef.current + skip, durationRef.current);
      playerRef.current?.seekTo(t, true);
      setCurrentTime(t);
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skip = details.seekOffset ?? 10;
      const t = Math.max(currentTimeRef.current - skip, 0);
      playerRef.current?.seekTo(t, true);
      setCurrentTime(t);
    });
  }, [currentSong, startSilentAudio]);

  // Update Media Session position state so seek bar in notification works
  useEffect(() => {
    if (!("mediaSession" in navigator) || !isPlaying || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    } catch (_e) {}
  }, [currentTime, duration, isPlaying]);

  // ─── Song end handler ─────────────────────────────────────────────────────
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

  // ─── YouTube Player init ──────────────────────────────────────────────────
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
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setIsPlaying(true);
            startSilentAudio();
            startKeepalive();
            requestWakeLock();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const dur = e.target.getDuration();
              setDuration(dur);
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                setCurrentTime(e.target.getCurrentTime());
              }, 500);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "playing";
              startSilentAudio();
              startKeepalive();
              requestWakeLock();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "paused";
              stopKeepalive();
              releaseWakeLock();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "none";
              stopKeepalive();
              releaseWakeLock();
              handleSongEndRef.current();
            }
          },
        },
      });
    },
    [
      ytReady,
      volume,
      requestWakeLock,
      releaseWakeLock,
      startSilentAudio,
      startKeepalive,
      stopKeepalive,
    ],
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
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
      startSilentAudio();
    }
  }, [isPlaying, startSilentAudio]);

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
      stopKeepalive();
      releaseWakeLock();
    };
  }, [releaseWakeLock, stopKeepalive]);

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
      {/* Hidden YouTube player */}
      <div
        id="yt-player"
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {/*
        Silent audio element in the DOM — this is the KEY to Android notification
        controls and background playback. Android requires an <audio> element
        actively playing to show Media Session controls in the notification shade.
        /silence.wav is a proper 3-second looping WAV file (not a data URI).
      */}
      {/* biome-ignore lint/a11y/useMediaCaption: silent background audio, no captions needed */}
      <audio
        ref={silentAudioRef}
        src="/silence.wav"
        loop
        playsInline
        style={{ display: "none" }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
