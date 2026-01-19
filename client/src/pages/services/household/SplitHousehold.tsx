"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Search, Users, X, Save, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as HouseholdAPI from "@/api/household.api";
import PaginationBar from "@/components/PaginationBar";

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
  registrationDate?: string;
}

interface FormErrors {
  [key: string]: string;
}

const ITEMS_PER_PAGE = 10;

function toTableHouseholdItem(h: any): TableHouseholdItem {
  const head = Array.isArray(h?.residents)
    ? h.residents.find((m: any) => m?.HouseholdMembership?.is_head || m?.is_head)
    : h?.headPerson || h?.head || null;
  const headNameValue =
    head?.full_name ??
    h?.headPerson?.full_name ??
    h?.head_full_name ??
    h?.head_name ??
    h?.owner_full_name ??
    h?.chu_ho_name ??
    h?.household_head_name ??
    h?.headName ??
    "";
  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(headNameValue),
    address: String(h?.address ?? ""),
    membersCount: Number(
      h?.members_count ?? h?.memberCount ?? (Array.isArray(h?.residents) ? h.residents.length : 0)
    ),
    registrationDate: String(h?.registration_date ?? h?.created_at ?? ""),
  };
}

export default function SplitHousehold() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialId = params.get("household_no") || params.get("id") || params.get("code") || "";
  const [searchQuery, setSearchQuery] = useState(initialId);
  const [sortBy, setSortBy] = useState<"headName" | "memberCount" | "date" | "codeAsc" | "codeDesc">("headName");
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HouseholdItem | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newHead, setNewHead] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHouseholdCode, setNewHouseholdCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load all households from backend (same as HouseholdList)
  useEffect(() => {
    const fetchAll = async () => {
      setListLoading(true);
      setListError(null);
      try {
        const limit = 500;
        let page = 1;
        const acc: any[] = [];
        // Loop pages until fewer than limit results are returned
        while (true) {
          const resp = await HouseholdAPI.getHouseholds({ page, limit });
          const arr = Array.isArray(resp) ? resp : Array.isArray(resp?.rows) ? resp.rows : [];
          acc.push(...arr);
          if (arr.length < limit) break;
          page += 1;
          // Safety stop to avoid infinite loops if backend misreports
          if (page > 1000) break;
        }
        setAllData(acc);
      } catch (e: any) {
        setListError(e?.message || "Không tải được toàn bộ hộ khẩu");
      } finally {
        setListLoading(false);
      }
    };
    fetchAll();
  }, []);

  const sourceHouseholds: TableHouseholdItem[] = useMemo(() => {
    return allData.map(toTableHouseholdItem);
  }, [allData]);

  // Auto-select household from query params
  useEffect(() => {
    if (!initialId || sourceHouseholds.length === 0) return;
    
    const found = sourceHouseholds.find(
      (h) => h.code === initialId || h.id === initialId
    );
    
    if (found && !selected) {
      handleSelect(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId, sourceHouseholds]);

  // Filter & Sort (same as HouseholdList)
  const filteredHouseholds = useMemo(() => {
    const result = sourceHouseholds.filter((household) => {
      const matchSearch =
        household.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.address.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });

    // Sort
    if (sortBy === "headName") {
      result.sort((a, b) => a.headName.localeCompare(b.headName));
    } else if (sortBy === "memberCount") {
      result.sort((a, b) => b.membersCount - a.membersCount);
    } else if (sortBy === "date") {
      // Sort by created_at (registrationDate) descending - newest first
      result.sort((a, b) => {
        const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
        const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
        return dateB - dateA; // Descending order
      });
    } else if (sortBy === "codeAsc") {
      // Sort by household code ascending
      result.sort((a, b) => {
        const codeA = a.code.toLowerCase();
        const codeB = b.code.toLowerCase();
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
      });
    } else if (sortBy === "codeDesc") {
      // Sort by household code descending
      result.sort((a, b) => {
        const codeA = a.code.toLowerCase();
        const codeB = b.code.toLowerCase();
        return codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

    return result;
  }, [searchQuery, sortBy, sourceHouseholds]);

  // Pagination
  const totalPages = Math.ceil(filteredHouseholds.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHouseholds = filteredHouseholds.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

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
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc!");
      return;
    }
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
        toast.success("Tách hộ thành công!", { duration: 3000 });
        navigate(`/households/${newHouseholdId}`);
      } else {
        // Fallback: inform user and go to list
        if (newHouseholdCodeRes) {
          toast.success(`Tách hộ thành công. Mã hộ mới: ${newHouseholdCodeRes}`, { duration: 3000 });
        } else {
          toast.success("Tách hộ thành công!", { duration: 3000 });
        }
        navigate("/households");
      }
    } catch (err) {
      console.error(err);
      const e: any = err as any;
      const message = e?.response?.data?.message || e?.message || "Tách hộ thất bại. Vui lòng thử lại!";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- TOASTER --- */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: {
            border: "1px solid #713200",
            padding: "16px",
            color: "#713200",
          },
          duration: 3500,
        }}
      />
      {/* Search & Filter Section */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hộ, tên chủ hộ, địa chỉ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
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
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-second dark:text-darkmodetext/60" />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-3">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "headName" | "memberCount" | "date" | "codeAsc" | "codeDesc");
              setCurrentPage(1);
            }}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-white dark:bg-transparent dark:border
              border border-second/40 dark:border-second/30
              text-first dark:text-darkmodetext
              focus:outline-none focus:ring-1 focus:ring-selectring transition
            "
          >
            <option value="headName">Sắp xếp theo tên chủ hộ</option>
            <option value="memberCount">Sắp xếp theo số thành viên</option>
            <option value="date">Sắp xếp theo thời gian thêm vào hệ thống</option>
            <option value="codeAsc">Sắp xếp theo mã hộ tăng dần</option>
            <option value="codeDesc">Sắp xếp theo mã hộ giảm dần</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {listLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-third animate-spin" />
          </div>
        ) : listError ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 font-semibold">Đã xảy ra lỗi</p>
              <p className="text-second dark:text-darkmodetext/70 mt-1">{listError}</p>
            </div>
          </div>
        ) : paginatedHouseholds.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-second dark:text-darkmodetext/70 text-lg">
                Không tìm thấy hộ khẩu nào
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-second/40 dark:border-second/30 bg-second/5 dark:bg-second/10">
                    <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                      Mã hộ
                    </th>
                    <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                      Chủ hộ
                    </th>
                    <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                      Số người
                    </th>
                    <th className="px-4 py-3 text-center text-first dark:text-darkmodetext font-semibold">
                      Chọn
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHouseholds.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                    >
                      <td className="px-4 py-3 text-first dark:text-darkmodetext font-medium">
                        {h.code}
                      </td>
                      <td className="px-4 py-3 text-first dark:text-darkmodetext">
                        {h.headName || "—"}
                      </td>
                      <td className="px-4 py-3 text-first dark:text-darkmodetext max-w-xs truncate">
                        {h.address}
                      </td>
                      <td className="px-4 py-3 text-first dark:text-darkmodetext">
                        {h.membersCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSelect(h)}
                          className="p-2 rounded-lg border border-border hover:bg-muted/20 text-first dark:text-darkmodetext transition"
                          title="Chọn hộ để tách"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredHouseholds.length}
              startIdx={startIdx}
              pageSize={ITEMS_PER_PAGE}
              currentCount={paginatedHouseholds.length}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
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








