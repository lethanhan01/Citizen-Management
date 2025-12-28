import { create } from "zustand";
import * as CampaignAPI from "@/api/campaign.api";

type CampaignListItem = {
  campaign_id: number;
  name: string;
  start_date?: string;
  end_date?: string | null;
  status?: string;
  description?: string;
};

type ContributionItem = {
  id: number;
  amount: number;
  contribution_date?: string;
  note?: string;
  household?: {
    household_no?: string;
    address?: string;
  };
};

type CampaignDetail = {
  campaign_id: number;
  name: string;
  start_date?: string;
  end_date?: string | null;
  description?: string;
  total_collected?: number;
  contributions?: ContributionItem[];
};

interface CampaignState {
  campaigns: CampaignListItem[];
  detailsById: Record<number, CampaignDetail | null>;

  loadingList: boolean;
  loadingDetailById: Record<number, boolean>;
  submitting: boolean;
  error: string | null;

  fetchCampaigns: (params?: Record<string, any>) => Promise<void>;
  fetchCampaignById: (id: number) => Promise<void>;

  createCampaign: (payload: CampaignAPI.CampaignCreatePayload) => Promise<boolean>;
  updateCampaign: (id: number, payload: CampaignAPI.CampaignUpdatePayload) => Promise<boolean>;
  deleteCampaign: (id: number) => Promise<boolean>;

  contribute: (payload: CampaignAPI.ContributePayload) => Promise<boolean>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  detailsById: {},

  loadingList: false,
  loadingDetailById: {},
  submitting: false,
  error: null,

  async fetchCampaigns(params) {
    set({ loadingList: true, error: null });
    try {
      const resp = await CampaignAPI.getCampaigns(params);
      const list = resp?.data;
      set({
        campaigns: Array.isArray(list) ? list : [],
        loadingList: false,
      });
    } catch (err: any) {
      set({
        loadingList: false,
        error: err?.response?.data?.message || err?.message || "Không tải được danh sách chiến dịch",
      });
    }
  },

  async fetchCampaignById(id) {
    set((s) => ({
      loadingDetailById: { ...s.loadingDetailById, [id]: true },
      error: null,
    }));
    try {
      const resp = await CampaignAPI.getCampaignById(id);
      const detail = resp?.data ?? null;

      set((s) => ({
        detailsById: { ...s.detailsById, [id]: detail },
        loadingDetailById: { ...s.loadingDetailById, [id]: false },
      }));
    } catch (err: any) {
      set((s) => ({
        loadingDetailById: { ...s.loadingDetailById, [id]: false },
        error: err?.response?.data?.message || err?.message || "Không tải được chi tiết chiến dịch",
      }));
    }
  },

  async createCampaign(payload) {
    set({ submitting: true, error: null });
    try {
      const resp = await CampaignAPI.createCampaign(payload);
      if (resp?.success === false) {
        set({ submitting: false, error: resp?.message || "Tạo chiến dịch thất bại" });
        return false;
      }
      set({ submitting: false });
      await get().fetchCampaigns();
      return true;
    } catch (err: any) {
      set({
        submitting: false,
        error: err?.response?.data?.message || err?.message || "Tạo chiến dịch thất bại",
      });
      return false;
    }
  },

  async updateCampaign(id, payload) {
    set({ submitting: true, error: null });
    try {
      const resp = await CampaignAPI.updateCampaign(id, payload);
      if (resp?.success === false) {
        set({ submitting: false, error: resp?.message || "Cập nhật thất bại" });
        return false;
      }
      set({ submitting: false });
      await get().fetchCampaigns();
      await get().fetchCampaignById(id);
      return true;
    } catch (err: any) {
      set({
        submitting: false,
        error: err?.response?.data?.message || err?.message || "Cập nhật thất bại",
      });
      return false;
    }
  },

  async deleteCampaign(id) {
    set({ submitting: true, error: null });
    try {
      const resp = await CampaignAPI.deleteCampaign(id);
      if (resp?.success === false) {
        set({ submitting: false, error: resp?.message || "Xóa thất bại" });
        return false;
      }
      set((s) => {
        const next = { ...s.detailsById };
        delete next[id];
        return { submitting: false, detailsById: next };
      });
      await get().fetchCampaigns();
      return true;
    } catch (err: any) {
      set({
        submitting: false,
        error: err?.response?.data?.message || err?.message || "Xóa thất bại",
      });
      return false;
    }
  },

  async contribute(payload) {
    set({ submitting: true, error: null });
    try {
      const resp = await CampaignAPI.contribute(payload);
      if (resp?.success === false) {
        set({ submitting: false, error: resp?.message || "Ghi nhận đóng góp thất bại" });
        return false;
      }
      set({ submitting: false });

      // refresh detail để bảng đóng góp + total_collected cập nhật
      const idNum = Number(payload.campaign_id);
      if (!Number.isNaN(idNum)) {
        await get().fetchCampaignById(idNum);
      }
      return true;
    } catch (err: any) {
      set({
        submitting: false,
        error: err?.response?.data?.message || err?.message || "Ghi nhận đóng góp thất bại",
      });
      return false;
    }
  },
}));
