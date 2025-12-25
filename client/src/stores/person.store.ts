import { create } from 'zustand';
import * as PersonAPI from '@/api/person.api';

interface PersonState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchPersons: (params?: Record<string, any>) => Promise<void>;
  fetchPersonById: (id: string) => Promise<any | null>;
}

export const usePersonStore = create<PersonState>((set) => ({
  data: [],
  loading: false,
  error: null,
  async fetchPersons(params) {
    set({ loading: true, error: null });
    try {
      const data = await PersonAPI.getPersons(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không tải được danh sách nhân khẩu', loading: false });
    }
  },
  async fetchPersonById(id) {
    try {
      const data = await PersonAPI.getPersonById(id);
      return data ?? null;
    } catch (err: any) {
      return null;
    }
  },
}));
