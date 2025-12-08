"use client";

import { Bell, Search } from "lucide-react";

interface TopBarProps {
  pageTitle?: string;
  onSearch?: (query: string) => void;
  userInitial?: string;
}

export default function TopBar({
  pageTitle = "Dashboard",
  onSearch,
  userInitial = "A",
}: TopBarProps) {
  return (
    <header className="h-16 px-8 border-b border-second/40 dark:border-second/30 bg-white dark:bg-transparent dark:backdrop-blur-md shadow-sm flex items-center justify-between">
      {/* LEFT – PAGE TITLE */}
      <h1 className="text-xl font-bold text-first dark:text-fourth">
        {pageTitle}
      </h1>

      {/* RIGHT – SEARCH + BELL + AVATAR */}
      <div className="flex items-center gap-6">
        {/* SEARCH BAR */}
        <div className="relative">
          <input
            className="
              pl-10 pr-4 py-2 rounded-lg text-sm w-56
              bg-second/10 dark:bg-second/20
              border border-second/40 dark:border-second/30
              text-first dark:text-fourth
              placeholder:text-second dark:placeholder:text-fourth/40
              focus:outline-none focus:ring-2 focus:ring-third transition
            "
            placeholder="Tìm kiếm..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-second dark:text-fourth/60" />
        </div>

        {/* NOTIFICATION */}
        <button className="relative p-2 rounded-lg hover:bg-second/20 dark:hover:bg-second/30 transition">
          <Bell className="w-5 h-5 text-first dark:text-fourth" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* USER AVATAR */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-third to-third/80 text-first font-bold flex items-center justify-center cursor-pointer hover:shadow-md transition">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
