import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: Theme }> = ({ 
  children, 
  initialTheme 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Priority: Initial theme from SSR (via cookies)
    if (initialTheme) return initialTheme;

    // 2. Client-side fallback: Local storage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = Cookies.get('theme') as Theme || localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Persist in both cookie (for SSR) and localStorage (for backup)
      localStorage.setItem('theme', theme);
      Cookies.set('theme', theme, { expires: 365, path: '/' });
      
      // Update body background to prevent flashes
      document.body.style.backgroundColor = theme === 'dark' ? '#030712' : '#ffffff';
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
