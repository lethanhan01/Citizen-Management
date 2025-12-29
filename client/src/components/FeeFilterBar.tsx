"use client";

import { Search } from "lucide-react";

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  sortBy: "status" | "date" | "name";
  setSortBy: (v: "status" | "date" | "name") => void;

  filterStatus: "paid" | "pending" | "all"; // Nghiệp vụ thu phí
  setFilterStatus: (v: "paid" | "pending" | "all") => void;

  resetPage: () => void; 
};

export default function FeeFilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterStatus,
  setFilterStatus,
  resetPage,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* 1. Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Tìm theo mã hộ, tên chủ hộ, CCCD..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="
            w-full pl-10 pr-4 py-2.5 rounded-lg
            bg-white dark:bg-transparent dark:border
            border border-second/40 dark:border-second/30
            text-first dark:text-darkmodetext
            placeholder:text-second dark:placeholder:text-darkmodetext/40
            focus:outline-none focus:ring-1 focus:ring-selectring transition
          "
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-second dark:text-darkmodetext/60" />
      </div>

      {/* 2. Filter Buttons */}
      <div className="flex gap-2 border border-second/40 dark:border-second/30 rounded-lg p-1 bg-white dark:bg-transparent">
        <button
          onClick={() => { setFilterStatus("all"); resetPage(); }}
          className={`px-3 py-1 rounded text-sm transition ${filterStatus === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted/10 text-foreground"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => { setFilterStatus("paid"); resetPage(); }}
          className={`px-3 py-1 rounded text-sm transition ${filterStatus === "paid" ? "bg-green-600 text-white" : "hover:bg-muted/10 text-foreground"}`}
        >
          Đã thu
        </button>
        <button
          onClick={() => { setFilterStatus("pending"); resetPage(); }}
          className={`px-3 py-1 rounded text-sm transition ${filterStatus === "pending" ? "bg-red-600 text-white" : "hover:bg-muted/10 text-foreground"}`}
        >
          Chưa thu
        </button>
      </div>

      {/* 3. Sort Select */}
      <select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value as any);
        }}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-white dark:bg-transparent dark:border
          border border-second/40 dark:border-second/30
          text-first dark:text-darkmodetext
          focus:outline-none focus:ring-1 focus:ring-selectring transition
        "
      >
        <option value="status">Trạng thái</option>
        <option value="date">Ngày thu (mới nhất)</option>
        <option value="name">Tên chủ hộ</option>
      </select>
    </div>
  );
}