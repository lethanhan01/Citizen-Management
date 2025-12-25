import { create } from 'zustand';
import * as CampaignAPI from '@/api/campaign.api';

interface CampaignState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: (params?: Record<string, any>) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  data: [],
  loading: false,
  error: null,
  async fetchCampaigns(params) {
    set({ loading: true, error: null });
    try {
      const data = await CampaignAPI.getCampaigns(params);
      set({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không tải được danh sách chiến dịch', loading: false });
    }
  },
}));
