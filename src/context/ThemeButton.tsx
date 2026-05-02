"use client";
import { useMyTheme } from "./ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeBtn() {
  const { theme, toggleTheme } = useMyTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-transparent ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </button>
  );
}