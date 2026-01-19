"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Eye, Loader } from "lucide-react";
import HouseholdDetailPanel from "@/components/HouseholdDetailPanel";
import PaginationBar from "@/components/PaginationBar";
import type { Household } from "@/types/household";
import { useHouseholdStore } from "@/stores/household.store";
import * as HouseholdAPI from "@/api/household.api";

// Dữ liệu sẽ lấy từ store; bỏ mock

const ITEMS_PER_PAGE = 10;

function toHousehold(h: any): Household {
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
  const headIdValue =
    head?.person_id ??
    head?.id ??
    h?.headPerson?.person_id ??
    h?.head_id ??
    h?.owner_id ??
    h?.chu_ho_id ??
    h?.household_head_id ??
    "";
  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(headNameValue),
    headId: String(headIdValue),
    address: String(h?.address ?? ""),
    registrationDate: String(h?.registration_date ?? h?.created_at ?? ""),
    memberCount: Number(
      h?.members_count ?? h?.memberCount ?? (Array.isArray(h?.residents) ? h.residents.length : 0)
    ),
    members:
      Array.isArray(h?.residents)
        ? h.residents.map((m: any) => ({
            id: String(m?.person_id ?? m?.id ?? ""),
            fullName: String(m?.full_name ?? ""),
            cccd: String(m?.citizen_id_num ?? ""),
            relationship: m?.HouseholdMembership?.relation_to_head ?? m?.relationship ?? "",
            isHead: Boolean(m?.HouseholdMembership?.is_head ?? m?.isHead ?? false),
          }))
        : [],
    lastUpdated: h?.updated_at ?? undefined,
  };
}

export default function HouseholdList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"headName" | "memberCount" | "date" | "codeAsc" | "codeDesc">("headName");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  const { data, loading, error } = useHouseholdStore();
  const [allData, setAllData] = useState<any[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setAllLoading(true);
      setAllError(null);
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
        setAllError(e?.message || "Không tải được toàn bộ hộ khẩu");
      } finally {
        setAllLoading(false);
      }
    };
    fetchAll();
  }, []);

  const sourceHouseholds: Household[] = useMemo(() => {
    const arr = Array.isArray(allData) && allData.length > 0 ? allData : Array.isArray(data) ? data : [];
    return arr.map(toHousehold);
  }, [allData, data]);

  // Filter & Sort
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
      result.sort((a, b) => b.memberCount - a.memberCount);
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
        // Extract numeric part if exists for better sorting
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

  const handleViewHousehold = async (household: Household) => {
    // Mở panel ngay với dữ liệu cơ bản
    setSelectedHousehold(household);
    try {
      const detail = await HouseholdAPI.getHouseholdById(String(household.id));
      if (detail) {
        setSelectedHousehold(toHousehold(detail));
      }
    } catch {
      // Giữ dữ liệu cơ bản nếu gọi chi tiết lỗi
    }
  };

  const handleCloseHousehold = () => {
    setSelectedHousehold(null);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main Area */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${selectedHousehold ? "w-[60%] md:w-[65%]" : "w-full"}
        `}
      >
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
        <div className="flex-1 bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {(allLoading || loading) ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : (allError || error) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-danger font-semibold">Đã xảy ra lỗi</p>
                <p className="text-second dark:text-darkmodetext/70 mt-1">{allError || error}</p>
              </div>
            </div>
          ) : paginatedHouseholds.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
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
                        Mã hộ khẩu
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Tên chủ hộ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Số người
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Ngày đăng kí
                      </th>
                      <th className="px-4 py-3 text-center text-first dark:text-darkmodetext font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHouseholds.map((household) => (
                      <tr
                        key={household.id}
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                      >
                        <td className="px-4 py-3 text-first dark:text-darkmodetext font-medium">
                          {household.code}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {household.headName || "—"}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext max-w-xs truncate">
                          {household.address}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {household.memberCount}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {new Date(household.registrationDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleViewHousehold(household)}
                            className="p-1.5 hover:bg-second/20 dark:hover:bg-second/30 rounded-md transition"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-third" />
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
      </div>

      {/* Details Panel */}
      <HouseholdDetailPanel
        household={selectedHousehold}
        isOpen={!!selectedHousehold}
        onClose={handleCloseHousehold}
      />
    </div>
  );
}





