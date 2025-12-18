"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  X,
  Save,
  Loader,
  DollarSign,
} from "lucide-react";

interface HouseholdFee {
  householdCode: string;
  headName: string;
  memberCount: number;
  address: string;
  isPaid: boolean;
  paidDate?: string;
  totalAmount?: number;
}

interface FeeCategory {
  id: string;
  name: string;
  ratePerPersonPerMonth: number; // VND
  description: string;
}

const MOCK_HOUSEHOLDS: HouseholdFee[] = [
  {
    householdCode: "HK001",
    headName: "Nguyễn Văn A",
    memberCount: 4,
    address: "123 Lê Lợi, Q1",
    isPaid: true,
    paidDate: "2025-12-01",
    totalAmount: 24000,
  },
  {
    householdCode: "HK002",
    headName: "Trần Thị B",
    memberCount: 3,
    address: "45 Nguyễn Trãi, Q5",
    isPaid: true,
    paidDate: "2025-12-05",
    totalAmount: 18000,
  },
  {
    householdCode: "HK003",
    headName: "Phạm Văn C",
    memberCount: 5,
    address: "88 Hai Bà Trưng, Q3",
    isPaid: false,
  },
  {
    householdCode: "HK004",
    headName: "Lê Thị D",
    memberCount: 2,
    address: "22 Lý Tự Trọng, Q1",
    isPaid: false,
  },
];

const INITIAL_CATEGORY: FeeCategory = {
  id: "sanitation",
  name: "Phí vệ sinh",
  ratePerPersonPerMonth: 6000,
  description: "Thu hàng tháng theo số nhân khẩu",
};

