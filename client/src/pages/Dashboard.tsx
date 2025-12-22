"use client";

import { useState } from "react";
import icon5 from "@/assets/icon5.svg";
import icon6 from "@/assets/icon6.svg";
import icon7 from "@/assets/icon7.svg";
import icon1 from "@/assets/icon.svg";
import icon2 from "@/assets/icon2.svg";
import icon3 from "@/assets/icon3.svg";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"citizens" | "fees">("citizens");

  return (
    <div className="space-y-6">

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
            icon={icon5}
          />
          <StatCard
            title="Tổng số hộ khẩu"
            value="456"
            subtitle="Đang hoạt động"
            icon={icon6}
          />
          <StatCard
            title="Tạm trú/vắng"
            value="89"
            subtitle="Trong tháng"
            icon={icon7}
          />
        </div>
      )}

      {activeTab === "fees" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tổng thu trong tháng"
            value="45.6M"
            subtitle="VNĐ"
            icon={icon1}
          />
          <StatCard
            title="Đã thu"
            value="38.2M"
            subtitle="83.8%"
            icon={icon2}
          />
          <StatCard
            title="Chưa thu"
            value="7.4M"
            subtitle="16.2%"
            icon={icon3}
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
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon?: string;
}) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {icon && (
          <img src={icon} alt={title} className="w-12 h-12 flex-shrink-0" />
        )}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}





