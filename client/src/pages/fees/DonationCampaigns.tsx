"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Save,
  Loader,
} from "lucide-react";

interface DonationRecord {
  householdCode: string;
  headName: string;
  headCCCD: string;
  address: string;
  amount: number;
  donatedDate: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  donations: DonationRecord[];
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp1",
    name: "Chiến dịch 1: Hỗ trợ gia đình khó khăn",
    description: "Quyên góp hỗ trợ các gia đình gặp hoàn cảnh khó khăn trong khu phố",
    donations: [
      {
        householdCode: "HK001",
        headName: "Nguyễn Văn A",
        headCCCD: "001234567890",
        address: "123 Lê Lợi, Q1",
        amount: 200000,
        donatedDate: "2025-12-01",
      },
      {
        householdCode: "HK002",
        headName: "Trần Thị B",
        headCCCD: "001234567891",
        address: "45 Nguyễn Trãi, Q5",
        amount: 150000,
        donatedDate: "2025-12-03",
      },
    ],
  },
  {
    id: "camp2",
    name: "Chiến dịch 2: Xây dựng nhà văn hóa",
    description: "Quyên góp xây dựng và sửa chữa nhà văn hóa khu phố",
    donations: [
      {
        householdCode: "HK003",
        headName: "Phạm Văn C",
        headCCCD: "001234567892",
        address: "88 Hai Bà Trưng, Q3",
        amount: 500000,
        donatedDate: "2025-12-10",
      },
    ],
  },
];

const MOCK_ALL_HOUSEHOLDS = [
  { code: "HK001", headName: "Nguyễn Văn A", headCCCD: "001234567890", address: "123 Lê Lợi, Q1" },
  { code: "HK002", headName: "Trần Thị B", headCCCD: "001234567891", address: "45 Nguyễn Trãi, Q5" },
  { code: "HK003", headName: "Phạm Văn C", headCCCD: "001234567892", address: "88 Hai Bà Trưng, Q3" },
  { code: "HK004", headName: "Lê Thị D", headCCCD: "001234567893", address: "22 Lý Tự Trọng, Q1" },
];

export default function DonationCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>(["camp1"]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedHouseholdCode, setSelectedHouseholdCode] = useState("");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaigns((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId]
    );
  };

  const handleAddDonation = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedHouseholdCode("");
    setDonationAmount("");
    setShowDonationModal(true);
  };

  const handleAddNewCampaign = () => {
    setNewCampaignName("");
    setNewCampaignDesc("");
    setShowNewCampaignModal(true);
  };

  const handleSaveNewCampaign = async () => {
    if (!newCampaignName.trim()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newCampaign: Campaign = {
        id: `camp${campaigns.length + 1}`,
        name: newCampaignName,
        description: newCampaignDesc,
        donations: [],
      };
      setCampaigns([...campaigns, newCampaign]);
      setExpandedCampaigns([...expandedCampaigns, newCampaign.id]);
      setShowNewCampaignModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDonation = async () => {
    const amount = parseFloat(donationAmount);
    if (!selectedCampaignId || !selectedHouseholdCode || isNaN(amount) || amount <= 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const household = MOCK_ALL_HOUSEHOLDS.find((h) => h.code === selectedHouseholdCode);
      if (!household) return;

      const newDonation: DonationRecord = {
        householdCode: household.code,
        headName: household.headName,
        headCCCD: household.headCCCD,
        address: household.address,
        amount: parseFloat(donationAmount),
        donatedDate: new Date().toISOString().split("T")[0],
      };

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === selectedCampaignId ? { ...c, donations: [...c.donations, newDonation] } : c
        )
      );

      setShowDonationModal(false);
      setSelectedCampaignId(null);
      setSelectedHouseholdCode("");
      setDonationAmount("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        const isExpanded = expandedCampaigns.includes(campaign.id);
        const totalAmount = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
        const householdCount = campaign.donations.length;

        return (
          <div
            key={campaign.id}
            className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleCampaign(campaign.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDonation(campaign.id);
                }}
                className="p-2 rounded-lg border border-second/40 dark:border-second/30 hover:bg-second/10 dark:hover:bg-second/30"
              >
                <Plus className="w-4 h-4 text-third" />
              </button>
            </button>

            {/* Content */}
            {isExpanded && (
              <div className="p-5 border-t border-border space-y-6">
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
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">CCCD chủ hộ</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Chủ hộ</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Địa chỉ</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Số tiền</th>
                          <th className="py-2 px-3 text-first dark:text-darkmodetext">Ngày đóng góp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaign.donations.map((d, idx) => (
                          <tr key={idx} className="border-t border-border">
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">{d.householdCode}</td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">{d.headCCCD}</td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">{d.headName}</td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">{d.address}</td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext font-semibold">
                              {d.amount.toLocaleString()} VND
                            </td>
                            <td className="py-2 px-3 text-first dark:text-darkmodetext">{d.donatedDate}</td>
                          </tr>
                        ))}
                        {campaign.donations.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-second dark:text-darkmodetext/70">
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
                  Chọn hộ gia đình <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedHouseholdCode}
                  onChange={(e) => setSelectedHouseholdCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                >
                  <option value="">-- Chọn hộ --</option>
                  {MOCK_ALL_HOUSEHOLDS.map((h) => (
                    <option key={h.code} value={h.code}>
                      {h.code} - {h.headName}
                    </option>
                  ))}
                </select>
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
              </div>

              <p className="text-xs text-second dark:text-darkmodetext/60">
                Số tiền quyên góp sẽ được lưu lại cho hộ này trong chiến dịch.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDonationModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveDonation}
                  disabled={isLoading || !selectedHouseholdCode || !donationAmount || parseFloat(donationAmount) <= 0}
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
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewCampaignModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 text-first dark:text-darkmodetext hover:bg-second/10 dark:hover:bg-second/30 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveNewCampaign}
                  disabled={isLoading || !newCampaignName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg border border-second/40 dark:border-second/30 bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
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





