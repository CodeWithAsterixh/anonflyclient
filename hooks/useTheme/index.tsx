import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (themeState: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: Theme }> = ({ 
  children, 
  initialTheme 
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

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value = useMemo(() => ({
    theme: themeState,
    toggleTheme,
    setTheme
  }), [themeState, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
