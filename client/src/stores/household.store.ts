import { create } from 'zustand';
import * as HouseholdAPI from '@/api/household.api';
import type { ApiParams, UnknownRecord } from '@/types/api';

interface HouseholdState {
  data: UnknownRecord[];
  loading: boolean;
  error: string | null;
  fetchHouseholds: (params?: ApiParams) => Promise<void>;
  current: UnknownRecord | null;
  fetchHouseholdById: (id: string) => Promise<void>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
};

export const useHouseholdStore = create<HouseholdState>((set) => ({
  data: [],
  loading: false,
  error: null,
  current: null,
  async fetchHouseholds(params) {
    set({ loading: true, error: null });
    try {
      const data = await HouseholdAPI.getHouseholds(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Không tải được danh sách hộ khẩu'), loading: false });
    }
  },
  async fetchHouseholdById(id) {
    set({ loading: true, error: null });
    try {
      const data = await HouseholdAPI.getHouseholdById(id);
      set({ current: data ?? null, loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Không lấy được thông tin hộ khẩu'),
        loading: false,
        current: null,
      });
    }
  },
}));
