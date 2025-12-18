"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed bottom-4 right-4 z-50
        w-10 h-10 rounded-full
        bg-white text-first
        flex items-center justify-center
        shadow-md hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10
        transition active:scale-95 font-bold
      "
      aria-label="Chuyển đổi chế độ sáng/tối"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
