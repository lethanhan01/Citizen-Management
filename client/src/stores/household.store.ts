import { create } from 'zustand';
import * as HouseholdAPI from '@/api/household.api';

interface HouseholdState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchHouseholds: (params?: Record<string, any>) => Promise<void>;
  fetchHouseholdById: (id: string) => Promise<any | null>;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  data: [],
  loading: false,
  error: null,
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
    try {
      const data = await HouseholdAPI.getHouseholdById(id);
      return data ?? null;
    } catch (err: any) {
      return null;
    }
  },
}));
