"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "light"
  | "deep-water"
  | "dark-deep-water"
  | "clear-water"
  | "green-water";

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "light",          label: "Light",           swatch: "#0B4F6C" },
  { id: "deep-water",     label: "Deep Water",      swatch: "#071e2e" },
  { id: "dark-deep-water",label: "Dark Deep Water", swatch: "#030f18" },
  { id: "clear-water",    label: "Clear Water",     swatch: "#00acc1" },
  { id: "green-water",    label: "Green Water",     swatch: "#2e7d32" },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("light");

  useEffect(() => {
    const stored = localStorage.getItem("orcalog_theme") as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  function setTheme(t: ThemeId) {
    setThemeState(t);
    localStorage.setItem("orcalog_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
