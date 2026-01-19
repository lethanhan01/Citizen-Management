import { useMemo } from "react";
import type { ApiParams } from "@/types/api";

export type CitizenSort = "name" | "age" | "status" | "date";
export type CitizenGender = "all" | "male" | "female" | "other" | "unknown";
export type CitizenStatus = | "all" | "permanent" | "temporary_resident" | "temporary_absent" | "moved_out" | "deceased";

export function useCitizenListParams(opts: {
  page: number;
  limit: number;
  searchQuery: string;
  sortBy: CitizenSort;
  filterGender: CitizenGender;
  filterStatus: CitizenStatus;
}) {
  const { page, limit, searchQuery, sortBy, filterGender, filterStatus } = opts;

    return useMemo<ApiParams>(() => {
      const params: {
        page: number;
        limit: number;
        search?: string;
        gender?: CitizenGender;
        residency_status?: CitizenStatus;
        sortBy?: string;
        sortOrder?: string;
      } = { page, limit };

    const q = searchQuery.trim();
    if (q) params.search = q;

    if (filterGender !== "all") params.gender = filterGender;
    if (filterStatus !== "all") params.residency_status = filterStatus;

    if (sortBy === "name") {
      params.sortBy = "full_name";
      params.sortOrder = "ASC";
    } else if (sortBy === "age") {
      params.sortBy = "dob";
      params.sortOrder = "ASC";
    } else if (sortBy === "status") {
      params.sortBy = "residency_status";
      params.sortOrder = "ASC";
    } else if (sortBy === "date") {
      params.sortBy = "created_at";
      params.sortOrder = "DESC";
    }

    return params;
  }, [page, limit, searchQuery, sortBy, filterGender, filterStatus]);
}
