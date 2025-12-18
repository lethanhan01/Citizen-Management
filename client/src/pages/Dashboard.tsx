"use client";

import { useState } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"citizens" | "fees">("citizens");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Thống kê tổng quan
      </h2>

      {/* TABS */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("citizens")}
          className={`
            px-4 py-2 font-medium transition border-b-2
            ${
              activeTab === "citizens"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }
          `}
        >
          Thống kê dân cư
        </button>
        <button
          onClick={() => setActiveTab("fees")}
          className={`
            px-4 py-2 font-medium transition border-b-2
            ${
              activeTab === "fees"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }
          `}
        >
          Thống kê thu phí
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "citizens" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tổng số công dân"
            value="1,234"
            subtitle="Đang sinh sống"
            color="bg-blue-500"
          />
          <StatCard
            title="Tổng số hộ khẩu"
            value="456"
            subtitle="Đang hoạt động"
            color="bg-green-500"
          />
          <StatCard
            title="Tạm trú/vắng"
            value="89"
            subtitle="Trong tháng"
            color="bg-purple-500"
          />
        </div>
      )}

      {activeTab === "fees" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tổng thu trong tháng"
            value="45.6M"
            subtitle="VNĐ"
            color="bg-green-500"
          />
          <StatCard
            title="Đã thu"
            value="38.2M"
            subtitle="83.8%"
            color="bg-blue-500"
          />
          <StatCard
            title="Chưa thu"
            value="7.4M"
            subtitle="16.2%"
            color="bg-red-500"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white font-bold text-xl`}>
          {value.charAt(0)}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}





