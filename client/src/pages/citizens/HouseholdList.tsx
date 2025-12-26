"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import HouseholdDetailPanel from "@/components/HouseholdDetailPanel";
import type { Household } from "@/types/household";
import { useHouseholdStore } from "@/stores/household.store";

// Dữ liệu sẽ lấy từ store; bỏ mock

const ITEMS_PER_PAGE = 10;

function toHousehold(h: any): Household {
  const head = Array.isArray(h?.members)
    ? h.members.find((m: any) => m?.HouseholdMembership?.is_head || m?.is_head)
    : h?.head || null;
  return {
    id: String(h?.household_id ?? h?.id ?? ""),
    code: String(h?.household_no ?? h?.code ?? ""),
    headName: String(head?.full_name ?? h?.headName ?? ""),
    headId: String(head?.person_id ?? head?.id ?? ""),
    address: String(h?.address ?? ""),
    registrationDate: String(h?.registration_date ?? h?.created_at ?? ""),
    memberCount: Number(
      h?.members_count ?? h?.memberCount ?? (Array.isArray(h?.members) ? h.members.length : 0)
    ),
    members:
      Array.isArray(h?.members)
        ? h.members.map((m: any) => ({
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
  const [sortBy, setSortBy] = useState<"headName" | "memberCount">("headName");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  const { data, loading, error, fetchHouseholds } = useHouseholdStore();

  useEffect(() => {
    fetchHouseholds({ page: 1, limit: 100 });
  }, [fetchHouseholds]);

  const sourceHouseholds: Household[] = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map(toHousehold);
  }, [data]);

  // Filter & Sort
  const filteredHouseholds = useMemo(() => {
    let result = sourceHouseholds.filter((household) => {
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

  const handleViewHousehold = (household: Household) => {
    setSelectedHousehold(household);
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
              onChange={(e) =>
                setSortBy(e.target.value as "headName" | "memberCount")
              }
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
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-danger font-semibold">Đã xảy ra lỗi</p>
                <p className="text-second dark:text-darkmodetext/70 mt-1">{error}</p>
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
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition cursor-pointer"
                        onClick={() => handleViewHousehold(household)}
                      >
                        <td className="px-4 py-3 text-first dark:text-darkmodetext font-medium">
                          {household.code}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {household.headName}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewHousehold(household);
                            }}
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

              {/* Pagination */}
              <div className="border-t border-second/40 dark:border-second/30 px-4 py-3 flex items-center justify-between bg-second/5 dark:bg-second/10">
                <p className="text-sm text-second dark:text-darkmodetext/70">
                  Hiển thị {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, filteredHouseholds.length)} của{" "}
                  {filteredHouseholds.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-first dark:text-darkmodetext" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`
                            px-2 py-1 rounded text-sm font-medium transition
                            ${
                              currentPage === page
                                ? "bg-third text-first"
                                : "hover:bg-second/20 dark:hover:bg-second/30 text-first dark:text-darkmodetext"
                            }
                          `}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
                  >
                    <ChevronRight className="w-5 h-5 text-first dark:text-darkmodetext" />
                  </button>
                </div>
              </div>
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





