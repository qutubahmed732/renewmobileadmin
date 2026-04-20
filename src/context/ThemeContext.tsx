"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext<any>(undefined);

export function ThemeProvider({ children }:any) {
  const [theme, setTheme] = useState("light");

  // Jab theme change ho, toh body par class toggle karein
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useMyTheme = () => useContext(ThemeContext);