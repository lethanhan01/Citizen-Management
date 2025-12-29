"use client";

import { Search } from "lucide-react";
import type { CitizenGender, CitizenSort, CitizenStatus } from "@/hooks/useCitizenListParams";

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  sortBy: CitizenSort;
  setSortBy: (v: CitizenSort) => void;

  filterGender: CitizenGender;
  setFilterGender: (v: CitizenGender) => void;

  filterStatus: CitizenStatus;
  setFilterStatus: (v: CitizenStatus) => void;

  resetPage: () => void;

  error?: string | null;
};

export default function CitizenListControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterGender,
  setFilterGender,
  filterStatus,
  setFilterStatus,
  resetPage,
  error,
}: Props) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, CCCD..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            resetPage();
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
        <Search className="w-5 h-5 absolute left-3 top-2.5 text-second dark:text-darkmodetext/60" />
      </div>

      {/* Sort & Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as CitizenSort);
            resetPage();
          }}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            bg-white dark:bg-transparent dark:border
            border border-second/40 dark:border-second/30
            text-first dark:text-darkmodetext
            focus:outline-none focus:ring-1 focus:ring-selectring transition
          "
        >
          <option value="name">Sắp xếp theo tên</option>
          <option value="age">Sắp xếp theo tuổi</option>
          <option value="status">Sắp xếp theo trạng thái</option>
          <option value="date">Sắp xếp theo thời gian thêm vào hệ thống</option>
        </select>

        <select
          value={filterGender}
          onChange={(e) => {
            setFilterGender(e.target.value as CitizenGender);
            resetPage();
          }}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            bg-white dark:bg-transparent dark:border
            border border-second/40 dark:border-second/30
            text-first dark:text-darkmodetext
            focus:outline-none focus:ring-1 focus:ring-selectring transition
          "
        >
          <option value="all">Tất cả giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
          <option value="unknown">Không rõ</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as CitizenStatus);
            resetPage();
          }}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            bg-white dark:bg-transparent dark:border
            border border-second/40 dark:border-second/30
            text-first dark:text-darkmodetext
            focus:outline-none focus:ring-1 focus:ring-selectring transition
          "
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="permanent">Thường trú</option>
          <option value="temporary_resident">Tạm trú</option>
          <option value="temporary_absent">Tạm vắng</option>
          <option value="moved_out">Đã chuyển đi</option>
          <option value="deceased">Đã mất</option>
        </select>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-lg border border-red-300/40 bg-red-50/30 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
