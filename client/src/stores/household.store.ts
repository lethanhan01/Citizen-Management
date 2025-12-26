import { create } from 'zustand';
import * as HouseholdAPI from '@/api/household.api';

interface HouseholdState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchHouseholds: (params?: Record<string, any>) => Promise<void>;
  current: any | null;
  fetchHouseholdById: (id: string) => Promise<void>;
}

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
    } catch (err: any) {
      set({ error: err?.message || 'Không tải được danh sách hộ khẩu', loading: false });
    }
  },
  async fetchHouseholdById(id) {
    set({ loading: true, error: null });
    try {
      const data = await HouseholdAPI.getHouseholdById(id);
      set({ current: data ?? null, loading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không lấy được thông tin hộ khẩu', loading: false, current: null });
    }
  },
}));
