// src/app/context/ThemeContext.tsx
"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkTheme: () => void;
  setLightTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme === 'dark' || (savedTheme === null && prefersDark) 
      ? 'dark' 
      : 'light';
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', newTheme);
  };

  // Set theme to dark
  const setDarkTheme = () => {
    setTheme('dark');
    applyTheme('dark');
  };

  // Set theme to light
  const setLightTheme = () => {
    setTheme('light');
    applyTheme('light');
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Context value
  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setDarkTheme,
    setLightTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}