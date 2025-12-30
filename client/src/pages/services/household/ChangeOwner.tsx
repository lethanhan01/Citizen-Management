"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Search, UserCheck, X, Save, Loader } from "lucide-react";
import { useHouseholdStore } from "@/stores/household.store";
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
  memberCount: number;
  members: Member[];
}

interface FormErrors {
  [key: string]: string;
}

function toHouseholdItem(h: any): HouseholdItem {
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

  const members: Member[] = Array.isArray(h?.residents)
    ? h.residents.map((m: any) => ({
        id: String(m?.person_id ?? m?.id ?? ""),
        fullName: String(m?.full_name ?? ""),
        cccd: String(m?.citizen_id_num ?? m?.citizen_id ?? ""),
        relationship: m?.HouseholdMembership?.relation_to_head ?? m?.relationship ?? "",
        isHead: Boolean(m?.HouseholdMembership?.is_head ?? m?.isHead ?? false),
      }))
    : [];

  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(headNameValue),
    address: String(h?.address ?? ""),
    memberCount: Number(
      h?.members_count ?? (Array.isArray(h?.residents) ? h.residents.length : 0)
    ),
    members,
  };
}

const ITEMS_PER_PAGE = 10;

export default function ChangeOwner() {
  const location = useLocation();
  const { data, loading, error, fetchHouseholds } = useHouseholdStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HouseholdItem | null>(null);
  const [newHeadId, setNewHeadId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<any[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);

  useEffect(() => {
    // Keep store fetch as fallback
    fetchHouseholds({ page: 1, limit: 500 });
    // Fetch all pages locally
    const fetchAll = async () => {
      setAllLoading(true);
      setAllError(null);
      try {
        const limit = 500;
        let page = 1;
        const acc: any[] = [];
        while (true) {
          const resp = await HouseholdAPI.getHouseholds({ page, limit });
          const arr = Array.isArray(resp) ? resp : Array.isArray((resp as any)?.rows) ? (resp as any).rows : [];
          acc.push(...arr);
          if (arr.length < limit) break;
          page += 1;
          if (page > 1000) break; // safety stop
        }
        setAllData(acc);
      } catch (e: any) {
        setAllError(e?.message || "Không tải được toàn bộ hộ khẩu");
      } finally {
        setAllLoading(false);
      }
    };
    fetchAll();
  }, [fetchHouseholds]);

  // Read household code from query param to prefill and auto-select
  const prefillCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("household_no") || params.get("code") || "";
  }, [location.search]);
  const prefilledRef = useRef(false);

  const sourceHouseholds: HouseholdItem[] = useMemo(() => {
    const arr = Array.isArray(allData) && allData.length > 0 ? allData : Array.isArray(data) ? data : [];
    return arr.map(toHouseholdItem);
  }, [allData, data]);

  useEffect(() => {
    if (!prefilledRef.current && prefillCode) {
      setSearch(prefillCode);
      setCurrentPage(1);
      const match = sourceHouseholds.find((h) => h.code === prefillCode);
      if (match) {
        // Open detail for the matched household
        (async () => {
          await handleSelect(match);
          prefilledRef.current = true;
        })();
      }
    }
  }, [prefillCode, sourceHouseholds]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sourceHouseholds;
    return sourceHouseholds.filter((h) =>
      [h.code, h.headName, h.address].some((v) => v.toLowerCase().includes(term))
    );
  }, [search, sourceHouseholds]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHouseholds = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSelect = async (household: HouseholdItem) => {
    setSelected(household);
    setNewHeadId("");
    setErrors({});
    try {
      setDetailLoading(true);
      const detail = await HouseholdAPI.getHouseholdById(String(household.id));
      if (detail) {
        setSelected(toHouseholdItem(detail));
      }
    } catch (e) {
      // keep base selected if detail fails
    } finally {
      setDetailLoading(false);
    }
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
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc!");
      return;
    }
    setIsLoading(true);
    try {
      if (!selected) throw new Error("No household selected");
      await HouseholdAPI.changeHouseholdHead(String(selected.id), {
        chuHoMoiId: String(newHeadId),
        relationOldHead: "Thành viên gia đình",
      });
      // Refresh list and close
      await fetchHouseholds({ page: 1, limit: 500 });
      closeForm();
      // Show success toast, then navigate after a short delay
      toast.success("Thay đổi chủ hộ thành công!", { duration: 3000 });
    } catch (err) {
      console.error(err);
      const e: any = err as any;
      const message =
        e?.response?.data?.message || e?.message || "Thay đổi chủ hộ thất bại. Vui lòng thử lại!";
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
      {/* Search */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo mã hộ, tên chủ hộ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
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
              {(allLoading || loading) ? (
                <tr>
                  <td className="py-4 text-center" colSpan={5}>
                    <span className="inline-flex items-center gap-2 text-second">
                      <Loader className="w-4 h-4 animate-spin" /> Đang tải danh sách hộ khẩu...
                    </span>
                  </td>
                </tr>
              ) : (allError || error) ? (
                <tr>
                  <td className="py-4 text-center text-red-500" colSpan={5}>
                    {allError || error}
                  </td>
                </tr>
              ) : paginatedHouseholds.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-border/50 hover:bg-muted/10 transition"
                >
                  <td className="py-3 px-2 font-medium text-first dark:text-darkmodetext">{h.code}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.headName}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.address}</td>
                  <td className="py-3 px-2 text-first dark:text-darkmodetext">{h.memberCount}</td>
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
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          pageSize={ITEMS_PER_PAGE}
          currentCount={paginatedHouseholds.length}
          onPageChange={(page) => setCurrentPage(page)}
        />
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
                  {detailLoading ? (
                    <div className="flex items-center gap-2 text-second">
                      <Loader className="w-4 h-4 animate-spin" /> Đang tải danh sách thành viên...
                    </div>
                  ) : (
                    <>
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
                    </>
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








