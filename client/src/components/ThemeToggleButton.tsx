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
        bg-white dark:bg-darkblue text-foreground]
        flex items-center justify-center
        shadow-md hover:shadow-lg hover:bg-[var(--hex-hover-gray-static)]/50 dark:hover:bg-[var(--hex-white-static)]/10
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





