import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AddToPlaylistModal } from "./components/AddToPlaylistModal";
import { BottomNav } from "./components/BottomNav";
import { DeekBot } from "./components/DeekBot";
import { FloatingMiniPlayer } from "./components/FloatingMiniPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { ParticleBackground } from "./components/ParticleBackground";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import { AIMusicExpert } from "./components/pages/AIMusicExpert";
import { ExplorePage } from "./components/pages/ExplorePage";
import { FavoritesPage } from "./components/pages/FavoritesPage";
import { HomePage } from "./components/pages/HomePage";
import { LibraryPage } from "./components/pages/LibraryPage";
import { PlaylistsPage } from "./components/pages/PlaylistsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { TrendingPage } from "./components/pages/TrendingPage";

import {
  useAddRecentlyPlayed,
  useAddSearchHistory,
  useFavorites,
  useSearchYouTube,
  useToggleFavorite,
} from "./hooks/useQueries";
import type { ActivePage, Song } from "./types/music";

const queryClient = new QueryClient();

const FOOTER_LINKS = ["About", "Punjabi Music", "Legal", "Contact"];

function AppContent() {
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const { data: favorites = [], isLoading: favLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const addRecentlyPlayed = useAddRecentlyPlayed();
  const addSearchHistory = useAddSearchHistory();
  const player = usePlayer();
  const { currentSong } = player;

  const { isFetching: isSearching } = useSearchYouTube(searchQuery);

  // Keyboard shortcuts
  useKeyboardShortcuts(player);

  const addRecentRef = useRef(addRecentlyPlayed);
  addRecentRef.current = addRecentlyPlayed;
  const currentSongIdRef = useRef(currentSong?.id);
  // Track whether we've seen the first song (to show toast on song changes, including first)
  const hasHadSongRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracks song id changes
  useEffect(() => {
    if (currentSong && currentSong.id !== currentSongIdRef.current) {
      currentSongIdRef.current = currentSong.id;
      addRecentRef.current.mutate(currentSong);
      // Now Playing toast — show for every song change after app load
      if (hasHadSongRef.current) {
        toast(`🎵 Now Playing: ${currentSong.title}`, { duration: 3000 });
      }
      hasHadSongRef.current = true;
    }
  }, [currentSong?.id]);

  const handleToggleFavorite = async (song: Song) => {
    const isCurrentlyFav = favorites.some((f) => f.id === song.id);
    await toggleFavorite.mutateAsync(song);
    toast.success(
      isCurrentlyFav ? "Removed from favorites" : "Added to favorites! ❤️",
    );
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setActivePage("explore");
      addSearchHistory.mutate(q);
    }
  };

  return (
    <div
      className="min-h-[100dvh] md:min-h-screen flex md:items-center md:justify-center md:p-4"
      style={{ background: "#0B0F14" }}
    >
      <ParticleBackground />
      <div
        className="relative z-10 w-full md:max-w-screen-2xl flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100vh-2rem)] md:rounded-[20px] md:border"
        style={{
          background: "linear-gradient(135deg, #141A22, #10151C)",
          borderColor: "rgba(42,52,65,0.6)",
          boxShadow:
            "0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(35,230,226,0.05)",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: desktop only */}
          <Sidebar activePage={activePage} onNavigate={setActivePage} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <TopHeader
              onSearch={handleSearch}
              isSearching={isSearching}
              searchQuery={searchQuery}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {activePage === "home" && (
                  <HomePage
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                    onNavigateToPlaylists={() => setActivePage("playlists")}
                  />
                )}
                {activePage === "explore" && (
                  <ExplorePage
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                  />
                )}
                {activePage === "library" && (
                  <LibraryPage
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                  />
                )}
                {activePage === "playlists" && (
                  <PlaylistsPage
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
                {activePage === "favorites" && (
                  <FavoritesPage
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                    isLoading={favLoading}
                  />
                )}
                {activePage === "trending" && (
                  <TrendingPage
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                  />
                )}
                {activePage === "ai-expert" && (
                  <AIMusicExpert
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlaylist={setAddToPlaylistSong}
                  />
                )}
                {activePage === "settings" && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <MiniPlayer />

        {/* Footer: desktop only */}
        <div
          className="hidden md:flex items-center justify-between px-6 py-3 text-xs"
          style={{
            borderTop: "1px solid rgba(42,52,65,0.4)",
            color: "#9AA6B2",
            background: "rgba(11,15,20,0.5)",
          }}
        >
          <div>
            <span className="gradient-text font-bold">Deeksplay</span>
            <span className="mx-2">·</span>
            <span>Futuristic Streaming</span>
          </div>
          <div className="flex gap-4">
            {FOOTER_LINKS.map((label) => (
              <button
                key={label}
                type="button"
                className="hover:text-white transition-colors"
                style={{ color: "#9AA6B2" }}
              >
                {label}
              </button>
            ))}
          </div>
          <span>
            Made by <span style={{ color: "#FF4FD8" }}>Deepak Katal</span> from
            Punjab ❤️
          </span>
        </div>
      </div>

      {/* Bottom nav: mobile only, fixed */}
      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      {/* Floating mini player widget */}
      <FloatingMiniPlayer />

      <AddToPlaylistModal
        song={addToPlaylistSong}
        onClose={() => setAddToPlaylistSong(null)}
      />
      <DeekBot />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
