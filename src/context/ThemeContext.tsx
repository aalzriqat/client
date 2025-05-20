import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define the theme names as a union type for better type safety
export type ThemeName = 
  | "focused-elegance-light" 
  | "focused-elegance-dark"
  | "aurora-flow-light"
  | "aurora-flow-dark"
  | "warm-focus-light"
  | "warm-focus-dark"
  | "tech-minimalist-light"
  | "tech-minimalist-dark"
  | "chrono-weave-dark"; // Add more as they are defined

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: { name: string; value: ThemeName }[];
}

const LS_THEME_KEY = 'app-theme';

const defaultTheme: ThemeName = 'focused-elegance-light'; // Your application's default theme

export const availableThemes: { name: string; value: ThemeName }[] = [
  { name: "Focused Elegance (Light)", value: "focused-elegance-light" },
  { name: "Focused Elegance (Dark)", value: "focused-elegance-dark" },
  { name: "Aurora Flow (Light)", value: "aurora-flow-light" },
  { name: "Aurora Flow (Dark)", value: "aurora-flow-dark" },
  { name: "Warm Focus (Light)", value: "warm-focus-light" },
  { name: "Warm Focus (Dark)", value: "warm-focus-dark" },
  { name: "Tech Minimalist (Light)", value: "tech-minimalist-light" },
  { name: "Tech Minimalist (Dark)", value: "tech-minimalist-dark" },
  { name: "ChronoWeave (Dark)", value: "chrono-weave-dark" },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const storedTheme = localStorage.getItem(LS_THEME_KEY) as ThemeName | null;
    // Check if storedTheme is a valid ThemeName
    if (storedTheme && availableThemes.some(t => t.value === storedTheme)) {
      return storedTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    // Apply the theme to the document root
    // If the default theme is "focused-elegance-light", we might not need to set an attribute
    // or set it explicitly if your CSS relies on it.
    // For this setup, we'll always set the attribute.
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};