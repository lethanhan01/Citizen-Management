"use client";

import { useEffect, useState } from "react";
import { useCampaignStore } from "@/stores/campaign.store";
import { toast, Toaster } from "react-hot-toast";

import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Save,
  Loader,
  Pencil,
  Trash2,
} from "lucide-react";

export default function DonationCampaigns() {

const {
  campaigns,
  detailsById,
  loadingList,
  loadingDetailById,
  submitting,
  error,
  fetchCampaigns,
  fetchCampaignById,
  createCampaign,
  contribute,
  updateCampaign,
  deleteCampaign,
} = useCampaignStore();

  const [householdNo, setHouseholdNo] = useState("");
  const [expandedCampaigns, setExpandedCampaigns] = useState<number[]>([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  // const [householdId, setHouseholdId] = useState("");
  const [contributionDate, setContributionDate] = useState("");
  const [note, setNote] = useState("");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [newCampaignStart, setNewCampaignStart] = useState("");
  const [newCampaignEnd, setNewCampaignEnd] = useState<string>("");
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [editCampaignId, setEditCampaignId] = useState<number | null>(null);

  const [editCampaignName, setEditCampaignName] = useState("");
  const [editCampaignDesc, setEditCampaignDesc] = useState("");
  const [editCampaignStart, setEditCampaignStart] = useState("");
  const [editCampaignEnd, setEditCampaignEnd] = useState<string>("");


  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);


  const toggleCampaign = async (campaignId: number) => {
    setExpandedCampaigns((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId]
    );

    await fetchCampaignById(campaignId);
  };


  const handleAddDonation = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    // setHouseholdId("");
    setHouseholdNo("");
    setDonationAmount("");
    setContributionDate("");
    setNote("");
    setShowDonationModal(true);
  };


  const handleAddNewCampaign = () => {
    setNewCampaignName("");
    setNewCampaignDesc("");
    setShowNewCampaignModal(true);
  };

  const handleSaveNewCampaign = async () => {
    if (!newCampaignName.trim()) return;

    const ok = await createCampaign({
      name: newCampaignName.trim(),
      start_date: newCampaignStart || new Date().toISOString().split("T")[0],
      end_date: newCampaignEnd ? newCampaignEnd : null,
      description: newCampaignDesc?.trim() || "",
    });

    if (ok) {
      toast.success(`Tạo chiến dịch "${newCampaignName.trim()}" thành công!`);
      setShowNewCampaignModal(false);
      setExpandedCampaigns([]); // optional
    } else {
      toast.error("Tạo chiến dịch thất bại");
    }
  };


  const handleSaveDonation = async () => {
    const amount = Number(donationAmount);
    // const hhId = Number(householdId);

    if (!selectedCampaignId) return;
    // if (!hhId || Number.isNaN(hhId)) return;
    if (!householdNo.trim()) {
        toast.error("Vui lòng nhập mã hộ khẩu");
        return;
    }
    if (Number.isNaN(amount) || amount <= 0) return;

    const ok = await contribute({
      campaign_id: selectedCampaignId,
      household_no: householdNo.trim(),
      amount,
      contribution_date: contributionDate || undefined,
      note: note || undefined,
    });

    if (ok) {
      const campaignName = campaigns.find((c) => c.campaign_id === selectedCampaignId)?.name || `#${selectedCampaignId}`;
      toast.success(`Hộ ${householdNo.trim()} đã đóng góp ${amount.toLocaleString()} VND vào chiến dịch "${campaignName}"!`);
      setShowDonationModal(false);
      setSelectedCampaignId(null);
      // setHouseholdId("");
      setDonationAmount("");
      setContributionDate("");
      setNote("");
    } else {
      toast.error("Thêm đóng góp thất bại");
    }
  };

  const handleOpenEditCampaign = (campaign: any) => {
    setEditCampaignId(campaign.campaign_id);

    // prefill từ list (nếu list không có start/end thì vẫn sửa được name/end_date theo yêu cầu)
    setEditCampaignName(campaign.name ?? "");
    setEditCampaignDesc(campaign.description ?? "");
    setEditCampaignStart(campaign.start_date ?? "");
    setEditCampaignEnd(campaign.end_date ?? "");

    setShowEditCampaignModal(true);
  };

  const handleSaveEditCampaign = async () => {
    if (!editCampaignId) return;
    if (!editCampaignName.trim()) return;

    const ok = await updateCampaign(editCampaignId, {
      name: editCampaignName.trim(),
      description: editCampaignDesc?.trim() || "",
      // Nếu BE cho phép update start_date thì giữ lại; nếu không thì bỏ 2 dòng start_date/description tùy API của bạn
      start_date: editCampaignStart || undefined,
      end_date: editCampaignEnd ? editCampaignEnd : null,
    });

    if (ok) {
      setShowEditCampaignModal(false);
      setEditCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    const yes = window.confirm("Xóa chiến dịch này và toàn bộ lịch sử đóng góp liên quan?");
    if (!yes) return;

    const campaignName = campaigns.find((c) => c.campaign_id === campaignId)?.name || `#${campaignId}`;
    const ok = await deleteCampaign(campaignId);
    if (ok) {
      toast.success(`Đã xóa chiến dịch "${campaignName}"!`);
      // đóng panel nếu đang mở
      setExpandedCampaigns((prev) => prev.filter((id) => id !== campaignId));
    } else {
      toast.error("Xóa chiến dịch thất bại");
    }
  };




  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        {loadingList && (
          <div className="text-sm text-second dark:text-darkmodetext/70 mt-2">
            Đang tải danh sách chiến dịch...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 mt-2">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold text-first dark:text-darkmodetext">Danh sách chiến dịch quyên góp</h2>
        <button
          onClick={handleAddNewCampaign}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-third text-first hover:bg-third/90 transition"
        >
          <Plus className="w-4 h-4" />
          Thêm chiến dịch
        </button>
      </div>

      {campaigns.map((campaign) => {
        const id = campaign.campaign_id;
        const isExpanded = expandedCampaigns.includes(id);

        const detail = detailsById[id];
        const donations = detail?.contributions ?? [];

        const totalAmount =
          typeof detail?.total_collected === "number"
            ? detail.total_collected
            : donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

        const householdCount = donations.length;


        return (
          <div
            key={campaign.campaign_id}
            className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCampaign(campaign.campaign_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleCampaign(campaign.campaign_id);
              }}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-first dark:text-darkmodetext" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-first dark:text-darkmodetext" />
                )}
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">{campaign.name}</h3>
                  <p className="text-xs text-second dark:text-darkmodetext/70">{campaign.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Edit */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditCampaign(campaign);
                  }}
                  className="p-2 rounded-lg border border-second/40 dark:border-second/30 hover:bg-second/10 dark:hover:bg-second/30"
                  title="Sửa chiến dịch"
                >
                  <Pencil className="w-4 h-4 text-first dark:text-darkmodetext" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCampaign(campaign.campaign_id);
                  }}
                  className="p-2 rounded-lg border border-second/40 dark:border-second/30 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                  title="Xóa chiến dịch"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                {/* Add donation */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddDonation(campaign.campaign_id);
                  }}
                  className="p-2 rounded-lg border border-second/40 dark:border-second/30 hover:bg-second/10 dark:hover:bg-second/30"
                  title="Thêm đóng góp"
                >
                  <Plus className="w-4 h-4 text-third" />
                </button>
              </div>

            </div>


            {/* Content */}
            {isExpanded && (
              <div className="p-5 border-t border-border space-y-6">
                {loadingDetailById[id] && (
                  <div className="text-sm text-second dark:text-darkmodetext/70 flex items-center gap-2 mb-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang tải chi tiết...
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard label="Số hộ đóng góp" value={householdCount} color="blue" />
                  <StatCard
                    label="Tổng tiền quyên góp"
                    value={`${totalAmount.toLocaleString()} VND`}
                    color="green"
                  />
                </div>

                {/* Table */}
                <div>
                  <h4 className="text-sm font-semibold text-first dark:text-darkmodetext mb-3">
                    Danh sách đóng góp
                  </h4>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/10">
                        <tr className="text-left">
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Mã hộ</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Địa chỉ</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Số tiền</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Ngày đóng góp</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Ghi chú</th>
                        </tr>
                      </thead>

                      <tbody>
                        {donations.map((d: any) => (
                          <tr key={d.id} className="border-t border-border">
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">
                              {d.household?.household_no ?? "-"}
                            </td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">
                              {d.household?.address ?? "-"}
                            </td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext font-semibold">
                              {Number(d.amount || 0).toLocaleString()} VND
                            </td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">
                              {d.contribution_date ?? "-"}
                            </td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">
                              {d.note ?? ""}
                            </td>
                          </tr>
                        ))}
                        {donations.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-second dark:text-darkmodetext/70">
                              Chưa có hộ nào đóng góp
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
      })}

      {/* Donation Modal */}
      {showDonationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDonationModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Thêm đóng góp</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg"
              >
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Mã hộ khẩu (Household No) <span className="text-red-500">*</span>
                </label>
                <input
                  value={householdNo}
                  onChange={(e) => setHouseholdNo(e.target.value)}
                  placeholder="Nhập household_no (VD: HK123456)"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Số tiền quyên góp (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={donationAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setDonationAmount(value);
                  }}
                  placeholder="Nhập số tiền"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Ngày đóng góp (tuỳ chọn)
                </label>
                <input
                  type="date"
                  value={contributionDate}
                  onChange={(e) => setContributionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                />

                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Đóng lần 2"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                />

              </div>

              <p className="text-xs text-second dark:text-darkmodetext/60">
                Số tiền quyên góp sẽ được lưu lại cho hộ này trong chiến dịch.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDonationModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveDonation}
                  disabled={submitting || !householdNo.trim() || !donationAmount || Number(donationAmount) <= 0}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
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
      {/* Edit Campaign Modal */}
        {showEditCampaignModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowEditCampaignModal(false)}
          >
            <div
              className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Sửa chiến dịch</h3>
                <button
                  onClick={() => setShowEditCampaignModal(false)}
                  className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg"
                >
                  <X className="w-5 h-5 text-first dark:text-darkmodetext" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                    Tên chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editCampaignName}
                    onChange={(e) => setEditCampaignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={editCampaignDesc}
                    onChange={(e) => setEditCampaignDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={editCampaignStart}
                      onChange={(e) => setEditCampaignStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={editCampaignEnd}
                      onChange={(e) => setEditCampaignEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditCampaignModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSaveEditCampaign}
                    disabled={submitting || !editCampaignName.trim()}
                    className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
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

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowNewCampaignModal(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Tạo chiến dịch mới</h3>
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="p-2 hover:bg-second/10 dark:hover:bg-second/30 rounded-lg"
              >
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Tên chiến dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="VD: Hỗ trợ miền Trung"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Mô tả chiến dịch
                </label>
                <textarea
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  placeholder="Mô tả mục đích và nội dung chiến dịch"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={newCampaignStart}
                      onChange={(e) => setNewCampaignStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={newCampaignEnd}
                      onChange={(e) => setNewCampaignEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground"
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewCampaignModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveNewCampaign}
                  disabled={submitting || !newCampaignName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Tạo chiến dịch
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
  color,
}: {
  label: string;
  value: string | number;
  color?: "green" | "blue";
}) {
  
  return (
    <div className="p-4 bg-second/10 dark:bg-second/20 rounded-lg">
      <p className="text-xs text-second dark:text-darkmodetext/70 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          color === "green"
            ? "text-green-600 dark:text-green-400"
            : color === "blue"
            ? "text-blue-600 dark:text-blue-400"
            : "text-first dark:text-darkmodetext"
        }`}
      >
        {value}
      </p>
    </div>
  );
}





