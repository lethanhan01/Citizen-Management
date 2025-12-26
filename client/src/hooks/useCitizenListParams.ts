import { useMemo } from "react";

export type CitizenSort = "name" | "age" | "status";
export type CitizenGender = "all" | "male" | "female" | "other" | "unknown";
export type CitizenStatus =
  | "all"
  | "permanent"
  | "temporary_resident"
  | "temporary_absent"
  | "moved_out"
  | "deceased";

export function useCitizenListParams(opts: {
  page: number;
  limit: number;
  searchQuery: string;
  sortBy: CitizenSort;
  filterGender: CitizenGender;
  filterStatus: CitizenStatus;
}) {
  const { page, limit, searchQuery, sortBy, filterGender, filterStatus } = opts;

  return useMemo(() => {
    const params: any = { page, limit };

    const q = searchQuery.trim();
    if (q) params.search = q;

    if (filterGender !== "all") params.gender = filterGender;
    if (filterStatus !== "all") params.status = filterStatus;

    if (sortBy === "name") {
      params.sortBy = "full_name";
      params.sortOrder = "ASC";
    } else if (sortBy === "age") {
      params.sortBy = "dob";
      params.sortOrder = "ASC";
    } else if (sortBy === "status") {
      params.sortBy = "residency_status";
      params.sortOrder = "ASC";
    }

    return params;
  }, [page, limit, searchQuery, sortBy, filterGender, filterStatus]);
}
