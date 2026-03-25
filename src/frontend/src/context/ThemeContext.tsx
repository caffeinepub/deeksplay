import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ThemeName = "neon-cyan" | "neon-purple" | "neon-gold" | "neon-rose";

export const THEMES: Record<
  ThemeName,
  { label: string; color: string; glow: string }
> = {
  "neon-cyan": {
    label: "Cyan",
    color: "#23E6E2",
    glow: "rgba(35,230,226,0.4)",
  },
  "neon-purple": {
    label: "Purple",
    color: "#8A5CFF",
    glow: "rgba(138,92,255,0.4)",
  },
  "neon-gold": { label: "Gold", color: "#FFB800", glow: "rgba(255,184,0,0.4)" },
  "neon-rose": {
    label: "Rose",
    color: "#FF4FD8",
    glow: "rgba(255,79,216,0.4)",
  },
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  accent: string;
  accentGlow: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "neon-cyan",
  setTheme: () => {},
  accent: "#23E6E2",
  accentGlow: "rgba(35,230,226,0.4)",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("deeksplay_theme") as ThemeName | null;
    return saved && THEMES[saved] ? saved : "neon-cyan";
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("deeksplay_theme", t);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", THEMES[theme].color);
    document.documentElement.style.setProperty(
      "--accent-glow",
      THEMES[theme].glow,
    );
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accent: THEMES[theme].color,
        accentGlow: THEMES[theme].glow,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
