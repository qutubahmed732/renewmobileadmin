"use client";
import { useMyTheme } from "./ThemeContext";

export default function ThemeBtn() {
  const { theme, toggleTheme } = useMyTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 border rounded-md bg-primary text-secondary"
    >
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}