"use client";

import { useParams } from "react-router-dom";

export default function HouseholdDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-first dark:text-fourth">
        Chi tiết hộ khẩu #{id}
      </h2>

      <div className="bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl p-6 shadow-sm dark:shadow-none">
        <p className="text-second dark:text-fourth/70">
          Thông tin chi tiết hộ khẩu và danh sách thành viên
        </p>
        {/* Detail info sẽ được thêm sau */}
      </div>
    </div>
  );
}
