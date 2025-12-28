'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useFeeStore, type Fee } from '@/stores/fee.store';
import { toast } from 'react-hot-toast';

import PaginationBar from '@/components/PaginationBar';
import FeeFilterBar from '@/components/FeeFilterBar';

// Interface cho UI
interface HouseholdFeeUI {
  paymentId: number;
  householdCode: string;
  headName: string;
  headCCCD: string;
  memberCount: number;
  address: string;
  status: 'paid' | 'pending' | 'partial';
  paidDate?: string;
  totalAmount: number;
  paidAmount: number;
  note?: string;
}

const ITEMS_PER_PAGE = 10;

export default function FixedFees() {
  const {
    fees,
    payments,
    loading,
    fetchAllFees,
    fetchPayments,
    confirmPayment,
  } = useFeeStore();

  // --- LOCAL STATE ---
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState<number>(0); // Số tiền thực nộp
  const [paymentNote, setPaymentNote] = useState<string>('');

  const [selectedRateId, setSelectedRateId] = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState(0);
  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdFeeUI | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- CLIENT-SIDE FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'status' | 'date' | 'name'>('status');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>(
    'all',
  );
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch danh sách khoản thu
  useEffect(() => {
    fetchAllFees();
  }, [fetchAllFees]);

  // 2. Auto-select khoản thu mới nhất
  useEffect(() => {
    if (fees.length > 0 && !selectedRateId) {
      const newestFee = fees[0];
      setSelectedRateId(newestFee.rate_id);
      setEditingRate(newestFee.amount);
    }
  }, [fees, selectedRateId]);

  // 3. FETCH DATA (QUAN TRỌNG: Lấy hết dữ liệu về 1 lần)
  useEffect(() => {
    if (selectedRateId) {
      fetchPayments({
        rate_id: selectedRateId,
        limit: 5000,
      });
    }
  }, [selectedRateId, fetchPayments]);

  // --- DATA PROCESSING (XỬ LÝ Ở CLIENT) ---

  const currentCategory: Fee | undefined = useMemo(() => {
    return fees.find((f) => f.rate_id === selectedRateId);
  }, [fees, selectedRateId]);

  // Bước 1: Chuẩn hóa dữ liệu thô (Raw Data)
  const rawHouseholds: HouseholdFeeUI[] = useMemo(() => {
    return payments.map((p) => {
      const memberCountMatch = p.note?.match(/(\d+)\s+nhân khẩu/);
      const memberCount = memberCountMatch ? parseInt(memberCountMatch[1]) : 0;

      return {
        paymentId: p.payment_id,
        householdCode: p.household?.household_no || 'N/A',
        headName: p.household?.headPerson?.full_name || 'Không rõ',
        headCCCD: p.household?.headPerson?.citizen_id_num || '---',
        memberCount: memberCount,
        address: p.household?.address || '',
        status: p.payment_status as any,
        paidDate: p.date
          ? new Date(p.date).toISOString().split('T')[0]
          : undefined,
        totalAmount: Number(p.total_amount),
        paidAmount: Number(p.paid_amount || 0),
        note: p.note,
      };
    });
  }, [payments]);

  // Bước 2: LỌC DỮ LIỆU (Search & Filter Logic)
  const filteredHouseholds = useMemo(() => {
    let data = rawHouseholds;

    // a. Lọc theo trạng thái
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid') {
        data = data.filter((h) => h.status === 'paid');
      } else {
        // "pending" ở UI tương ứng với chưa thu (pending, partial, unpaid)
        data = data.filter((h) => h.status !== 'paid');
      }
    }

    // b. Tìm kiếm (Search) - Tìm theo Mã, Tên, CCCD
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter(
        (h) =>
          (h.householdCode && h.householdCode.toLowerCase().includes(query)) ||
          (h.headName && h.headName.toLowerCase().includes(query)) ||
          (h.headCCCD && h.headCCCD.toLowerCase().includes(query)),
      );
    }

    return data;
  }, [rawHouseholds, statusFilter, searchQuery]);

  // Bước 3: SẮP XẾP (Sort)
  const sortedHouseholds = useMemo(() => {
    const data = [...filteredHouseholds];
    data.sort((a, b) => {
      if (sortBy === 'status') {
        const statusOrder = { paid: 0, partial: 1, pending: 2, unpaid: 3 };
        return (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9);
      } else if (sortBy === 'date') {
        const dateA = a.paidDate ? new Date(a.paidDate).getTime() : 0;
        const dateB = b.paidDate ? new Date(b.paidDate).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'name') {
        return a.headName.localeCompare(b.headName);
      }
      return 0;
    });
    return data;
  }, [filteredHouseholds, sortBy]);

  // Bước 4: PHÂN TRANG (Pagination - Cắt mảng để hiển thị)
  const paginatedHouseholds = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedHouseholds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedHouseholds, currentPage]);

  // Bước 5: Thống kê (Client-side Stats)
  const clientStats = useMemo(() => {
    const stats = { paid: 0, partial: 0, pending: 0 };
    rawHouseholds.forEach((h) => {
      if (h.status === 'paid') stats.paid++;
      else if (h.status === 'partial') stats.partial++;
      else stats.pending++;
    });
    return stats;
  }, [rawHouseholds]);

  // --- HANDLERS ---
  const handleSaveRate = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Cập nhật mức thu thành công (Demo)');
      setShowRateModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPayment = (household: HouseholdFeeUI) => {
    setSelectedHousehold(household);
    const remaining = household.totalAmount - household.paidAmount;
    setPaymentAmount(remaining > 0 ? remaining : 0);
    setPaymentNote(household.note || '');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!selectedHousehold) return;
    setIsProcessing(true);
    try {
      const success = await confirmPayment({
        payment_id: selectedHousehold.paymentId,
        amount: paymentAmount, // Gửi số tiền thực nộp (có thể thiếu)
        payment_method: 'Cash',
        note: paymentNote,
      });

      if (success) {
        // Thông báo thông minh hơn
        if (paymentAmount < selectedHousehold.totalAmount) {
          toast.success('Đã ghi nhận nộp 1 phần (còn thiếu)!');
        } else {
          toast.success('Đã xác nhận thu đủ tiền!');
        }
        setShowPaymentModal(false);
        setSelectedHousehold(null);
        // Refresh data để cập nhật trạng thái mới
        if (selectedRateId)
          fetchPayments({ rate_id: selectedRateId, limit: 5000 });
      } else {
        toast.error('Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = (household: HouseholdFeeUI) => {
    toast.success(`Đang in hóa đơn cho hộ ${household.householdCode}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Danh sách khoản thu phí cố định
      </h2>

      {/* Accordion */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {currentCategory?.item_type || 'Chưa chọn khoản thu'}
            </h3>
          </div>
          {currentCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingRate(currentCategory?.amount || 0);
                setShowRateModal(true);
              }}
              className="p-2 rounded-lg border border-input hover:bg-muted/10"
            >
              <Edit className="w-4 h-4 text-first dark:text-darkmodetext" />
            </button>
          )}
        </div>

        {/* Content */}
        {isExpanded && currentCategory && (
          <div className="p-0 border-t border-border">
            <div className="p-5 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label="Mức thu"
                  value={`${Number(currentCategory.amount).toLocaleString()} VND`}
                  subtext="/ tháng / người"
                />
                <StatCard
                  label="Hộ đã thu"
                  value={clientStats.paid}
                  subtext={`/${rawHouseholds.length} hộ`}
                  color="green"
                />
                <StatCard
                  label="Nộp 1 phần"
                  value={clientStats.partial}
                  subtext={`/${rawHouseholds.length} hộ`}
                  color="yellow"
                />
                <StatCard
                  label="Hộ chưa thu"
                  value={clientStats.pending}
                  subtext={`/${rawHouseholds.length} hộ`}
                  color="red"
                />
              </div>

              {/* FILTER BAR */}
              <FeeFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterStatus={statusFilter}
                setFilterStatus={setStatusFilter}
                resetPage={() => setCurrentPage(1)}
              />

              {/* TABLE */}
              {/* <div className="overflow-x-auto border border-border rounded-t-lg min-h-[300px]">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/10">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-foreground">Mã hộ</th>
                      <th className="py-2 px-3 text-foreground">CCCD chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Địa chỉ</th>
                      <th className="py-2 px-3 text-foreground">Số người</th>
                      <th className="py-2 px-3 text-foreground">Cần thu</th>
                      <th className="py-2 px-3 text-foreground">Trạng thái</th>
                      <th className="py-2 px-3 text-foreground">Ngày thu</th>
                      <th className="py-2 px-3 text-foreground">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <Loader className="animate-spin w-5 h-5" /> Đang tải
                            dữ liệu...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedHouseholds.length > 0 ? (
                      paginatedHouseholds.map((h) => (
                        <tr
                          key={h.paymentId}
                          className="border-t border-border hover:bg-muted/5"
                        >
                          <td className="py-2 px-3 text-foreground">
                            {h.householdCode}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.headCCCD}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.headName}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.address}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.memberCount}
                          </td>
                          <td className="py-2 px-3 text-foreground font-semibold">
                            {h.totalAmount.toLocaleString()} VND
                          </td>
                          <td className="py-2 px-3">
                            {h.status === 'paid' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Đã thu
                              </span>
                            )}
                            {(h.status === 'pending' ||
                              h.status === ('unpaid' as any)) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Chưa thu
                              </span>
                            )}
                            {h.status === 'partial' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Nộp thiếu
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-foreground">
                            {h.paidDate || '-'}
                          </td>
                          <td className="py-2 px-3">
                            {h.status === 'paid' ? (
                              <button
                                onClick={() => handlePrint(h)}
                                className="p-2 rounded-lg border border-input hover:bg-muted/10"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddPayment(h)}
                                className="p-2 rounded-lg border border-input hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-12 text-center text-muted-foreground"
                        >
                          {searchQuery
                            ? 'Không tìm thấy kết quả phù hợp'
                            : 'Danh sách trống'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div> */}
              {/* Table */}
              <div className="overflow-x-auto border border-border rounded-t-lg min-h-[300px]">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/10">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-foreground">Mã hộ</th>
                      <th className="py-2 px-3 text-foreground">CCCD chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Chủ hộ</th>
                      <th className="py-2 px-3 text-foreground">Địa chỉ</th>
                      <th className="py-2 px-3 text-foreground">Số người</th>
                      {/* SỬA TIÊU ĐỀ CỘT TIỀN */}
                      <th className="py-2 px-3 text-foreground">Cần thu</th>
                      <th className="py-2 px-3 text-foreground">Trạng thái</th>
                      <th className="py-2 px-3 text-foreground">Ngày thu</th>
                      <th className="py-2 px-3 text-foreground">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <Loader className="animate-spin w-5 h-5" /> Đang tải
                            dữ liệu...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedHouseholds.length > 0 ? (
                      paginatedHouseholds.map((h) => {
                        // TÍNH TOÁN SỐ TIỀN CÒN LẠI
                        const remainingAmount = h.totalAmount - h.paidAmount;

                        return (
                          <tr
                            key={h.paymentId}
                            className="border-t border-border hover:bg-muted/5"
                          >
                            <td className="py-2 px-3 text-foreground">
                              {h.householdCode}
                            </td>
                            <td className="py-2 px-3 text-foreground">
                              {h.headCCCD}
                            </td>
                            <td className="py-2 px-3 text-foreground">
                              {h.headName}
                            </td>
                            <td
                              className="py-2 px-3 text-foreground max-w-[200px] truncate"
                              title={h.address}
                            >
                              {h.address}
                            </td>
                            <td className="py-2 px-3 text-foreground">
                              {h.memberCount}
                            </td>

                            {/* HIỂN THỊ SỐ TIỀN CÒN LẠI */}
                            <td className="py-2 px-3 text-foreground">
                              <div className="font-semibold text-primary">
                                {remainingAmount > 0
                                  ? remainingAmount.toLocaleString()
                                  : 0}{' '}
                                VND
                              </div>
                              {/* Nếu nộp 1 phần, hiển thị tổng gốc bên dưới cho rõ */}
                              {h.status === 'partial' && (
                                <div className="text-xs text-muted-foreground">
                                  Tổng: {h.totalAmount.toLocaleString()}
                                </div>
                              )}
                            </td>

                            <td className="py-2 px-3">
                              {h.status === 'paid' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Đã thu
                                </span>
                              )}
                              {(h.status === 'pending' ||
                                h.status === ('unpaid' as any)) && (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Chưa thu
                                </span>
                              )}
                              {h.status === 'partial' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  Nộp thiếu
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-foreground">
                              {h.paidDate || '-'}
                            </td>
                            <td className="py-2 px-3">
                              {h.status === 'paid' ? (
                                <button
                                  onClick={() => handlePrint(h)}
                                  className="p-2 rounded-lg border border-input hover:bg-muted/10"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddPayment(h)}
                                  className="p-2 rounded-lg border border-input hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400"
                                  title="Thu tiền"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-12 text-center text-muted-foreground"
                        >
                          {searchQuery
                            ? 'Không tìm thấy kết quả phù hợp'
                            : 'Danh sách trống'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            {sortedHouseholds.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={Math.ceil(sortedHouseholds.length / ITEMS_PER_PAGE)}
                totalItems={sortedHouseholds.length}
                pageSize={ITEMS_PER_PAGE}
                startIdx={(currentPage - 1) * ITEMS_PER_PAGE}
                currentCount={paginatedHouseholds.length}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showRateModal && currentCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowRateModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Điều chỉnh mức thu</h3>
              <button onClick={() => setShowRateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mức thu (VND / tháng / người)
                </label>
                <input
                  type="number"
                  value={editingRate}
                  onChange={(e) => setEditingRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border bg-card"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/10"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveRate}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex justify-center gap-2 items-center"
                >
                  {isProcessing ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}{' '}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {showPaymentModal && selectedHousehold && currentCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Xác nhận thu tiền</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-muted/20 rounded-lg space-y-1">
                <p className="text-sm opacity-70">
                  Mã hộ: {selectedHousehold.householdCode}
                </p>
                <p className="font-semibold">{selectedHousehold.headName}</p>
                <p className="text-sm opacity-70">
                  Số người: {selectedHousehold.memberCount}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm opacity-70">Mức thu:</span>
                  <span>
                    {Number(currentCategory.amount).toLocaleString()} VND
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm opacity-70">Nhân khẩu:</span>
                  <span>× {selectedHousehold.memberCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary/20">
                  <span className="font-semibold">Tổng tiền:</span>
                  <span className="text-lg font-bold text-primary">
                    {selectedHousehold.totalAmount.toLocaleString()} VND
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/10"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex justify-center gap-2 items-center"
                >
                  {isProcessing ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}{' '}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedHousehold && currentCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Xác nhận thu tiền</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin hộ */}
              <div className="p-3 bg-muted/20 rounded-lg space-y-1">
                <p className="text-sm opacity-70">
                  Mã hộ:{' '}
                  <span className="font-medium text-foreground">
                    {selectedHousehold.householdCode}
                  </span>
                </p>
                <p className="font-semibold">{selectedHousehold.headName}</p>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">
                    Nhân khẩu: {selectedHousehold.memberCount}
                  </span>
                  <span className="opacity-70">
                    Mức thu: {Number(currentCategory.amount).toLocaleString()} đ
                  </span>
                </div>
              </div>

              {/* Input Số tiền thực nộp */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Số tiền thực nộp (VND)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold text-lg"
                />

                {/* Gợi ý trạng thái dựa trên số tiền nhập */}
                {/* <div className="mt-2 text-sm">
                  {paymentAmount >= selectedHousehold.totalAmount ? (
                    <span className="text-green-600 flex items-center gap-1">
                      ✓ Đủ tiền (Hoàn tất)
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      ⚠ Còn thiếu:{' '}
                      <b>
                        {(
                          selectedHousehold.totalAmount - paymentAmount
                        ).toLocaleString()}{' '}
                        VND
                      </b>{' '}
                      (Nộp 1 phần)
                    </span>
                  )}
                </div> */}
                {/* Gợi ý tính toán */}
                <div className="mt-2 text-xs">
                  {(() => {
                    const remaining =
                      selectedHousehold.totalAmount -
                      selectedHousehold.paidAmount;
                    const afterPayment = remaining - paymentAmount;

                    if (afterPayment <= 0)
                      return (
                        <span className="text-green-600">
                          ✓ Sẽ hoàn thành đóng phí
                        </span>
                      );
                    return (
                      <span className="text-yellow-600">
                        ⚠ Vẫn còn thiếu:{' '}
                        <b>{afterPayment.toLocaleString()} đ</b> (Sẽ ghi nhận
                        Nộp 1 phần)
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Input Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="VD: Người nộp là con trai..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/10 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={isProcessing || paymentAmount < 0}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex justify-center gap-2 items-center hover:bg-primary/90 transition shadow-sm"
                >
                  {isProcessing ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function StatCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}) {
  const colorClass =
    color === 'green'
      ? 'text-green-600 dark:text-green-400'
      : color === 'red'
        ? 'text-red-600 dark:text-red-400'
        : color === 'blue'
          ? 'text-blue-600 dark:text-blue-400'
          : color === 'yellow'
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-foreground';
  return (
    <div className="p-4 bg-muted/10 rounded-lg">
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtext && <p className="text-xs opacity-70">{subtext}</p>}
    </div>
  );
}
