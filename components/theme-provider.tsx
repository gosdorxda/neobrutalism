"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export const themes = [
  { id: "original", label: "Original", bg: "oklch(95.38% 0.0357 72.89)", main: "oklch(72.27% 0.1894 50.19)" },
  { id: "mint", label: "Mint", bg: "oklch(95.5% 0.025 155)", main: "oklch(70% 0.16 165)" },
  { id: "lavender", label: "Lavender", bg: "oklch(95.5% 0.025 290)", main: "oklch(68% 0.18 290)" },
  { id: "lemon", label: "Lemon", bg: "oklch(96% 0.03 95)", main: "oklch(76% 0.17 85)" },
] as const;

export type Theme = (typeof themes)[number]["id"];

const THEME_CLASS_PREFIX = "theme-";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const t of themes) {
    root.classList.remove(`${THEME_CLASS_PREFIX}${t.id}`);
  }
  root.classList.add(`${THEME_CLASS_PREFIX}${theme}`);
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "original",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme = "original",
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
