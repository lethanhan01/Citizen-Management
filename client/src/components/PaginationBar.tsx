"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIdx: number;
  pageSize: number;
  currentCount: number;
  onPageChange: (page: number) => void;
};

export default function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  startIdx,
  currentCount,
  onPageChange,
}: Props) {
  return (
    <div className="border-t border-second/40 dark:border-second/30 px-4 py-3 flex items-center justify-between bg-second/5 dark:bg-second/10">
      <p className="text-sm text-second dark:text-darkmodetext/70">
        Hiển thị {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + currentCount, totalItems)} của {totalItems}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
        >
          <ChevronLeft className="w-5 h-5 text-first dark:text-darkmodetext" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`
                px-2 py-1 rounded text-sm font-medium transition
                ${currentPage === p ? "bg-third text-first" : "hover:bg-second/20 dark:hover:bg-second/30 text-first dark:text-darkmodetext"}
              `}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
        >
          <ChevronRight className="w-5 h-5 text-first dark:text-darkmodetext" />
        </button>
      </div>
    </div>
  );
}
