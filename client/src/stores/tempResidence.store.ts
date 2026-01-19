import { create } from 'zustand';
import * as TempResidenceAPI from '@/api/tempResidence.api';
import type { ApiParams, UnknownRecord } from '@/types/api';

interface TempResidenceState {
  data: UnknownRecord[];
  loading: boolean;
  error: string | null;
  fetchTempResidence: (params?: ApiParams) => Promise<void>;
  createTempAbsence: (
    payload: TempResidenceAPI.TempAbsencePayload,
  ) => Promise<boolean>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object') {
    const responseMessage = (err as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
};

export const useTempResidenceStore = create<TempResidenceState>((set) => ({
  data: [],
  loading: false,
  error: null,
  async fetchTempResidence(params) {
    set({ loading: true, error: null });
    try {
      const data = await TempResidenceAPI.getTempResidence(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Không tải được danh sách tạm trú/vắng'),
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
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Đăng ký tạm vắng thất bại'),
        loading: false,
      });
      return false;
    }
  },
}));
