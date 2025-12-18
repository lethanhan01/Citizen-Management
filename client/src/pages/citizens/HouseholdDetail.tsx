"use client";

import { useParams } from "react-router-dom";

export default function HouseholdDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Chi tiết hộ khẩu #{id}
      </h2>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted-foreground">
          Thông tin chi tiết hộ khẩu và danh sách thành viên
        </p>
        {/* Detail info sẽ được thêm sau */}
      </div>
    </div>
  );
}





