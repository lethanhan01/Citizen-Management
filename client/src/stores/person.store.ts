import { create } from "zustand";
import * as PersonAPI from "@/api/person.api";
import type { ApiParams, UnknownRecord } from "@/types/api";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PersonState {
  data: UnknownRecord[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;

  current: UnknownRecord | null;
  fetchPersons: (params?: ApiParams) => Promise<void>;
  fetchPersonById: (id: string) => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
};

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
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, "Không tải được danh sách nhân khẩu"),
        loading: false,
      });
    }
  },

  async fetchPersonById(id) {
    set({ loading: true, error: null });
    try {
      const data = await PersonAPI.getPersonById(id);
      set({ current: data ?? null, loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, "Không lấy được thông tin công dân"),
        loading: false,
        current: null,
      });
    }
  },
}));
