'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';
import { useStatisticStore } from '@/stores/statistic.store.ts';
import icon5 from '@/assets/icon5.svg';
import icon6 from '@/assets/icon6.svg';
import icon1 from '@/assets/icon.svg';
import icon2 from '@/assets/icon2.svg';
import icon3 from '@/assets/icon3.svg';

const LazyChart = lazy(() =>
  import('@coreui/react-chartjs').then((m) => ({ default: m.CChart })),
);

type ChartProps = ComponentProps<typeof LazyChart>;

const Chart = (props: ChartProps) => (
  <Suspense fallback={<div>Đang tải biểu đồ...</div>}>
    <LazyChart {...props} />
  </Suspense>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'citizens' | 'fees'>('citizens');
  const [textColor, setTextColor] = useState('#666666');

  // 1. Lấy dữ liệu và action từ Store
  const { dashboardData, fetchDashboard, loading } = useStatisticStore();

  // 2. Gọi API
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTextColor(isDark ? '#e5e7eb' : '#666666');
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Tính toán dữ liệu hiển thị
  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    // Giới tính
    const { nam, nu } = dashboardData.thongKeGioiTinh;
    const totalGender = nam + nu || 1;
    const percentNam = ((nam / totalGender) * 100).toFixed(1);
    const percentNu = ((nu / totalGender) * 100).toFixed(1);

    // Cư trú
    const { thuongTru, tamTru, tamVang } = dashboardData.thongKeCuTru;
    const totalResidency = thuongTru + tamTru + tamVang || 1;
    const pThuongTru = ((thuongTru / totalResidency) * 100).toFixed(1);
    const pTamTru = ((tamTru / totalResidency) * 100).toFixed(1);
    const pTamVang = ((tamVang / totalResidency) * 100).toFixed(1);

    // Dữ liệu Tài chính (Xử lý an toàn nếu chưa có) ---
    const taiChinh = dashboardData.thongKeTaiChinh || {
      doanhThuTheoThang: Array(12).fill(0),
      trangThaiThu: { daHoanThanh: 0, nopMotPhan: 0, chuaNop: 0 },
      topChienDich: [],
      giaoDichGanNhat: [],
    };

    return {
      gender: {
        labels: [`Nam (${percentNam})`, `Nữ (${percentNu})`],
        data: [nam, nu],
      },
      residency: {
        labels: [
          `Thường trú (${pThuongTru}%)`,
          `Tạm trú (${pTamTru}%)`,
          `Tạm vắng (${pTamVang}%)`,
        ],
        data: [thuongTru, tamTru, tamVang],
      },
      age: {
        labels: ['Mầm non', 'Học sinh', 'Lao động', 'Nghỉ hưu'],
        data: [
          dashboardData.thongKeDoTuoi.mamNon,
          dashboardData.thongKeDoTuoi.hocSinh,
          dashboardData.thongKeDoTuoi.laoDong,
          dashboardData.thongKeDoTuoi.nghiHuu,
        ],
      },
      // Tài chính
      monthlyRevenue: {
        data: taiChinh.doanhThuTheoThang,
      },
      paymentStatus: {
        labels: ['Đã thu', 'Nộp một phần', 'Chưa thu'],
        data: [
          taiChinh.trangThaiThu.daHoanThanh,
          taiChinh.trangThaiThu.nopMotPhan,
          taiChinh.trangThaiThu.chuaNop,
        ],
        backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
      },
      campaigns: {
        labels: taiChinh.topChienDich.map((c) => c.tenChienDich),
        data: taiChinh.topChienDich.map((c) => c.soTien),
      },
    };
  }, [dashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Đang tải dữ liệu thống kê...
      </div>
    );
  }

  // Safe access data
  const data = dashboardData || {
    tongSoNhanKhau: 0,
    tongSoHoKhau: 0,
    thongKeTaiChinh: {
      tongThuThangNay: 0,
      tongDaThuNamNay: 0,
      tongCanThuNamNay: 0,
      tongChuaThu: 0,
      giaoDichGanNhat: [],
    },
  };

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('citizens')}
          className={`
            px-4 py-2 font-medium transition border-b-2
            ${
              activeTab === 'citizens'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Thống kê dân cư
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`
            px-4 py-2 font-medium transition border-b-2
            ${
              activeTab === 'fees'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Thống kê thu phí
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'citizens' && chartData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              {icon5 && (
                <div className="group absolute -right-10 -bottom-10 w-40 h-40 cursor-pointer z-20">
                  <img
                    src={icon5}
                    alt="Dân số"
                    className="w-full h-full -rotate-30"
                  />
                  <div className="absolute top-1/3 -translate-y-1/2 right-full mr-3 px-4 py-2 opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto bg-[#eaf8fb] dark:bg-[#22303f] text-primary-foreground dark:text-white rounded-lg text-sm whitespace-nowrap shadow-lg">
                    <span>bước sang tuổi 36<br /> cảm ơn mother physics<br /> cảm ơn gia đình</span>
                    <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-8 border-transparent border-l-[#eaf8fb] dark:border-l-[#22303f]"></div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng dân số</p>
                  <p className="text-3xl font-bold text-foreground">
                    {data.tongSoNhanKhau.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nhân khẩu hiện tại
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              {icon6 && (
                <div className="group absolute -right-10 -bottom-10 w-40 h-40 cursor-pointer z-20">
                  <img
                    src={icon6}
                    alt="Hộ khẩu"
                    className="w-full h-full -rotate-30"
                  />
                  <div className="absolute top-1/3 -translate-y-1/2 right-full mr-3 px-4 py-2 opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto bg-[#eaf8fb] dark:bg-[#22303f] text-primary-foreground dark:text-white rounded-lg text-sm whitespace-nowrap shadow-lg">
                    <span>Sẽ có những con cá phải giả chó</span>
                    <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-8 border-transparent border-l-[#eaf8fb] dark:border-l-[#22303f]"></div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tổng số hộ khẩu
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {data.tongSoHoKhau.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hộ gia đình quản lý
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Phân bố theo giới tính
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    Tỷ lệ nam/nữ
                  </h3>
                </div>
              </div>
              <Chart
                type="pie"
                data={{
                  labels: chartData.gender.labels,
                  datasets: [
                    {
                      backgroundColor: ['#3b82f6', '#ec4899'],
                      data: chartData.gender.data,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: textColor },
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px", marginTop: '30px' }}
              />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tạm trú / Tạm vắng
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    Trạng thái cư trú
                  </h3>
                </div>
              </div>
              <Chart
                type="pie"
                data={{
                  labels: chartData.residency.labels,
                  datasets: [
                    {
                      backgroundColor: ['#22c55e', '#facc15', '#f97316'],
                      data: chartData.residency.data,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: textColor },
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px", marginTop: '30px' }}
              />
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Phân bố theo nhóm tuổi
                </p>
                <h3 className="text-lg font-semibold text-foreground">
                  Cơ cấu dân số
                </h3>
              </div>
            </div>
            <Chart
              type="bar"
              data={{
                labels: chartData.age.labels,
                datasets: [
                  {
                    label: 'Số người',
                    backgroundColor: '#7eb1db',
                    borderColor: '#7c3aed',
                    data: chartData.age.data,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: textColor },
                  },
                },
                datasets: {
                  bar: {
                    categoryPercentage: 0.6,
                    barPercentage: 0.7,
                    maxBarThickness: 32,
                  },
                },
                scales: {
                  x: {
                    ticks: { color: textColor },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                  },
                },
                maintainAspectRatio: false,
              }}
              style={{ height: "260px", marginTop: '30px' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'fees' && chartData && data.thongKeTaiChinh && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Tổng thu trong tháng"
              value={data.thongKeTaiChinh.tongThuThangNay.toLocaleString()}
              subtitle="VNĐ"
              icon={icon1}
            />
            <StatCard
              title="Đã thu (Năm nay)"
              value={
                data.thongKeTaiChinh.tongDaThuNamNay.toLocaleString() + ' VNĐ'
              }
              subtitle={`${((data.thongKeTaiChinh.tongDaThuNamNay / (data.thongKeTaiChinh.tongCanThuNamNay || 1)) * 100).toFixed(1)}% chỉ tiêu năm`}
              icon={icon2}
            />
            <StatCard
              title="Chưa thu"
              value={data.thongKeTaiChinh.tongChuaThu.toLocaleString() + ' VNĐ'}
              subtitle="Công nợ hiện tại"
              icon={icon3}
            />
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Xu hướng theo tháng
                </p>
                <h3 className="text-lg font-semibold text-foreground">
                  Thu phí 12 tháng
                </h3>
              </div>
            </div>
            <Chart
              type="bar"
              data={{
                labels: [
                  '1',
                  '2',
                  '3',
                  '4',
                  '5',
                  '6',
                  '7',
                  '8',
                  '9',
                  '10',
                  '11',
                  '12',
                ],
                datasets: [
                  {
                    label: 'Thu (VNĐ)',
                    backgroundColor: '#7eb1db',
                    borderColor: '#2563eb',
                    data: chartData.monthlyRevenue.data,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: textColor },
                  },
                },
                datasets: {
                  bar: {
                    categoryPercentage: 0.6,
                    barPercentage: 0.7,
                    maxBarThickness: 32,
                  },
                },
                scales: {
                  x: {
                    ticks: { color: textColor },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                  },
                },
                maintainAspectRatio: false,
              }}
              style={{ height: "260px", marginTop: '30px' }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái thu (Năm nay)
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    Số hộ theo trạng thái
                  </h3>
                </div>
              </div>
              <Chart
                type="doughnut"
                data={{
                  labels: chartData.paymentStatus.labels,
                  datasets: [
                    {
                      backgroundColor: chartData.paymentStatus.backgroundColor,
                      data: chartData.paymentStatus.data,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: textColor },
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "220px", marginTop: '30px' }}
              />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tổng tiền theo chiến dịch
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    Top đóng góp
                  </h3>
                </div>
              </div>
              <Chart
                type="bar"
                data={{
                  labels: chartData.campaigns.labels,
                  datasets: [
                    {
                      label: 'Số tiền (VNĐ)',
                      backgroundColor: '#4cc0aa',
                      borderColor: '#38a48f',
                      data: chartData.campaigns.data,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: textColor },
                    },
                  },
                  datasets: {
                    bar: {
                      categoryPercentage: 0.6,
                      barPercentage: 0.7,
                      maxBarThickness: 32,
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: textColor },
                      grid: { color: 'rgba(128, 128, 128, 0.1)' },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: textColor },
                      grid: { color: 'rgba(128, 128, 128, 0.1)' },
                    },
                  },
                  maintainAspectRatio: false,
                }}
                style={{ height: "240px", marginTop: '30px' }}
              />
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Lịch sử thu gần đây
                </p>
                <h3 className="text-lg font-semibold text-foreground">
                  Phiếu thu gần nhất
                </h3>
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
                  {data.thongKeTaiChinh.giaoDichGanNhat.length > 0 ? (
                    data.thongKeTaiChinh.giaoDichGanNhat.map((row, index) => (
                      <tr key={index}>
                        <td className="py-2 pr-4 font-medium text-foreground">
                          {row.household_no}
                        </td>
                        <td className="py-2 pr-4 text-foreground">
                          {row.khoan_thu}
                        </td>
                        <td className="py-2 pr-4 text-foreground">
                          {row.so_tien.toLocaleString()}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              row.trang_thai === 'Đã thu'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700' // Màu đỏ cho Nộp một phần
                            }`}
                          >
                            {row.trang_thai}
                          </span>
                        </td>
                        <td className="py-2 text-foreground">{row.ngay_thu}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Chưa có giao dịch nào
                      </td>
                    </tr>
                  )}
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
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        {icon && (
          <img src={icon} alt={title} className="w-30 h-30 flex-shrink-0 absolute -right-15 -bottom-15 -rotate-45" />
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
