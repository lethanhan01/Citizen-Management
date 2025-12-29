import { create } from 'zustand';
import * as TempResidenceAPI from '@/api/tempResidence.api';

interface TempResidenceState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchTempResidence: (params?: Record<string, any>) => Promise<void>;
  createTempAbsence: (
    payload: TempResidenceAPI.TempAbsencePayload,
  ) => Promise<boolean>;
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
      set({
        error: err?.message || 'Không tải được danh sách tạm trú/vắng',
        loading: false,
      });
    }
  },

  async createTempAbsence(payload) {
    set({ loading: true, error: null });
    try {
      const data = await TempResidenceAPI.createTempAbsence(payload);
      if (data) {
        set({ loading: false });
        return true; 
      }
      set({ loading: false, error: 'Không nhận được phản hồi từ máy chủ' });
      return false;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Đăng ký tạm vắng thất bại';

      set({
        error: errorMsg,
        loading: false,
      });
      return false;
    }
  },
}));
