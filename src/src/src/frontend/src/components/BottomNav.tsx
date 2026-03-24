import { Compass, Heart, Home, Library, ListMusic } from "lucide-react";
import { motion } from "motion/react";
import type { ActivePage } from "../types/music";

const navItems = [
  { id: "home" as ActivePage, label: "Home", icon: Home },
  { id: "explore" as ActivePage, label: "Explore", icon: Compass },
  { id: "library" as ActivePage, label: "Library", icon: Library },
  { id: "playlists" as ActivePage, label: "Playlists", icon: ListMusic },
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
                style={{ background: "#23E6E2" }}
              />
            )}
            <Icon
              size={20}
              style={{ color: isActive ? "#23E6E2" : "#9AA6B2" }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? "#23E6E2" : "#9AA6B2" }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
