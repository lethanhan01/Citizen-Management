"use client";

import { useState, useMemo } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import CitizenDetailPanel from "@/components/CitizenDetailPanel";
import type { Citizen } from "@/types/citizen";

// Mock data - thay bằng API sau
const mockCitizens: Citizen[] = [
  {
    id: "1",
    cccd: "092012345678",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1990-05-15",
    gender: "Nam",
    householdCode: "HH001",
    address: "Số 123 Đường Lý Thường Kiệt, Phường 1",
    status: "Thường trú",
    nationality: "Kinh",
    occupation: "Kỹ sư phần mềm",
    workplace: "Công ty ABC Tech",
    cmndCccdIssueDate: "2020-01-10",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "2018-03-20",
    isDeceased: false,
    isHead: true,
  },
  {
    id: "2",
    cccd: "092012345679",
    fullName: "Nguyễn Thị B",
    dateOfBirth: "1992-08-22",
    gender: "Nữ",
    householdCode: "HH001",
    address: "Số 123 Đường Lý Thường Kiệt, Phường 1",
    status: "Thường trú",
    nationality: "Kinh",
    occupation: "Giáo viên",
    workplace: "Trường tiểu học Xuân Phương",
    cmndCccdIssueDate: "2021-06-15",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "2018-03-20",
    isDeceased: false,
    relationshipToHead: "Vợ",
  },
  {
    id: "3",
    cccd: "092012345680",
    fullName: "Nguyễn Văn C",
    dateOfBirth: "2015-12-10",
    gender: "Nam",
    householdCode: "HH002",
    address: "Số 456 Đường Trần Hưng Đạo, Phường 2",
    status: "Tạm trú",
    nationality: "Kinh",
    occupation: "Học sinh",
    workplace: "Trường THCS Phan Bội Châu",
    cmndCccdIssueDate: "2022-01-20",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "2023-06-01",
    isDeceased: false,
    relationshipToHead: "Con",
  },
  {
    id: "4",
    cccd: "092012345681",
    fullName: "Trần Văn D",
    dateOfBirth: "1965-03-05",
    gender: "Nam",
    householdCode: "HH003",
    address: "Số 789 Đường Hàng Bông, Phường 3",
    status: "Thường trú",
    nationality: "Kinh",
    occupation: "Nghỉ hưu",
    workplace: "N/A",
    cmndCccdIssueDate: "2015-08-12",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "1988-10-15",
    isDeceased: false,
    isHead: true,
  },
  {
    id: "5",
    cccd: "092012345682",
    fullName: "Lê Thị E",
    dateOfBirth: "1970-07-20",
    gender: "Nữ",
    householdCode: "HH003",
    address: "Số 789 Đường Hàng Bông, Phường 3",
    status: "Đã chuyển đi",
    nationality: "Kinh",
    occupation: "Nội trợ",
    workplace: "N/A",
    cmndCccdIssueDate: "2016-11-05",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "1988-10-15",
    isDeceased: false,
    relationshipToHead: "Vợ",
  },
  {
    id: "6",
    cccd: "092012345683",
    fullName: "Phạm Văn F",
    dateOfBirth: "1985-11-02",
    gender: "Nam",
    householdCode: "HH004",
    address: "Số 15 Đường Hồ Tùng Mậu, Phường 4",
    status: "Tạm vắng",
    nationality: "Kinh",
    occupation: "Kỹ sư xây dựng",
    workplace: "Công ty XD Hoàng Gia",
    cmndCccdIssueDate: "2019-04-18",
    cmndCccdIssuePlace: "Công an Hà Nội",
    permanentResidenceDate: "2010-09-12",
    isDeceased: false,
    relationshipToHead: "Chủ hộ",
    isHead: true,
  },
];

const ITEMS_PER_PAGE = 10;

export default function CitizenList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "age" | "status">("name");
  const [filterStatus, setFilterStatus] = useState<"all" | "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi">("all");
  const [filterGender, setFilterGender] = useState<"all" | "Nam" | "Nữ">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isLoading] = useState(false);

  // Filter & Sort
  const filteredCitizens = useMemo(() => {
    let result = mockCitizens.filter((citizen) => {
      const matchSearch =
        citizen.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        citizen.cccd.includes(searchQuery);

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
  }, [searchQuery, sortBy, filterStatus, filterGender]);

  // Pagination
  const totalPages = Math.ceil(filteredCitizens.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCitizens = filteredCitizens.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

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
              placeholder="Tìm kiếm theo tên, CCCD..."
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

          {/* Sort & Filter Controls */}
          <div className="flex flex-wrap gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "age" | "status")}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-white dark:bg-transparent dark:border
                border border-second/40 dark:border-second/30
                text-first dark:text-fourth
                focus:outline-none focus:ring-2 focus:ring-third transition
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
                text-first dark:text-fourth
                focus:outline-none focus:ring-2 focus:ring-third transition
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
                text-first dark:text-fourth
                focus:outline-none focus:ring-2 focus:ring-third transition
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
        <div className="flex-1 bg-white dark:bg-transparent dark:border dark:border-second/40 dark:backdrop-blur-md rounded-xl shadow-sm dark:shadow-none overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-third animate-spin" />
            </div>
          ) : paginatedCitizens.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-second dark:text-fourth/70 text-lg">
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
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        CCCD
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Họ tên
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Ngày sinh
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Giới tính
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Mã hộ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-first dark:text-fourth font-semibold">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-first dark:text-fourth font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCitizens.map((citizen, idx) => (
                      <tr
                        key={citizen.id}
                        className="border-b border-second/20 dark:border-second/20 hover:bg-second/5 dark:hover:bg-second/10 transition"
                      >
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {startIdx + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {citizen.cccd}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth font-medium">
                          {citizen.fullName}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {new Date(citizen.dateOfBirth).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {citizen.gender}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth">
                          {citizen.householdCode}
                        </td>
                        <td className="px-4 py-3 text-first dark:text-fourth max-w-xs truncate">
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
                <p className="text-sm text-second dark:text-fourth/70">
                  Hiển thị {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, filteredCitizens.length)} của {filteredCitizens.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      <CitizenDetailPanel
        citizen={selectedCitizen}
        isOpen={!!selectedCitizen}
        onClose={handleCloseCitizen}
      />
    </div>
  );
}

