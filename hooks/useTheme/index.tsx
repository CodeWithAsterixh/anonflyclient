import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';

export const colorSchemes: Record<ColorScheme, { name: string; light: string; dark: string; primary: string }> = {
  purple: {
    name: 'Purple',
    light: '#8B5CF6', // Vibrant Purple (Violet 500)
    dark: '#6B4EFF',
    primary: '#6B4EFF',
  },
  blue: {
    name: 'Blue',
    light: '#2563EB', // Vibrant Blue (Blue 600)
    dark: '#60a5fa',
    primary: '#3b82f6',
  },
  green: {
    name: 'Green',
    light: '#16A34A', // Vibrant Green (Green 600)
    dark: '#4ade80',
    primary: '#22c55e',
  },
  red: {
    name: 'Red',
    light: '#DC2626', // Vibrant Red (Red 600)
    dark: '#f87171',
    primary: '#ef4444',
  },
  orange: {
    name: 'Orange',
    light: '#EA580C', // Vibrant Orange (Orange 600)
    dark: '#fb923c',
    primary: '#f97316',
  },
  pink: {
    name: 'Pink',
    light: '#DB2777', // Vibrant Pink (Pink 600)
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
      // Default to dark for anonymity and focus
      return 'dark';
    }
    return 'dark';
  });

  const [colorSchemeState, setColorSchemeState] = useState<ColorScheme>(() => {
    if (initialColorScheme) return initialColorScheme;
    if (globalThis.window !== undefined) {
      const savedScheme = Cookies.get('colorScheme') as ColorScheme || localStorage.getItem('colorScheme') as ColorScheme;
      if (savedScheme && colorSchemes[savedScheme]) return savedScheme;
    }
    return 'purple';
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
      document.body.style.backgroundColor = themeState === 'dark' ? '#0B0B0F' : '#ffffff';
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
