import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';

export const colorSchemes: Record<ColorScheme, { name: string; light: string; dark: string; primary: string }> = {
  blue: {
    name: 'Blue',
    light: '#3b82f6',
    dark: '#60a5fa',
    primary: '#3b82f6',
  },
  green: {
    name: 'Green',
    light: '#22c55e',
    dark: '#4ade80',
    primary: '#22c55e',
  },
  purple: {
    name: 'Purple',
    light: '#a855f7',
    dark: '#c084fc',
    primary: '#a855f7',
  },
  red: {
    name: 'Red',
    light: '#ef4444',
    dark: '#f87171',
    primary: '#ef4444',
  },
  orange: {
    name: 'Orange',
    light: '#f97316',
    dark: '#fb923c',
    primary: '#f97316',
  },
  pink: {
    name: 'Pink',
    light: '#ec4899',
    dark: '#f472b6',
    primary: '#ec4899',
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

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: Theme; initialColorScheme?: ColorScheme }> = ({ 
  children, 
  initialTheme,
  initialColorScheme
}) => {
  const [themeState, setThemeState] = useState<Theme>(() => {
    // 1. Priority: Initial themeState from SSR (via cookies)
    if (initialTheme) return initialTheme;

    // 2. Client-side fallback: Local storage or system preference
    if (globalThis.window !== undefined) {
      const savedTheme = Cookies.get('themeState') as Theme || localStorage.getItem('themeState') as Theme;
      if (savedTheme) return savedTheme;
      return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [colorSchemeState, setColorSchemeState] = useState<ColorScheme>(() => {
    if (initialColorScheme) return initialColorScheme;
    if (globalThis.window !== undefined) {
      const savedScheme = Cookies.get('colorScheme') as ColorScheme || localStorage.getItem('colorScheme') as ColorScheme;
      if (savedScheme && colorSchemes[savedScheme]) return savedScheme;
    }
    return 'blue';
  });

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const root = globalThis.window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(themeState);
      
      // Persist in both cookie (for SSR) and localStorage (for backup)
      localStorage.setItem('themeState', themeState);
      Cookies.set('themeState', themeState, { expires: 365, path: '/' });
      
      // Update body background to prevent flashes
      document.body.style.backgroundColor = themeState === 'dark' ? '#030712' : '#ffffff';
    }
  }, [themeState]);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const root = globalThis.window.document.documentElement;
      const scheme = colorSchemes[colorSchemeState];
      const primaryColor = themeState === 'dark' ? scheme.dark : scheme.light;
      
      root.style.setProperty('--primary-color', primaryColor);
      root.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
      
      localStorage.setItem('colorScheme', colorSchemeState);
      Cookies.set('colorScheme', colorSchemeState, { expires: 365, path: '/' });
    }
  }, [colorSchemeState, themeState]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
  }, []);

  const value = useMemo(() => ({
    theme: themeState,
    colorScheme: colorSchemeState,
    toggleTheme,
    setTheme,
    setColorScheme
  }), [themeState, colorSchemeState, toggleTheme, setTheme, setColorScheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}` : 
    '59, 130, 246';
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
