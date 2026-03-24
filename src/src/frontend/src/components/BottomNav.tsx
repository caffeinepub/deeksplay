import {
  Bot,
  Compass,
  Flame,
  Heart,
  Home,
  Library,
  ListMusic,
} from "lucide-react";
import { motion } from "motion/react";
import type { ActivePage } from "../types/music";

const navItems = [
  { id: "home" as ActivePage, label: "Home", icon: Home },
  { id: "trending" as ActivePage, label: "Trending", icon: Flame },
  { id: "explore" as ActivePage, label: "Explore", icon: Compass },
  { id: "ai-expert" as ActivePage, label: "AI", icon: Bot },
  { id: "favorites" as ActivePage, label: "Favorites", icon: Heart },
];

interface BottomNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-14"
      style={{
        background: "rgba(17,23,32,0.97)",
        borderTop: "1px solid rgba(35,230,226,0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        const isAI = item.id === "ai-expert";
        return (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => onNavigate(item.id)}
            data-ocid={`bottom_nav.${item.id}.link`}
            className="flex flex-col items-center justify-center gap-0.5 w-14 h-full relative"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: isAI ? "#8A5CFF" : "#23E6E2" }}
              />
            )}
            {isAI ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #8A5CFF, #FF4FD8)"
                    : "transparent",
                }}
              >
                <Icon
                  size={16}
                  style={{ color: isActive ? "white" : "#9AA6B2" }}
                />
              </div>
            ) : (
              <Icon
                size={20}
                style={{
                  color: isActive
                    ? item.id === "trending"
                      ? "#FF4FD8"
                      : "#23E6E2"
                    : "#9AA6B2",
                }}
              />
            )}
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive
                  ? isAI
                    ? "#8A5CFF"
                    : item.id === "trending"
                      ? "#FF4FD8"
                      : "#23E6E2"
                  : "#9AA6B2",
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
