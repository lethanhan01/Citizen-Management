"use client";

import { useState, useMemo } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import HouseholdDetailPanel from "@/components/HouseholdDetailPanel";
import type { Household } from "@/types/household";

// Mock data
const mockHouseholds: Household[] = [
  {
    id: "1",
    code: "HH001",
    headName: "Nguyễn Văn A",
    headId: "1",
    address: "Số 123 Đường Lý Thường Kiệt, Phường 1",
    registrationDate: "2018-03-20",
    memberCount: 4,
    members: [
      {
        id: "1",
        fullName: "Nguyễn Văn A",
        cccd: "092012345678",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "2",
        fullName: "Nguyễn Thị B",
        cccd: "092012345679",
        relationship: "Vợ",
        isHead: false,
      },
      {
        id: "3",
        fullName: "Nguyễn Văn C",
        cccd: "092012345680",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "4",
        fullName: "Nguyễn Thị D",
        cccd: "092012345681",
        relationship: "Con",
        isHead: false,
      },
    ],
  },
  {
    id: "2",
    code: "HH002",
    headName: "Trần Văn E",
    headId: "4",
    address: "Số 456 Đường Trần Hưng Đạo, Phường 2",
    registrationDate: "2019-06-15",
    memberCount: 2,
    members: [
      {
        id: "4",
        fullName: "Trần Văn E",
        cccd: "092012345682",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "5",
        fullName: "Trần Thị F",
        cccd: "092012345683",
        relationship: "Vợ",
        isHead: false,
      },
    ],
  },
  {
    id: "3",
    code: "HH003",
    headName: "Lê Văn G",
    headId: "6",
    address: "Số 789 Đường Hàng Bông, Phường 3",
    registrationDate: "1988-10-15",
    memberCount: 5,
    members: [
      {
        id: "6",
        fullName: "Lê Văn G",
        cccd: "092012345684",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "7",
        fullName: "Lê Thị H",
        cccd: "092012345685",
        relationship: "Vợ",
        isHead: false,
      },
      {
        id: "8",
        fullName: "Lê Văn I",
        cccd: "092012345686",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "9",
        fullName: "Lê Thị J",
        cccd: "092012345687",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "10",
        fullName: "Lê Văn K",
        cccd: "092012345688",
        relationship: "Con",
        isHead: false,
      },
    ],
  },
  {
    id: "4",
    code: "HH004",
    headName: "Phạm Văn L",
    headId: "11",
    address: "Số 321 Đường Cầu Giấy, Phường 4",
    registrationDate: "2020-01-10",
    memberCount: 3,
    members: [
      {
        id: "11",
        fullName: "Phạm Văn L",
        cccd: "092012345689",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "12",
        fullName: "Phạm Thị M",
        cccd: "092012345690",
        relationship: "Vợ",
        isHead: false,
      },
      {
        id: "13",
        fullName: "Phạm Văn N",
        cccd: "092012345691",
        relationship: "Con",
        isHead: false,
      },
    ],
  },
  {
    id: "5",
    code: "HH005",
    headName: "Đỗ Thị O",
    headId: "14",
    address: "Số 654 Đường Bà Triệu, Phường 5",
    registrationDate: "2017-05-22",
    memberCount: 6,
    members: [
      {
        id: "14",
        fullName: "Đỗ Thị O",
        cccd: "092012345692",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "15",
        fullName: "Đỗ Văn P",
        cccd: "092012345693",
        relationship: "Chồng",
        isHead: false,
      },
      {
        id: "16",
        fullName: "Đỗ Văn Q",
        cccd: "092012345694",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "17",
        fullName: "Đỗ Thị R",
        cccd: "092012345695",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "18",
        fullName: "Đỗ Văn S",
        cccd: "092012345696",
        relationship: "Con",
        isHead: false,
      },
      {
        id: "19",
        fullName: "Đỗ Thị T",
        cccd: "092012345697",
        relationship: "Con",
        isHead: false,
      },
    ],
  },
  {
    id: "6",
    code: "HH006",
    headName: "Hoàng Văn U",
    headId: "20",
    address: "Số 987 Đường Thái Thịnh, Phường 6",
    registrationDate: "2021-08-30",
    memberCount: 2,
    members: [
      {
        id: "20",
        fullName: "Hoàng Văn U",
        cccd: "092012345698",
        relationship: "Chủ hộ",
        isHead: true,
      },
      {
        id: "21",
        fullName: "Hoàng Thị V",
        cccd: "092012345699",
        relationship: "Vợ",
        isHead: false,
      },
    ],
  },
];

const ITEMS_PER_PAGE = 10;

export default function HouseholdList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"headName" | "memberCount">("headName");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Sort
  const filteredHouseholds = useMemo(() => {
    let result = mockHouseholds.filter((household) => {
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
  }, [searchQuery, sortBy]);

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
                text-first dark:text-fourth
                placeholder:text-second dark:placeholder:text-fourth/40
                focus:outline-none focus:ring-2 focus:ring-third transition
              "
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-second dark:text-fourth/60" />
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
                text-first dark:text-fourth
                focus:outline-none focus:ring-2 focus:ring-third transition
              "
            >
              <option value="headName">Sắp xếp theo tên chủ hộ</option>
              <option value="memberCount">Sắp xếp theo số thành viên</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl shadow-sm dark:shadow-none overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : paginatedHouseholds.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-second dark:text-fourth/70 text-lg">
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
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Mã hộ khẩu
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Tên chủ hộ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Số người
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Ngày đăng kí
                      </th>
                      <th className="px-4 py-3 text-center text-first dark:text-fourth font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHouseholds.map((household, idx) => (
                      <tr
                        key={household.id}
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition cursor-pointer"
                        onClick={() => handleViewHousehold(household)}
                      >
                        <td className="px-4 py-3 text-first dark:text-fourth font-medium">
                          {household.code}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {household.headName}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth max-w-xs truncate">
                          {household.address}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {household.memberCount}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
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
                <p className="text-sm text-second dark:text-fourth/70">
                  Hiển thị {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, filteredHouseholds.length)} của{" "}
                  {filteredHouseholds.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-first dark:text-fourth" />
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
                                : "hover:bg-second/20 dark:hover:bg-second/30 text-first dark:text-fourth"
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
                    <ChevronRight className="w-5 h-5 text-first dark:text-fourth" />
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
