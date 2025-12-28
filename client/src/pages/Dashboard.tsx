"use client";

import { useState, useEffect } from "react";
import { CChart } from "@coreui/react-chartjs";
import icon5 from "@/assets/icon5.svg";
import icon6 from "@/assets/icon6.svg";
import icon1 from "@/assets/icon.svg";
import icon2 from "@/assets/icon2.svg";
import icon3 from "@/assets/icon3.svg";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"citizens" | "fees">("citizens");
  const [textColor, setTextColor] = useState("#666666");

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTextColor(isDark ? "#e5e7eb" : "#666666");
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {icon5 && (
                  <img src={icon5} alt="Dân số" className="w-12 h-12 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Tổng dân số</p>
                  <p className="text-3xl font-bold text-foreground">1,234</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+2.3% so với tháng trước</p>
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {icon6 && (
                  <img src={icon6} alt="Hộ khẩu" className="w-12 h-12 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Tổng số hộ khẩu</p>
                  <p className="text-3xl font-bold text-foreground">456</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+1.8% so với tháng trước</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phân bố theo giới tính</p>
                  <h3 className="text-lg font-semibold text-foreground">Tỷ lệ nam/nữ</h3>
                </div>
              </div>
              <CChart
                type="pie"
                data={{
                  labels: ["Nam (51.2%)", "Nữ (48.8%)"],
                  datasets: [
                    {
                      backgroundColor: ["#3b82f6", "#ec4899"],
                      data: [632, 602],
                    },
                  ],
                }}
                options={{
                  plugins: { 
                    legend: { 
                      position: "bottom",
                      labels: { color: textColor }
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px" }}
              />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tạm trú / Tạm vắng</p>
                  <h3 className="text-lg font-semibold text-foreground">Trạng thái cư trú</h3>
                </div>
              </div>
              <CChart
                type="pie"
                data={{
                  labels: ["Thường trú (89.3%)", "Tạm trú (6.5%)", "Tạm vắng (4.2%)"],
                  datasets: [
                    {
                      backgroundColor: ["#22c55e", "#facc15", "#f97316"],
                      data: [1102, 80, 52],
                    },
                  ],
                }}
                options={{
                  plugins: { 
                    legend: { 
                      position: "bottom",
                      labels: { color: textColor }
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px" }}
              />
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Phân bố theo nhóm tuổi</p>
                <h3 className="text-lg font-semibold text-foreground">Cơ cấu dân số</h3>
              </div>
            </div>
            <CChart
              type="bar"
              data={{
                labels: ["Mầm non", "Mẫu giáo", "Cấp 1", "Cấp 2", "Cấp 3", "Độ tuổi lao động", "Nghỉ hưu"],
                datasets: [
                  {
                    label: "Số người",
                    backgroundColor: "#8b5cf6",
                    borderColor: "#7c3aed",
                    data: [45, 58, 92, 78, 65, 720, 176],
                    maxBarThickness: 32,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: textColor }
                  }
                },
                scales: {
                  x: {
                    ticks: { color: textColor },
                    grid: { color: "rgba(128, 128, 128, 0.1)" }
                  },
                  y: { 
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: "rgba(128, 128, 128, 0.1)" }
                  },
                },
                maintainAspectRatio: false,
              }}
              style={{ height: "260px" }}
            />
          </div>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="space-y-6">
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

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Xu hướng theo tháng</p>
                <h3 className="text-lg font-semibold text-foreground">Thu phí 12 tháng</h3>
              </div>
            </div>
            <CChart
              type="bar"
              data={{
                labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                datasets: [
                  {
                    label: "Thu (triệu)",
                    backgroundColor: "#3b82f6",
                    borderColor: "#2563eb",
                    data: [5, 6, 7, 8, 7, 9, 10, 9, 8, 11, 12, 10],
                    maxBarThickness: 28,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: textColor }
                  }
                },
                scales: {
                  x: {
                    ticks: { color: textColor },
                    grid: { color: "rgba(128, 128, 128, 0.1)" }
                  },
                  y: { 
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: "rgba(128, 128, 128, 0.1)" }
                  },
                },
                maintainAspectRatio: false,
              }}
              style={{ height: "260px" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái thu trong tháng</p>
                  <h3 className="text-lg font-semibold text-foreground">Số hộ theo trạng thái</h3>
                </div>
              </div>
              <CChart
                type="doughnut"
                data={{
                  labels: ["Đã thu", "Pending", "Chưa thu"],
                  datasets: [
                    {
                      backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
                      data: [120, 25, 40],
                    },
                  ],
                }}
                options={{
                  plugins: { 
                    legend: { 
                      position: "bottom",
                      labels: { color: textColor }
                    } 
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px" }}
              />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền theo chiến dịch</p>
                  <h3 className="text-lg font-semibold text-foreground">Đóng góp chiến dịch</h3>
                </div>
              </div>
              <CChart
                type="bar"
                data={{
                  labels: ["Trung thu", "Tết", "Quỹ đường", "Trường học"],
                  datasets: [
                    {
                      label: "Số tiền (triệu)",
                      backgroundColor: "#4cc0aa",
                      borderColor: "#38a48f",
                      data: [12, 18, 9, 15],
                      maxBarThickness: 32,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: textColor }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: textColor },
                      grid: { color: "rgba(128, 128, 128, 0.1)" }
                    },
                    y: { 
                      beginAtZero: true,
                      ticks: { color: textColor },
                      grid: { color: "rgba(128, 128, 128, 0.1)" }
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "240px" }}
              />
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Lịch sử thu gần đây</p>
                <h3 className="text-lg font-semibold text-foreground">Phiếu thu gần nhất</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Hộ</th>
                    <th className="py-2 pr-4">Khoản thu</th>
                    <th className="py-2 pr-4">Số tiền</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                    <th className="py-2">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { household: "HK-001", fee: "Quỹ đường", amount: "1.200.000", status: "Đã thu", date: "12/09" },
                    { household: "HK-089", fee: "Trường học", amount: "800.000", status: "Pending", date: "11/09" },
                    { household: "HK-155", fee: "Tết", amount: "1.500.000", status: "Đã thu", date: "10/09" },
                  ].map((row) => (
                    <tr key={row.household}>
                      <td className="py-2 pr-4 font-medium text-foreground">{row.household}</td>
                      <td className="py-2 pr-4 text-foreground">{row.fee}</td>
                      <td className="py-2 pr-4 text-foreground">{row.amount}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            row.status === "Đã thu"
                              ? "bg-green-100 text-green-700"
                              : row.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 text-foreground">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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