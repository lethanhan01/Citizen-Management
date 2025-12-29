"use client";

import { useEffect, useState } from "react";
import { Eye, Loader } from "lucide-react";
import CitizenDetailPanel from "@/components/CitizenDetailPanel";
import type { Citizen } from "@/types/citizen";
import CitizenListControls from "@/components/CitizenListControls";
import PaginationBar from "@/components/PaginationBar";

import { genderLabel, statusDot, statusTone } from "@/lib/citizen-ui";

import { usePersonStore } from "@/stores/person.store";
import { mapPersonToCitizen } from "@/mappers/person.mapper";
import { useCitizenListParams } from "@/hooks/useCitizenListParams";


export default function CitizenList() {

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ quản lý page ở FE để mỗi lần đổi filter/sort/search thì reset về 1
  const [page, setPage] = useState(1);

  // ✅ Hướng A: FE gửi CODE lên BE
  const [sortBy, setSortBy] = useState<"name" | "age" | "status" | "date">("name");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "permanent" | "temporary_resident" | "temporary_absent" | "moved_out" | "deceased"
  >("all");

  const [filterGender, setFilterGender] = useState<
    "all" | "male" | "female" | "other" | "unknown"
  >("all");

  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);


  // ===== SERVER-SIDE PAGINATION (theo BE) =====
  const LIMIT = 200;


  // ✅ lấy data thật từ store (CHỈ 1 LẦN)
  const { data, loading, error, pagination, fetchPersons } = usePersonStore();

  const params = useCitizenListParams({
    page,
    limit: LIMIT,
    searchQuery,
    sortBy,
    filterGender,
    filterStatus,
  });

  useEffect(() => {
    fetchPersons(params);
  }, [params, fetchPersons]);



  // Pagination theo BE
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? 0;
  const itemsPerPage = pagination?.itemsPerPage ?? LIMIT;

  // startIdx để tính STT
  const startIdx = (currentPage - 1) * itemsPerPage;

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
  };


  // chuẩn hoá data từ BE -> Citizen[]
  // const citizens: Citizen[] = useMemo(() => {
  //   const arr = Array.isArray(data) ? data : [];
  //   return arr.map(mapPersonToCitizen);
  // }, [data]);
  const citizens = Array.isArray(data) ? data.map(mapPersonToCitizen) : [];

  const paginatedCitizens = citizens; // ✅ server đã filter/sort/paginate

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
        <CitizenListControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterGender={filterGender}
          setFilterGender={setFilterGender}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          resetPage={() => setPage(1)}
          error={error}
        />


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
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{genderLabel(citizen.gender)}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext">{citizen.householdCode ?? "-"}</td>
                        <td className="px-4 py-3 text-first dark:text-darkmodetext max-w-xs truncate">
                          {citizen.address ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusTone(citizen.status)}`}>
                            {statusDot(citizen.status)}
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

              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIdx={startIdx}
                pageSize={itemsPerPage}
                currentCount={paginatedCitizens.length}
                onPageChange={goToPage}
              />

            </>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <CitizenDetailPanel citizen={selectedCitizen} isOpen={!!selectedCitizen} onClose={handleCloseCitizen} />
    </div>
  );
}
