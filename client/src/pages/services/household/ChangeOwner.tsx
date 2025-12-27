"use client";

import { useMemo, useState } from "react";
import { Search, UserCheck, X, Save, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Member {
  id: string;
  fullName: string;
  cccd: string;
  relationship: string;
  isHead: boolean;
}

interface HouseholdItem {
  id: string;
  code: string;
  headName: string;
  address: string;
  members: Member[];
}

interface FormErrors {
  [key: string]: string;
}

const MOCK_HOUSEHOLDS: HouseholdItem[] = [
  {
    id: "1",
    code: "HK001",
    headName: "Nguyễn Văn A",
    address: "123 Lê Lợi, Q1, HCM",
    members: [
      { id: "1", fullName: "Nguyễn Văn A", cccd: "012345678901", relationship: "Chủ hộ", isHead: true },
      { id: "2", fullName: "Nguyễn Thị B", cccd: "012345678902", relationship: "Vợ", isHead: false },
      { id: "3", fullName: "Nguyễn Văn C", cccd: "012345678903", relationship: "Con", isHead: false },
    ],
  },
  {
    id: "2",
    code: "HK002",
    headName: "Trần Văn E",
    address: "45 Nguyễn Trãi, Hà Nội",
    members: [
      { id: "5", fullName: "Trần Văn E", cccd: "098765432101", relationship: "Chủ hộ", isHead: true },
      { id: "6", fullName: "Trần Thị F", cccd: "098765432102", relationship: "Vợ", isHead: false },
    ],
  },
];

export default function ChangeOwner() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HouseholdItem | null>(null);
  const [newHeadId, setNewHeadId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK_HOUSEHOLDS;
    return MOCK_HOUSEHOLDS.filter((h) =>
      [h.code, h.headName].some((v) => v.toLowerCase().includes(term))
    );
  }, [search]);

  const handleSelect = (household: HouseholdItem) => {
    setSelected(household);
    setNewHeadId("");
    setErrors({});
  };

  const closeForm = () => {
    setSelected(null);
    setNewHeadId("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!newHeadId) newErrors.newHead = "Phải chọn chủ hộ mới";
    if (newHeadId === selected?.members.find((m) => m.isHead)?.id) {
      newErrors.newHead = "Không thể chọn chủ hộ hiện tại";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Logic: Update isHead flag for old and new head
      // Close popup after successful save
      closeForm();
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
            placeholder="Tìm theo mã hộ, tên chủ hộ..."
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
                <th className="py-3 px-2">Mã hộ</th>
                <th className="py-3 px-2">Chủ hộ hiện tại</th>
                <th className="py-3 px-2">Địa chỉ</th>
                <th className="py-3 px-2">Số người</th>
                <th className="py-3 px-2 text-center">Chọn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-border/50 hover:bg-muted/10 transition"
                >
                  <td className="py-3 px-2 font-medium text-first dark:text-darkmodetext">{h.code}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.headName}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.address}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.members.length}</td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleSelect(h)}
                      className="p-2 rounded-lg border border-border hover:bg-muted/20 text-first dark:text-darkmodetext"
                    >
                      <UserCheck className="w-4 h-4" />
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

      {/* Change Owner Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">
                Thay đổi chủ hộ - {selected.code}
              </h3>
              <button onClick={closeForm} className="p-2 hover:bg-muted/10 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="text-sm text-second dark:text-darkmodetext/70">Hộ:</p>
                <p className="font-semibold text-first dark:text-darkmodetext">{selected.code} - {selected.headName}</p>
                <p className="text-xs text-second dark:text-darkmodetext/70">{selected.address}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Chọn chủ hộ mới <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 border border-border rounded-lg p-3">
                  {selected.members
                    .filter((m) => !m.isHead)
                    .map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted/10 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="newHead"
                          value={member.id}
                          checked={newHeadId === member.id}
                          onChange={(e) => {
                            setNewHeadId(e.target.value);
                            if (errors.newHead) setErrors((prev) => ({ ...prev, newHead: "" }));
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-first dark:text-darkmodetext">{member.fullName}</span>
                          <span className="text-xs text-second dark:text-darkmodetext/70 ml-2">({member.relationship})</span>
                        </div>
                      </label>
                    ))}
                  {selected.members.filter((m) => !m.isHead).length === 0 && (
                    <p className="text-sm text-second dark:text-darkmodetext/70 text-center py-2">
                      Không có thành viên khác trong hộ
                    </p>
                  )}
                </div>
                {errors.newHead && <p className="text-xs text-red-500 mt-1">{errors.newHead}</p>}
              </div>

              <p className="text-xs text-second dark:text-darkmodetext/60">
                Người được chọn sẽ trở thành chủ hộ mới. Chủ hộ cũ sẽ trở thành thành viên thường.
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
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-third text-first hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
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








