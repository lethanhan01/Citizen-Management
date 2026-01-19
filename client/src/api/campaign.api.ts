import apiClient from "../lib/axios";
import type { ApiParams } from "@/types/api";

export type CampaignCreatePayload = {
  name: string;
  start_date: string;          // "YYYY-MM-DD"
  end_date?: string | null;    // null nếu vô thời hạn
  description?: string;
};

export type CampaignUpdatePayload = Partial<CampaignCreatePayload>;

export type ContributePayload = {
  campaign_id: number | string;
  household_no: string;
  amount: number;
  contribution_date?: string;  // "YYYY-MM-DD" (optional)
  note?: string;
};

export async function createCampaign(payload: CampaignCreatePayload) {
  const resp = await apiClient.post("/api/v1/chien-dich", payload);
  return resp.data;
}

export async function getCampaigns(params?: ApiParams) {
  const resp = await apiClient.get("/api/v1/chien-dich", { params });
  return resp.data;
}

export const getCampaignById = async (campaignId: number | string) => {
  const res = await apiClient.get(`/api/v1/chien-dich/chi-tiet/${campaignId}`);
  return res.data;
};

export async function updateCampaign(id: string | number, payload: CampaignUpdatePayload) {
  const resp = await apiClient.put(`/api/v1/chien-dich/${id}`, payload);
  return resp.data;
}

export async function deleteCampaign(id: string | number) {
  const resp = await apiClient.delete(`/api/v1/chien-dich/${id}`);
  return resp.data;
}

export async function contribute(payload: ContributePayload) {
  const resp = await apiClient.post("/api/v1/chien-dich/dong-gop", payload);
  return resp.data;
}
