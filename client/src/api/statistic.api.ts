import apiClient from '../lib/axios';

export async function getDashboard() {
  const resp = await apiClient.get('/api/v1/so-lieu/tong-quan');
  return resp.data?.data ?? null;
}

export async function getFeeReport(id: string) {
  const resp = await apiClient.get(`/api/v1/so-lieu/thu-phi/${id}`);
  return resp.data?.data ?? null;
}

export async function getDonationReport(id: string) {
  const resp = await apiClient.get(`/api/v1/so-lieu/dong-gop/${id}`);
  return resp.data?.data ?? null;
}
