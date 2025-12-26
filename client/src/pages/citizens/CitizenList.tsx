"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import CitizenDetailPanel from "@/components/CitizenDetailPanel";
import type { Citizen } from "@/types/citizen";

import { usePersonStore } from "@/stores/person.store";


function toCitizen(p: any): Citizen {
  // có thể households là mảng hoặc object tuỳ BE serialize
  const households = p?.households;
  const firstHousehold =
    Array.isArray(households) ? households[0] : households || null;

  const householdMembership =
    firstHousehold?.HouseholdMembership || firstHousehold?.households?.HouseholdMembership;

  return {
    id: String(p?.person_id ?? p?.id ?? ""),
    cccd: String(p?.citizen_id_num ?? ""),
    fullName: String(p?.full_name ?? ""),
    dateOfBirth: String(p?.dob ?? ""), // ISO date
    gender: (p?.gender ?? "") as any,

    householdCode: String(firstHousehold?.household_no ?? ""),
    address: String(firstHousehold?.address ?? p?.previous_address ?? ""),

    status: (p?.residency_status ?? "Thường trú") as any,

    nationality: undefined,
    occupation: p?.occupation ?? undefined,
    workplace: p?.workplace ?? undefined,

    cmndCccdIssueDate: p?.citizen_id_issued_date ?? undefined,
    cmndCccdIssuePlace: p?.citizen_id_issued_place ?? undefined,

    permanentResidenceDate: p?.residence_registered_date ?? undefined,

    isHead: Boolean(householdMembership?.is_head ?? false),
    relationshipToHead: householdMembership?.relation_to_head ?? undefined,

    isDeceased: false,
  };
}


export default function CitizenList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "age" | "status">("name");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi"
  >("all");
  const [filterGender, setFilterGender] = useState<"all" | "Nam" | "Nữ">("all");
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  // ===== SERVER-SIDE PAGINATION (theo BE) =====
  const LIMIT = 200;

  // ✅ lấy data thật từ store (CHỈ 1 LẦN)
  const { data, loading, error, pagination, fetchPersons } = usePersonStore();

  // ✅ gọi API khi vào trang
  useEffect(() => {
    fetchPersons({ page: 1, limit: LIMIT });
  }, [fetchPersons]);

  // Pagination theo BE
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? 0;
  const itemsPerPage = pagination?.itemsPerPage ?? LIMIT;

  // startIdx để tính STT
  const startIdx = (currentPage - 1) * itemsPerPage;

  // Hàm đổi trang: gọi BE
  const goToPage = (page: number) => {
    fetchPersons({ page, limit: itemsPerPage });
  };

  // chuẩn hoá data từ BE -> Citizen[]
  const citizens: Citizen[] = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map(toCitizen);
  }, [data]);

  // Filter & Sort
  const filteredCitizens = useMemo(() => {
    let result = citizens.filter((citizen) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        citizen.fullName.toLowerCase().includes(q) ||
        String(citizen.cccd).includes(q);

      const matchStatus = filterStatus === "all" || citizen.status === filterStatus;
      const matchGender = filterGender === "all" || citizen.gender === filterGender;

      return matchSearch && matchStatus && matchGender;
    });

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === "age") {
      result.sort((a, b) => {
        const ageA = new Date().getFullYear() - new Date(a.dateOfBirth).getFullYear();
        const ageB = new Date().getFullYear() - new Date(b.dateOfBirth).getFullYear();
        return ageB - ageA;
      });
    } else if (sortBy === "status") {
      const order: Record<Citizen["status"], number> = {
        "Thường trú": 1,
        "Tạm trú": 2,
        "Tạm vắng": 3,
        "Đã chuyển đi": 4,
      };
      result.sort((a, b) => order[a.status] - order[b.status] || a.fullName.localeCompare(b.fullName));
    }

    return result;
  }, [citizens, searchQuery, sortBy, filterStatus, filterGender]);

  const paginatedCitizens = filteredCitizens; 
  const handleViewCitizen = (citizen: Citizen) => setSelectedCitizen(citizen);
  const handleCloseCitizen = () => setSelectedCitizen(null);


  return (
    <div className="flex gap-6 h-full">
      {/* Main Area */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${selectedCitizen ? "w-[60%] md:w-[65%]" : "w-full"}
        `}
      >
        {/* Search & Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, CCCD..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
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

          {/* Sort & Filter Controls */}
          <div className="flex flex-wrap gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "age" | "status")}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-white dark:bg-transparent dark:border
                border border-second/40 dark:border-second/30
                text-first dark:text-darkmodetext
                focus:outline-none focus:ring-1 focus:ring-selectring transition
              "
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="age">Sắp xếp theo tuổi</option>
              <option value="status">Sắp xếp theo trạng thái</option>
            </select>

            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value as "all" | "Nam" | "Nữ");
              }}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-white dark:bg-transparent dark:border
                border border-second/40 dark:border-second/30
                text-first dark:text-darkmodetext
                focus:outline-none focus:ring-1 focus:ring-selectring transition
              "
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(
                  e.target.value as "all" | "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi"
                );
              }}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-white dark:bg-transparent dark:border
                border border-second/40 dark:border-second/30
                text-first dark:text-darkmodetext
                focus:outline-none focus:ring-1 focus:ring-selectring transition
              "
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Thường trú">Thường trú</option>
              <option value="Tạm trú">Tạm trú</option>
              <option value="Tạm vắng">Tạm vắng</option>
              <option value="Đã chuyển đi">Đã chuyển đi</option>
            </select>
          </div>

          {/* ✅ Error message từ store */}
          {error ? (
            <div className="rounded-lg border border-red-300/40 bg-red-50/30 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : paginatedCitizens.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-second dark:text-darkmodetext/70 text-lg">Không tìm thấy công dân nào</p>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-second/40 dark:border-second/30 bg-second/5 dark:bg-second/10">
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">STT</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">CCCD</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Họ tên</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Ngày sinh</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Giới tính</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Mã hộ</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Địa chỉ</th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-center text-first dark:text-darkmodetext font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCitizens.map((citizen, idx) => (
                      <tr
                        key={citizen.id}
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                      >
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{startIdx + idx + 1}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{citizen.cccd}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext font-medium">{citizen.fullName}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {citizen.dateOfBirth ? new Date(citizen.dateOfBirth).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{citizen.gender ?? "-"}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{citizen.householdCode ?? "-"}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext max-w-xs truncate">
                          {citizen.address ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${
                                citizen.status === "Thường trú"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : citizen.status === "Tạm trú"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : citizen.status === "Tạm vắng"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                              }
                            `}
                          >
                            {citizen.status === "Thường trú"
                              ? "🟢"
                              : citizen.status === "Tạm trú"
                              ? "🟡"
                              : citizen.status === "Tạm vắng"
                              ? "🔵"
                              : "⚪"}{" "}
                            {citizen.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewCitizen(citizen)}
                              className="p-1.5 hover:bg-second/20 dark:hover:bg-second/30 rounded-md transition"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-third" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-second/40 dark:border-second/30 px-4 py-3 flex items-center justify-between bg-second/5 dark:bg-second/10">
                <p className="text-sm text-second dark:text-darkmodetext/70">
                  Hiển thị {totalItems === 0 ? 0 : startIdx + 1}-
                  {Math.min(startIdx + paginatedCitizens.length, totalItems)} của {totalItems}

                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-second/20 dark:hover:bg-second/30 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-first dark:text-darkmodetext" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
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
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
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
      <CitizenDetailPanel citizen={selectedCitizen} isOpen={!!selectedCitizen} onClose={handleCloseCitizen} />
    </div>
  );
}
