"use client";

import { useParams } from "react-router-dom";

export default function CitizenDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Chi tiết công dân #{id}
      </h2>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted-foreground">
          Thông tin chi tiết công dân
        </p>
        {/* Detail form sẽ được thêm sau */}
      </div>
    </div>
  );
}





