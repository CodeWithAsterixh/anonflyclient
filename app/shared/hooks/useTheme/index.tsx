import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark";
export type ColorScheme =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "orange"
  | "pink";

export const colorSchemes: Record<
  ColorScheme,
  { name: string; light: string; dark: string; primary: string }
> = {
  purple: {
    name: "Purple",
    light: "#7C3AED", // Violet 600 (~4.5:1)
    dark: "#8B5CF6",
    primary: "#7C3AED",
  },
  blue: {
    name: "Blue",
    light: "#2563EB", // Blue 600 (~4.6:1)
    dark: "#60a5fa",
    primary: "#2563EB",
  },
  green: {
    name: "Green",
    light: "#15803D", // Green 700 (~4.9:1)
    dark: "#4ade80",
    primary: "#15803D",
  },
  red: {
    name: "Red",
    light: "#DC2626", // Red 600 (~4.5:1)
    dark: "#f87171",
    primary: "#DC2626",
  },
  orange: {
    name: "Orange",
    light: "#C2410C", // Orange 700 (~4.8:1)
    dark: "#fb923c",
    primary: "#C2410C",
  },
  pink: {
    name: "Pink",
    light: "#DB2777", // Pink 600 (~4.5:1)
    dark: "#f472b6",
    primary: "#DB2777",
  },
};

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (themeState: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: Theme;
  initialColorScheme?: ColorScheme;
}> = ({ children, initialTheme, initialColorScheme }) => {
  const [themeState, setThemeState] = useState<Theme>(() => {
    // 1. Priority: Initial themeState from SSR (via cookies)
    if (initialTheme) return initialTheme;

    // 2. Client-side fallback: Local storage or system preference
    if (globalThis.window !== undefined) {
      const savedTheme =
        (Cookies.get("themeState") as Theme) ||
        (localStorage.getItem("themeState") as Theme);
      if (savedTheme) return savedTheme;
      // Default to dark for anonymity and focus
      return "dark";
    }
    return "dark";
  });

  const [colorSchemeState, setColorSchemeState] = useState<ColorScheme>(() => {
    if (initialColorScheme) return initialColorScheme;
    if (globalThis.window !== undefined) {
      const savedScheme =
        (Cookies.get("colorScheme") as ColorScheme) ||
        (localStorage.getItem("colorScheme") as ColorScheme);
      if (savedScheme && colorSchemes[savedScheme]) return savedScheme;
    }
    return "purple";
  });

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const root = globalThis.window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(themeState);

      // Persist in both cookie (for SSR) and localStorage (for backup)
      localStorage.setItem("themeState", themeState);
      Cookies.set("themeState", themeState, { expires: 365, path: "/" });
    }
  }, [themeState]);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const root = globalThis.window.document.documentElement;
      const scheme = colorSchemes[colorSchemeState];
      const primaryColor = themeState === "dark" ? scheme.dark : scheme.light;

      root.style.setProperty("--primary-color", primaryColor);
      const primaryRgb = hexToRgb(primaryColor);
      root.style.setProperty("--primary-color-rgb", primaryRgb);

      // Calculate blended background, muted, and border colors
      const bgColor =
        themeState === "dark"
          ? blendColors("#050508", primaryColor, 0.04)
          : blendColors("#FFFFFF", primaryColor, 0.02);

      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", bgColor);

      const mutedColor =
        themeState === "dark"
          ? blendColors(bgColor, "#FFFFFF", 0.12) // More distinct card background on dark
          : blendColors(bgColor, "#000000", 0.08); // More distinct card background on light

      const borderColor =
        themeState === "dark"
          ? blendColors(bgColor, "#FFFFFF", 0.2) // More prominent border
          : blendColors(bgColor, "#000000", 0.15); // More prominent border

      const fgColor = themeState === "dark" ? "#F9FAFB" : "#111827"; // Brighter white for dark mode
      const mutedFgColor = themeState === "dark" ? "#D1D5DB" : "#374151"; // Much higher contrast for muted text

      root.style.setProperty("--background", bgColor);
      root.style.setProperty("--muted", mutedColor);
      root.style.setProperty("--border", borderColor);
      root.style.setProperty("--foreground", fgColor);
      root.style.setProperty("--muted-foreground", mutedFgColor);

      localStorage.setItem("colorScheme", colorSchemeState);
      Cookies.set("colorScheme", colorSchemeState, { expires: 365, path: "/" });
    }
  }, [colorSchemeState, themeState]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
  }, []);

  const value = useMemo(
    () => ({
      theme: themeState,
      colorScheme: colorSchemeState,
      toggleTheme,
      setTheme,
      setColorScheme,
    }),
    [themeState, colorSchemeState, toggleTheme, setTheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

function blendColors(baseHex: string, blendHex: string, weight: number) {
  const base = hexToRgbValues(baseHex);
  const blend = hexToRgbValues(blendHex);

  const r = Math.round(base.r * (1 - weight) + blend.r * weight);
  const g = Math.round(base.g * (1 - weight) + blend.g * weight);
  const b = Math.round(base.b * (1 - weight) + blend.b * weight);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgbValues(color: string) {
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return {
        r: Number.parseInt(matches[0], 10),
        g: Number.parseInt(matches[1], 10),
        b: Number.parseInt(matches[2], 10),
      };
    }
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

function hexToRgb(hex: string) {
  const rgb = hexToRgbValues(hex);
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
