import { create } from 'zustand';
import * as TempResidenceAPI from '@/api/tempResidence.api';

interface TempResidenceState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchTempResidence: (params?: Record<string, any>) => Promise<void>;
}

export const useTempResidenceStore = create<TempResidenceState>((set) => ({
  data: [],
  loading: false,
  error: null,
  async fetchTempResidence(params) {
    set({ loading: true, error: null });
    try {
      const data = await TempResidenceAPI.getTempResidence(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không tải được danh sách tạm trú/vắng', loading: false });
    }
  },
}));
