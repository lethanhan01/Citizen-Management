import apiClient from '../lib/axios';

export async function createCampaign(payload: any) {
  const resp = await apiClient.post('/api/v1/chien-dich', payload);
  return resp.data?.data ?? null;
}

export async function getCampaigns(params?: Record<string, any>) {
  const resp = await apiClient.get('/api/v1/chien-dich', { params });
  return resp.data?.data ?? null;
}

export async function getCampaignById(id: string) {
  const resp = await apiClient.get(`/api/v1/chien-dich/${id}`);
  return resp.data?.data ?? null;
}

export async function updateCampaign(id: string, payload: any) {
  const resp = await apiClient.put(`/api/v1/chien-dich/${id}`, payload);
  return resp.data?.data ?? null;
}

export async function deleteCampaign(id: string) {
  const resp = await apiClient.delete(`/api/v1/chien-dich/${id}`);
  return resp.data?.data ?? null;
}

export async function contribute(payload: any) {
  const resp = await apiClient.post('/api/v1/chien-dich/dong-gop', payload);
  return resp.data?.data ?? null;
}
