"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, X, Save, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CitizenItem {
  id: string;
  cccd: string;
  fullName: string;
  dateOfBirth: string;
  gender: "Nam" | "Nữ";
  householdCode: string;
  address: string;
  status: string;
}

interface FormErrors {
  [key: string]: string;
}

const MOCK_CITIZENS: CitizenItem[] = [
  {
    id: "1",
    cccd: "012345678901",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1990-05-12",
    gender: "Nam",
    householdCode: "HK001",
    address: "123 Lê Lợi, Q1, HCM",
    status: "Thường trú",
  },
  {
    id: "2",
    cccd: "098765432109",
    fullName: "Trần Thị B",
    dateOfBirth: "1995-11-23",
    gender: "Nữ",
    householdCode: "HK002",
    address: "45 Nguyễn Trãi, Hà Nội",
    status: "Tạm trú",
  },
  {
    id: "3",
    cccd: "123456789012",
    fullName: "Phạm Văn C",
    dateOfBirth: "1988-03-05",
    gender: "Nam",
    householdCode: "HK003",
    address: "88 Hai Bà Trưng, Đà Nẵng",
    status: "Thường trú",
  },
];

export default function MergeHousehold() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CitizenItem | null>(null);
  const [targetHouseholdCode, setTargetHouseholdCode] = useState("");
  const [targetHeadName, setTargetHeadName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK_CITIZENS;
    return MOCK_CITIZENS.filter((c) =>
      [c.fullName, c.cccd].some((v) => v.toLowerCase().includes(term))
    );
  }, [search]);

  const handleSelect = (citizen: CitizenItem) => {
    setSelected(citizen);
    setTargetHouseholdCode("");
    setTargetHeadName("");
    setErrors({});
  };

  const closeForm = () => {
    setSelected(null);
    setTargetHouseholdCode("");
    setTargetHeadName("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!targetHouseholdCode.trim()) newErrors.targetHouseholdCode = "Bắt buộc";
    if (!targetHeadName.trim()) newErrors.targetHeadName = "Bắt buộc";
    if (targetHouseholdCode === selected?.householdCode) {
      newErrors.targetHouseholdCode = "Không thể nhập vào cùng hộ hiện tại";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Logic: Remove from old household, add to target household
      navigate("/households");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo họ tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-lg
              bg-white dark:bg-transparent dark:border
              border border-second/40 dark:border-second/30
              text-first dark:text-darkmodetext
              placeholder:text-second dark:placeholder:text-darkmodetext/40
              focus:outline-none focus:ring-1 focus:ring-selectring transition
            "
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-second dark:text-darkmodetext/60" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-second dark:text-darkmodetext/70 border-b border-border">
                <th className="py-3 px-2">Họ tên</th>
                <th className="py-3 px-2">CCCD</th>
                <th className="py-3 px-2">Mã hộ hiện tại</th>
                <th className="py-3 px-2">Địa chỉ</th>
                <th className="py-3 px-2 text-center">Chọn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/50 hover:bg-muted/10 transition"
                >
                  <td className="py-3 px-2 font-medium text-first dark:text-darkmodetext">
                    {c.fullName}
                  </td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.cccd}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.householdCode}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{c.address}</td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleSelect(c)}
                      className="p-2 rounded-lg border border-border hover:bg-muted/20 text-first dark:text-darkmodetext"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-second dark:text-darkmodetext/70" colSpan={5}>
                    Không tìm thấy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Merge Form Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
                Nhập vào hộ khác
              </h3>
              <button onClick={closeForm} className="p-2 hover:bg-muted/10 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="text-sm text-second dark:text-darkmodetext/70">Người được chọn:</p>
                <p className="font-semibold text-first dark:text-darkmodetext">{selected.fullName}</p>
                <p className="text-xs text-second dark:text-darkmodetext/70">CCCD: {selected.cccd}</p>
                <p className="text-xs text-second dark:text-darkmodetext/70">Hộ hiện tại: {selected.householdCode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Mã hộ gia đình đích <span className="text-red-500">*</span>
                </label>
                <input
                  value={targetHouseholdCode}
                  onChange={(e) => {
                    setTargetHouseholdCode(e.target.value);
                    if (errors.targetHouseholdCode) setErrors((prev) => ({ ...prev, targetHouseholdCode: "" }));
                  }}
                  placeholder="Nhập mã hộ muốn nhập vào"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.targetHouseholdCode ? "border-red-500" : "border-input"
                  } bg-card text-first dark:text-darkmodetext focus:outline-none focus:ring-1 focus:ring-selectring`}
                />
                {errors.targetHouseholdCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.targetHouseholdCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Tên chủ hộ đích <span className="text-red-500">*</span>
                </label>
                <input
                  value={targetHeadName}
                  onChange={(e) => {
                    setTargetHeadName(e.target.value);
                    if (errors.targetHeadName) setErrors((prev) => ({ ...prev, targetHeadName: "" }));
                  }}
                  placeholder="Nhập tên chủ hộ để xác nhận"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.targetHeadName ? "border-red-500" : "border-input"
                  } bg-card text-first dark:text-darkmodetext focus:outline-none focus:ring-1 focus:ring-selectring`}
                />
                {errors.targetHeadName && (
                  <p className="text-xs text-red-500 mt-1">{errors.targetHeadName}</p>
                )}
              </div>

              <p className="text-xs text-second dark:text-darkmodetext/60">
                Người này sẽ được xoá khỏi hộ <strong>{selected.householdCode}</strong> và thêm vào hộ đích.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-input text-first dark:text-darkmodetext hover:bg-muted/10 disabled:opacity-50"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleSave}
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
      )}
    </div>
  );
}








