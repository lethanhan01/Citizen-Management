"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import CitizenDetailPanel from "@/components/CitizenDetailPanel";
import type { Citizen } from "@/types/citizen";
// @ts-ignore - api.js is a JavaScript file
import { apiFetch } from "@/stores/api";

const ITEMS_PER_PAGE = 10;

// Map API response to Citizen type
const mapApiDataToCitizen = (apiData: any): Citizen => {
  const household = apiData.households?.[0];
  const membership = apiData.householdMemberships?.[0];
  
  // Map residency_status to status
  const statusMap: Record<string, Citizen["status"]> = {
    "THUONG_TRU": "Thường trú",
    "TAM_TRU": "Tạm trú",
    "TAM_VANG": "Tạm vắng",
    "CHUYEN_DI": "Đã chuyển đi",
  };

  return {
    id: apiData.person_id?.toString() || "",
    cccd: apiData.citizen_id_num || "",
    fullName: apiData.full_name || "",
    dateOfBirth: apiData.dob ? new Date(apiData.dob).toISOString().split("T")[0] : "",
    gender: apiData.gender === "M" || apiData.gender === "Nam" ? "Nam" : "Nữ",
    householdCode: household?.household_no || household?.household_id?.toString() || "",
    address: household?.address || "",
    status: statusMap[apiData.residency_status] || "Thường trú",
    nationality: apiData.ethnicity || "",
    occupation: apiData.occupation || "",
    workplace: apiData.workplace || "",
    cmndCccdIssueDate: apiData.citizen_id_issued_date ? new Date(apiData.citizen_id_issued_date).toISOString().split("T")[0] : undefined,
    cmndCccdIssuePlace: apiData.citizen_id_issued_place || "",
    permanentResidenceDate: apiData.residence_registered_date ? new Date(apiData.residence_registered_date).toISOString().split("T")[0] : undefined,
    isDeceased: false,
    relationshipToHead: membership?.relation_to_head || undefined,
    isHead: apiData.households?.[0]?.householdMemberships?.is_head || false,
  };
};

export default function CitizenList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "age" | "status">("name");
  const [filterStatus, setFilterStatus] = useState<"all" | "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi">("all");
  const [filterGender, setFilterGender] = useState<"all" | "Nam" | "Nữ">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data from API
  useEffect(() => {
    const fetchCitizens = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        // Map gender to API format
        const genderMap: Record<string, string | undefined> = {
          "all": undefined,
          "Nam": "M",
          "Nữ": "F",
        };

        // Map sortBy to API sortBy
        const sortByMap: Record<string, string> = {
          "name": "full_name",
          "age": "dob",
          "status": "residency_status",
        };

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          sortBy: sortByMap[sortBy] || "created_at",
          sortOrder: sortBy === "age" ? "DESC" : "ASC",
        });

        if (debouncedSearchQuery.trim()) {
          params.append("search", debouncedSearchQuery.trim());
        }

        if (filterGender !== "all") {
          params.append("gender", genderMap[filterGender] || "");
        }

        const response = await apiFetch(`/nhan-khau?${params.toString()}`);
        
        if (response.success && response.data) {
          let mappedCitizens = response.data.map(mapApiDataToCitizen);
          
          // Filter by status on client-side (API doesn't support status filter yet)
          if (filterStatus !== "all") {
            mappedCitizens = mappedCitizens.filter((c: Citizen) => c.status === filterStatus);
          }
          
          setCitizens(mappedCitizens);
          // Recalculate pagination for filtered results
          const filteredTotal = filterStatus !== "all" 
            ? Math.ceil(mappedCitizens.length / ITEMS_PER_PAGE)
            : (response.pagination?.totalPages || 1);
          setTotalPages(filteredTotal);
          setTotalItems(filterStatus !== "all" 
            ? mappedCitizens.length 
            : (response.pagination?.totalItems || 0));
        } else {
          setError("Không thể tải danh sách công dân");
          setCitizens([]);
        }
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải danh sách công dân");
        setCitizens([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCitizens();
  }, [debouncedSearchQuery, sortBy, filterStatus, filterGender, currentPage]);

  const handleViewCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
  };

  const handleCloseCitizen = () => {
    setSelectedCitizen(null);
  };


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
              placeholder="Tìm kiếm theo ID, tên, CCCD..."
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
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as "all" | "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi");
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
              <option value="all">Tất cả trạng thái</option>
              <option value="Thường trú">Thường trú</option>
              <option value="Tạm trú">Tạm trú</option>
              <option value="Tạm vắng">Tạm vắng</option>
              <option value="Đã chuyển đi">Đã chuyển đi</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            </div>
          ) : citizens.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-second dark:text-darkmodetext/70 text-lg">
                  Không tìm thấy công dân nào
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
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        CCCD
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Họ tên
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Ngày sinh
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Giới tính
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Mã hộ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-darkmodetext font-semibold">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-first dark:text-darkmodetext font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {citizens.map((citizen, idx) => (
                      <tr
                        key={citizen.id}
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                      >
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {citizen.id}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {citizen.cccd}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext font-medium">
                          {citizen.fullName}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {new Date(citizen.dateOfBirth).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {citizen.gender}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">
                          {citizen.householdCode}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext max-w-xs truncate">
                          {citizen.address}
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
                                  : "⚪"} {citizen.status}
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
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} của {totalItems}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      <CitizenDetailPanel
        citizen={selectedCitizen}
        isOpen={!!selectedCitizen}
        onClose={handleCloseCitizen}
      />
    </div>
  );
}






