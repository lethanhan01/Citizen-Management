"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, X, Save, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as HouseholdAPI from "@/api/household.api";

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

interface TableHouseholdItem {
  id: string;
  code: string;
  headName: string;
  address: string;
  membersCount: number;
}

interface FormErrors {
  [key: string]: string;
}

// Backend-connected households list
// Loaded via API: getHouseholds() then mapped for table display

export default function SplitHousehold() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [households, setHouseholds] = useState<TableHouseholdItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selected, setSelected] = useState<HouseholdItem | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newHead, setNewHead] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHouseholdCode, setNewHouseholdCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load households from backend
  useEffect(() => {
    const load = async () => {
      setListLoading(true);
      try {
        const list = await HouseholdAPI.getHouseholds({ page: 1, limit: 200 });
        const arr = Array.isArray(list) ? list : Array.isArray(list?.rows) ? list.rows : [];
        const mapped: TableHouseholdItem[] = arr.map((h: any) => ({
          id: String(h?.household_id ?? h?.id ?? ""),
          code: String(h?.household_no ?? h?.code ?? ""),
          headName: String(h?.headPerson?.full_name ?? h?.head_name ?? ""),
          address: String(h?.address ?? ""),
          membersCount: Number(h?.members_count ?? h?.membersCount ?? 0),
        }));
        setHouseholds(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return households;
    return households.filter((h) =>
      [h.code, h.headName].some((v) => v.toLowerCase().includes(term))
    );
  }, [search, households]);

  const handleSelect = async (household: TableHouseholdItem) => {
    setDetailLoading(true);
    try {
      const detail = await HouseholdAPI.getHouseholdById(household.id);
      const residents = Array.isArray(detail?.residents) ? detail.residents : [];
      const members: Member[] = residents.map((m: any) => ({
        id: String(m?.person_id ?? m?.id ?? ""),
        fullName: String(m?.full_name ?? m?.fullName ?? m?.name ?? ""),
        cccd: String(m?.citizen_id_num ?? m?.cccd ?? ""),
        relationship: String(m?.HouseholdMembership?.relation_to_head ?? m?.relation_to_head ?? ""),
        isHead: Boolean(m?.HouseholdMembership?.is_head ?? false),
      }));
      setSelected({
        id: household.id,
        code: household.code,
        headName: household.headName,
        address: household.address,
        members,
      });
      setSelectedMembers([]);
      setNewHead("");
      setNewAddress("");
      setNewHouseholdCode("");
      setErrors({});
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const closeForm = () => {
    setSelected(null);
    setSelectedMembers([]);
    setNewHead("");
    setNewAddress("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (selectedMembers.length === 0) newErrors.members = "Phải chọn ít nhất 1 người";
    if (!newHead) newErrors.newHead = "Phải chọn chủ hộ mới";
    if (!selectedMembers.includes(newHead)) newErrors.newHead = "Chủ hộ mới phải thuộc danh sách tách";
    if (!newHouseholdCode.trim()) newErrors.newHouseholdCode = "Phải nhập mã hộ mới";
    if (!newAddress.trim()) newErrors.newAddress = "Phải nhập địa chỉ hộ mới";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        hoKhauCuId: selected!.id,
        thongTinHoKhauMoi: {
          household_no: newHouseholdCode.trim(),
          address: newAddress.trim(),
        },
        chuHoMoiId: newHead,
        danhSachNhanKhauTachDi: selectedMembers,
      };
      const result = await HouseholdAPI.splitHousehold(payload);
      const newHouseholdId = String(
        result?.newHousehold?.household_id ?? result?.newHousehold?.id ?? ""
      );
      const newHouseholdCodeRes = String(
        result?.newHousehold?.household_no ?? result?.newHousehold?.code ?? ""
      );
      closeForm();
      if (newHouseholdId) {
        navigate(`/households/${newHouseholdId}`);
      } else {
        // Fallback: inform user and go to list
        if (newHouseholdCodeRes) {
          window.alert(`Tách hộ thành công. Mã hộ mới: ${newHouseholdCodeRes}`);
        }
        navigate("/households");
      }
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
                <th className="py-3 px-2">Chủ hộ</th>
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
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.membersCount}</td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleSelect(h)}
                      className="p-2 rounded-lg border border-border hover:bg-muted/20 text-first dark:text-darkmodetext"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-second dark:text-darkmodetext/70" colSpan={5}>
                    {listLoading ? (
                      <span className="inline-flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Đang tải...</span>
                    ) : (
                      "Không tìm thấy"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-first dark:text-darkmodetext">Tách hộ - {selected.code}</h3>
              <button onClick={closeForm} className="p-2 hover:bg-muted/10 rounded-lg">
                <X className="w-5 h-5 text-first dark:text-darkmodetext" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="text-sm text-second dark:text-darkmodetext/70">Hộ gốc:</p>
                <p className="font-semibold text-first dark:text-darkmodetext">{selected.code} - {selected.headName}</p>
                <p className="text-xs text-second dark:text-darkmodetext/70">{selected.address}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Chọn thành viên tách ra <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                  {detailLoading ? (
                    <div className="flex items-center gap-2 text-second"><Loader className="w-4 h-4 animate-spin" /> Đang tải chi tiết...</div>
                  ) : (
                    selected.members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted/10 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => toggleMember(member.id)}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-first dark:text-darkmodetext">{member.fullName}</span>
                          <span className="text-xs text-second dark:text-darkmodetext/70 ml-2">({member.relationship || (member.isHead ? "Chủ hộ" : "Thành viên")})</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {errors.members && <p className="text-xs text-red-500 mt-1">{errors.members}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-2">
                  Chọn chủ hộ mới <span className="text-red-500">*</span>
                </label>
                <select
                  value={newHead}
                  onChange={(e) => {
                    setNewHead(e.target.value);
                    if (errors.newHead) setErrors((prev) => ({ ...prev, newHead: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.newHead ? "border-red-500" : "border-input"} bg-card text-first dark:text-darkmodetext focus:outline-none focus:ring-1 focus:ring-selectring`}
                >
                  <option value="">-- Chọn chủ hộ mới --</option>
                  {selected.members
                    .filter((m) => selectedMembers.includes(m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName}
                      </option>
                    ))}
                </select>
                {errors.newHead && <p className="text-xs text-red-500 mt-1">{errors.newHead}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Mã hộ khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  value={newHouseholdCode}
                  onChange={(e) => setNewHouseholdCode(e.target.value)}
                  placeholder="VD: HK1234"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.newHouseholdCode ? "border-red-500" : "border-input"} bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring`}
                />
                {errors.newHouseholdCode && <p className="text-xs text-red-500 mt-1">{errors.newHouseholdCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-first dark:text-darkmodetext mb-1">
                  Địa chỉ thường trú mới <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-1 focus:ring-selectring"
                />
                {errors.newAddress && <p className="text-xs text-red-500 mt-1">{errors.newAddress}</p>}
              </div>

              <p className="text-xs text-second dark:text-darkmodetext/60">
                Vui lòng nhập mã hộ và địa chỉ cho hộ mới. Các thành viên được chọn sẽ tách khỏi hộ gốc.
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








