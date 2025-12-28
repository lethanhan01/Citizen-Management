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
  const getPageNumbers = () => {
    const maxVisible = 5; // Hiển thị tối đa 5 trang
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Nếu tổng trang <= 5, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị trang 1
      pages.push(1);

      // Tính toán phạm vi trang xung quanh trang hiện tại
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Thêm dấu "..." nếu cần
      if (startPage > 2) {
        pages.push("...");
      }

      // Thêm các trang xung quanh
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu "..." nếu cần
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Hiển thị trang cuối
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="border-t border-second/40 dark:border-second/30 px-4 py-3 flex items-center justify-between bg-second/5 dark:bg-second/10">
      <p className="text-sm text-second dark:text-darkmodetext/70">
        Hiển thị {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + currentCount, totalItems)} của {totalItems}
      </p>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
          title="Trang trước"
        >
          <ChevronLeft className="w-5 h-5 text-first dark:text-darkmodetext" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => (
            <button
              key={`${p}-${idx}`}
              onClick={() => typeof p === "number" && onPageChange(p)}
              disabled={typeof p === "string"}
              className={`
                px-2 py-1 rounded text-sm font-medium transition
                ${typeof p === "string"
                  ? "cursor-default text-second dark:text-darkmodetext/50"
                  : currentPage === p
                    ? "bg-third text-first underline"
                    : "hover:bg-second/20 dark:hover:bg-second/30 text-first dark:text-darkmodetext"
                }
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
          title="Trang sau"
        >
          <ChevronRight className="w-5 h-5 text-first dark:text-darkmodetext" />
        </button>
      </div>
    </div>
  );
}