export default function FixedFees() {
  const [households, setHouseholds] = useState<HouseholdFee[]>(MOCK_HOUSEHOLDS);
  const [category, setCategory] = useState<FeeCategory>(INITIAL_CATEGORY);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingRate, setEditingRate] = useState(category.ratePerPersonPerMonth);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdFee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => {
    const paid = households.filter((h) => h.isPaid);
    const unpaid = households.filter((h) => !h.isPaid);
    const kpi = households.length > 0 ? (paid.length / households.length) * 100 : 0;
    return { paid: paid.length, unpaid: unpaid.length, kpi: kpi.toFixed(1) };
  }, [households]);

  const paidHouseholds = useMemo(() => households.filter((h) => h.isPaid), [households]);
  const unpaidHouseholds = useMemo(() => households.filter((h) => !h.isPaid), [households]);

  const handleSaveRate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCategory({ ...category, ratePerPersonPerMonth: editingRate });
      setShowRateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = (household: HouseholdFee) => {
    setSelectedHousehold(household);
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!selectedHousehold) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const totalAmount = selectedHousehold.memberCount * category.ratePerPersonPerMonth;
      setHouseholds((prev) =>
        prev.map((h) =>
          h.householdCode === selectedHousehold.householdCode
            ? { ...h, isPaid: true, paidDate: new Date().toISOString().split("T")[0], totalAmount }
            : h
        )
      );
      setShowPaymentModal(false);
      setSelectedHousehold(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Khoản thu phí cố định</h2>

      {/* Accordion Item */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground" />
            )}
            <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingRate(category.ratePerPersonPerMonth);
              setShowRateModal(true);
            }}
            className="p-2 rounded-lg border border-input hover:bg-muted/10"
          >
            <Edit className="w-4 h-4 text-first dark:text-darkmodetext" />
          </button>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-5 border-t border-border space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Mức thu" value={`${category.ratePerPersonPerMonth.toLocaleString()} VND`} subtext="/ tháng / người" />
              <StatCard label="Hộ đã thu" value={stats.paid} subtext={`/${households.length} hộ`} color="green" />
              <StatCard label="Hộ chưa thu" value={stats.unpaid} subtext={`/${households.length} hộ`} color="red" />
              <StatCard label="KPI hoàn thành" value={`${stats.kpi}%`} color="blue" />
            </div>

            {/* Paid Table */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Hộ đã thu ({stats.paid})</h4>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/10">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-foreground">Mã hộ</th>
                      <th className="py-2 px-3 text-foreground">Chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Số người</th>
                      <th className="py-2 px-3 text-foreground">Tổng tiền</th>
                      <th className="py-2 px-3 text-foreground">Ngày thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidHouseholds.map((h) => (
                      <tr key={h.householdCode} className="border-t border-border">
                        <td className="py-2 px-3 text-foreground">{h.householdCode}</td>
                        <td className="py-2 px-3 text-foreground">{h.headName}</td>
                        <td className="py-2 px-3 text-foreground">{h.memberCount}</td>
                        <td className="py-2 px-3 text-foreground font-semibold">
                          {h.totalAmount?.toLocaleString()} VND
                        </td>
                        <td className="py-2 px-3 text-foreground">{h.paidDate}</td>
                      </tr>
                    ))}
                    {paidHouseholds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">
                          Chưa có hộ nào đã thu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unpaid Table */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Hộ chưa thu ({stats.unpaid})</h4>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/10">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-foreground">Mã hộ</th>
                      <th className="py-2 px-3 text-foreground">Chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Địa chỉ</th>
                      <th className="py-2 px-3 text-foreground">Số người</th>
                      <th className="py-2 px-3 text-foreground">Dự kiến</th>
                      <th className="py-2 px-3 text-center text-foreground">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidHouseholds.map((h) => (
                      <tr key={h.householdCode} className="border-t border-border">
                        <td className="py-2 px-3 text-foreground">{h.householdCode}</td>
                        <td className="py-2 px-3 text-foreground">{h.headName}</td>
                        <td className="py-2 px-3 text-foreground">{h.address}</td>
                        <td className="py-2 px-3 text-foreground">{h.memberCount}</td>
                        <td className="py-2 px-3 text-foreground">
                          {(h.memberCount * category.ratePerPersonPerMonth).toLocaleString()} VND
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleAddPayment(h)}
                            className="p-1.5 rounded-lg border border-input hover:bg-muted/20"
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {unpaidHouseholds.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          Tất cả hộ đã thu
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

      {/* Rate Edit Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRateModal(false)}>
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Điều chỉnh mức thu</h3>
              <button onClick={() => setShowRateModal(false)} className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Mức thu (VND / tháng / người)
                </label>
                <input
                  type="number"
                  value={editingRate}
                  onChange={(e) => setEditingRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRateModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveRate}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Xác nhận đã thu tiền</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-second/10 dark:bg-second/20 rounded-lg space-y-1">
                <p className="text-sm text-second dark:text-darkmodetext/70">Mã hộ: {selectedHousehold.householdCode}</p>
                <p className="font-semibold text-first dark:text-darkmodetext">{selectedHousehold.headName}</p>
                <p className="text-sm text-second dark:text-darkmodetext/70">Số người: {selectedHousehold.memberCount}</p>
              </div>
              <div className="p-4 bg-third/10 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-second dark:text-darkmodetext/70">Mức thu:</span>
                  <span className="text-sm text-first dark:text-darkmodetext">{category.ratePerPersonPerMonth.toLocaleString()} VND / người</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-second dark:text-darkmodetext/70">Số người:</span>
                  <span className="text-sm text-first dark:text-darkmodetext">× {selectedHousehold.memberCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-second/30">
                  <span className="font-semibold text-first dark:text-darkmodetext">Tổng tiền:</span>
                  <span className="text-lg font-bold text-third">
                    {(selectedHousehold.memberCount * category.ratePerPersonPerMonth).toLocaleString()} VND
                  </span>
                </div>
              </div>
              <p className="text-xs text-second dark:text-darkmodetext/60">
                Xác nhận đã thu tiền mặt từ hộ này. Hệ thống sẽ lưu lại thông tin.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Xác nhận đã thu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: "green" | "red" | "blue";
}) {
  return (
    <div className="p-4 bg-second/10 dark:bg-second/20 rounded-lg">
      <p className="text-xs text-second dark:text-darkmodetext/70 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          color === "green"
            ? "text-green-600 dark:text-green-400"
            : color === "red"
            ? "text-red-600 dark:text-red-400"
            : color === "blue"
            ? "text-blue-600 dark:text-blue-400"
            : "text-first dark:text-darkmodetext"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-second dark:text-darkmodetext/70">{subtext}</p>}
    </div>
  );
}





