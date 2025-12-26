import { create } from "zustand";
import * as PersonAPI from "@/api/person.api";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PersonState {
  data: any[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;

  current: any | null;
  fetchPersons: (params?: Record<string, any>) => Promise<void>;
  fetchPersonById: (id: string) => Promise<void>;
}

export const usePersonStore = create<PersonState>((set) => ({
  data: [],
  loading: false,
  error: null,
  current: null,
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 },

  async fetchPersons(params) {
    set({ loading: true, error: null });
    try {
      const res = await PersonAPI.getPersons(params);
      set({
        data: res.rows,
        pagination: res.pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || "Không tải được danh sách nhân khẩu",
        loading: false,
      });
    }
  },

  async fetchPersonById(id) {
    set({ loading: true, error: null });
    try {
      const data = await PersonAPI.getPersonById(id);
      set({ current: data ?? null, loading: false });
    } catch (err: any) {
      set({ error: err?.message || "Không lấy được thông tin công dân", loading: false, current: null });
    }
  },
}));
