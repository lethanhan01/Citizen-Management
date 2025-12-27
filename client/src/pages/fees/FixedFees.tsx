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
  Printer,
  Search,
} from "lucide-react";

interface HouseholdFee {
  householdCode: string;
  headName: string;
  headCCCD: string;
  memberCount: number;
  address: string;
  status: "paid" | "unpaid" | "pending";
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
    headCCCD: "001234567890",
    memberCount: 4,
    address: "123 Lê Lợi, Q1",
    status: "paid",
    paidDate: "2025-12-01",
    totalAmount: 24000,
  },
  {
    householdCode: "HK002",
    headName: "Trần Thị B",
    headCCCD: "001234567891",
    memberCount: 3,
    address: "45 Nguyễn Trãi, Q5",
    status: "paid",
    paidDate: "2025-12-05",
    totalAmount: 18000,
  },
  {
    householdCode: "HK003",
    headName: "Phạm Văn C",
    headCCCD: "001234567892",
    memberCount: 5,
    address: "88 Hai Bà Trưng, Q3",
    status: "pending",
  },
  {
    householdCode: "HK004",
    headName: "Lê Thị D",
    headCCCD: "001234567893",
    memberCount: 2,
    address: "22 Lý Tự Trọng, Q1",
    status: "unpaid",
  },
  {
    householdCode: "HK005",
    headName: "Hoàng Văn E",
    headCCCD: "001234567894",
    memberCount: 6,
    address: "12 Cách Mạng Tháng 8, Q10",
    status: "unpaid",
  },
  {
    householdCode: "HK006",
    headName: "Võ Thị F",
    headCCCD: "001234567895",
    memberCount: 3,
    address: "88 Trần Hưng Đạo, Q5",
    status: "pending",
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

  // Search, sort, and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"status" | "date" | "name">("status");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = useMemo(() => {
    const paid = households.filter((h) => h.status === "paid");
    const pending = households.filter((h) => h.status === "pending");
    const unpaid = households.filter((h) => h.status === "unpaid");
    const kpi = households.length > 0 ? (paid.length / households.length) * 100 : 0;
    return { paid: paid.length, pending: pending.length, unpaid: unpaid.length, kpi: kpi.toFixed(1) };
  }, [households]);

  // Filter, sort, and paginate
  const filteredAndSortedHouseholds = useMemo(() => {
    let filtered = households.filter(
      (h) =>
        (h.householdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.headCCCD.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || 
         (statusFilter === "paid" && h.status === "paid") ||
         (statusFilter === "unpaid" && (h.status === "unpaid" || h.status === "pending")))
    );

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "status") {
        const statusOrder = { paid: 0, pending: 1, unpaid: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === "date") {
        const dateA = a.paidDate ? new Date(a.paidDate).getTime() : 0;
        const dateB = b.paidDate ? new Date(b.paidDate).getTime() : 0;
        return dateB - dateA; // Newest first
      } else if (sortBy === "name") {
        return a.headName.localeCompare(b.headName);
      }
      return 0;
    });

    return filtered;
  }, [households, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.ceil(filteredAndSortedHouseholds.length / itemsPerPage);
  const paginatedHouseholds = filteredAndSortedHouseholds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            ? { ...h, status: "paid", paidDate: new Date().toISOString().split("T")[0], totalAmount }
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

  const handlePrint = (household: HouseholdFee) => {
    console.log("Printing receipt for:", household.householdCode);
    // TODO: Implement print functionality
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Danh sách khoản thu phí cố định</h2>

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
              <StatCard label="Hộ chờ xử lý" value={stats.pending} subtext={`/${households.length} hộ`} color="yellow" />
              <StatCard label="Hộ chưa thu" value={stats.unpaid} subtext={`/${households.length} hộ`} color="red" />
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-second dark:text-darkmodetext/60" />
                <input
                  type="text"
                  placeholder="Tìm theo mã hộ, tên chủ hộ, CCCD..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page
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
              </div>
              <div className="flex gap-2 border border-second/40 dark:border-second/30 rounded-lg p-1 bg-white dark:bg-transparent">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm transition ${
                    statusFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-first dark:text-darkmodetext hover:bg-muted/10"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("paid");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm transition ${
                    statusFilter === "paid"
                      ? "bg-green-600 text-white dark:bg-green-500"
                      : "text-first dark:text-darkmodetext hover:bg-muted/10"
                  }`}
                >
                  Đã thu
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("unpaid");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm transition ${
                    statusFilter === "unpaid"
                      ? "bg-red-600 text-white dark:bg-red-500"
                      : "text-first dark:text-darkmodetext hover:bg-muted/10"
                  }`}
                >
                  Chưa thu
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "status" | "date" | "name")}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  bg-white dark:bg-transparent dark:border
                  border border-second/40 dark:border-second/30
                  text-first dark:text-darkmodetext
                  focus:outline-none focus:ring-1 focus:ring-selectring transition
                "
              >
                <option value="status">Trạng thái</option>
                <option value="date">Ngày thu (mới nhất)</option>
                <option value="name">Tên chủ hộ</option>
              </select>
            </div>

            {/* Unified Table */}
            <div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/10">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-foreground">Mã hộ</th>
                      <th className="py-2 px-3 text-foreground">CCCD chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Địa chỉ</th>
                      <th className="py-2 px-3 text-foreground">Số người</th>
                      <th className="py-2 px-3 text-foreground">Tổng tiền</th>
                      <th className="py-2 px-3 text-foreground">Trạng thái</th>
                      <th className="py-2 px-3 text-foreground">Ngày thu</th>
                      <th className="py-2 px-3 text-foreground">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHouseholds.map((h) => {
                      const estimatedAmount = h.memberCount * category.ratePerPersonPerMonth;
                      const displayAmount = h.totalAmount || estimatedAmount;
                      
                      return (
                        <tr key={h.householdCode} className="border-t border-border hover:bg-muted/5">
                          <td className="py-2 px-3 text-foreground">{h.householdCode}</td>
                          <td className="py-2 px-3 text-foreground">{h.headCCCD}</td>
                          <td className="py-2 px-3 text-foreground">{h.headName}</td>
                          <td className="py-2 px-3 text-foreground">{h.address}</td>
                          <td className="py-2 px-3 text-foreground">{h.memberCount}</td>
                          <td className="py-2 px-3 text-foreground font-semibold">
                            {displayAmount.toLocaleString()} VND
                          </td>
                          <td className="py-2 px-3">
                            {h.status === "paid" && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Đã thu
                              </span>
                            )}
                            {h.status === "pending" && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Chờ xử lý
                              </span>
                            )}
                            {h.status === "unpaid" && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Chưa thu
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.paidDate || "-"}
                          </td>
                          <td className="py-2 px-3">
                            {h.status === "paid" ? (
                              <button
                                onClick={() => handlePrint(h)}
                                className="p-2 rounded-lg border border-input hover:bg-muted/10 transition"
                                title="In hóa đơn"
                              >
                                <Printer className="w-4 h-4 text-foreground" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddPayment(h)}
                                className="p-2 rounded-lg border border-input hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 transition"
                                title="Thêm thanh toán"
                              >
                                <Plus className="w-4 h-4 text-foreground" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedHouseholds.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-muted-foreground">
                          {searchQuery ? "Không tìm thấy hộ nào phù hợp" : "Chưa có dữ liệu"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedHouseholds.length)} của{" "}
                    {filteredAndSortedHouseholds.length} hộ
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-input rounded-lg hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Trước
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg transition ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input hover:bg-muted/10"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-input rounded-lg hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
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
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
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
  color?: "green" | "red" | "blue" | "yellow";
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
            : color === "yellow"
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-first dark:text-darkmodetext"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-second dark:text-darkmodetext/70">{subtext}</p>}
    </div>
  );
}





