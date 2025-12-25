import { create } from 'zustand';
import * as FeeAPI from '@/api/fee.api';

interface FeeState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchFees: (params?: Record<string, any>) => Promise<void>;
}

export const useFeeStore = create<FeeState>((set) => ({
  data: [],
  loading: false,
  error: null,
  async fetchFees(params) {
    set({ loading: true, error: null });
    try {
      const data = await FeeAPI.getAllFees(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không tải được danh sách khoản thu', loading: false });
    }
  },
}));
