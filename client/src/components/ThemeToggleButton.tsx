"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-third text-first
        flex items-center justify-center
        shadow-md hover:shadow-lg hover:bg-third/90
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
