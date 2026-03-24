import {
  Bot,
  ChevronDown,
  Compass,
  Flame,
  Heart,
  Home,
  Library,
  ListMusic,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ActivePage } from "../types/music";

const staticPlaylists = [
  { name: "Techno Vibes", color: "#23E6E2" },
  { name: "Chill Lo-fi", color: "#8A5CFF" },
  { name: "Punjab Beats", color: "#FF4FD8" },
  { name: "Indie Rock", color: "#FFB347" },
];

const navItems = [
  { id: "home" as ActivePage, label: "Home", icon: Home },
  {
    id: "trending" as ActivePage,
    label: "Trending",
    icon: Flame,
    color: "#FF4FD8",
  },
  { id: "explore" as ActivePage, label: "Explore", icon: Compass },
  { id: "library" as ActivePage, label: "Your Library", icon: Library },
  { id: "playlists" as ActivePage, label: "Playlists", icon: ListMusic },
  { id: "favorites" as ActivePage, label: "Favorites", icon: Heart },
  {
    id: "ai-expert" as ActivePage,
    label: "AI Music Expert",
    icon: Bot,
    color: "#8A5CFF",
    badge: "AI",
  },
];

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [playlistsOpen, setPlaylistsOpen] = useState(true);

  return (
    <aside
      className="hidden md:flex w-64 flex-shrink-0 flex-col h-full"
      style={{
        background: "#111720",
        borderRight: "1px solid rgba(42,52,65,0.6)",
      }}
    >
      {/* Brand */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, #23E6E2, #8A5CFF, #FF4FD8)",
                padding: "2px",
              }}
            >
              <div
                className="w-full h-full rounded-md flex items-center justify-center"
                style={{ background: "#111720" }}
              >
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "8px solid #23E6E2",
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight gradient-text">
              Deeksplay
            </h1>
            <p className="text-xs" style={{ color: "#9AA6B2" }}>
              Futuristic Streaming
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p
          className="text-xs font-semibold px-3 py-2 uppercase tracking-widest"
          style={{ color: "#9AA6B2" }}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const activeColor = item.color || "#23E6E2";
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ x: 4 }}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive ? "active-nav" : "hover:bg-white/5"
              }`}
              style={{ color: isActive ? activeColor : "#9AA6B2" }}
            >
              <Icon size={18} />
              {item.label}
              {item.badge && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(138,92,255,0.2)",
                    color: "#8A5CFF",
                    border: "1px solid rgba(138,92,255,0.4)",
                  }}
                >
                  {item.badge}
                </span>
              )}
              {item.id === "playlists" && !item.badge && (
                <ChevronDown
                  size={14}
                  className="ml-auto transition-transform"
                  style={{
                    transform: playlistsOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaylistsOpen(!playlistsOpen);
                  }}
                />
              )}
            </motion.button>
          );
        })}

        {/* Playlists */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 py-2">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#9AA6B2" }}
            >
              Your Playlists
            </p>
            <button
              type="button"
              data-ocid="playlist.open_modal_button"
              onClick={() => onNavigate("playlists")}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(35,230,226,0.15)",
                border: "1px solid rgba(35,230,226,0.4)",
                color: "#23E6E2",
              }}
            >
              <Plus size={12} />
            </button>
          </div>
          {playlistsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              {staticPlaylists.map((pl, i) => (
                <motion.button
                  key={pl.name}
                  type="button"
                  whileHover={{ x: 4 }}
                  onClick={() => onNavigate("playlists")}
                  data-ocid={`sidebar.playlist.item.${i + 1}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-all"
                  style={{ color: "#9AA6B2" }}
                >
                  <div
                    className="w-7 h-7 rounded flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${pl.color}40, ${pl.color}80)`,
                      border: `1px solid ${pl.color}60`,
                    }}
                  />
                  <span className="truncate text-left">{pl.name}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "rgba(42,52,65,0.6)" }}
      >
        <p className="text-xs text-center" style={{ color: "#9AA6B2" }}>
          Made by <span style={{ color: "#FF4FD8" }}>Deepak Katal</span> from
          Punjab ❤️
        </p>
      </div>
    </aside>
  );
}
