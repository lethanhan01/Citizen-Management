import apiClient from '../lib/axios';

export async function search(params?: Record<string, any>) {
  const resp = await apiClient.get('/api/v1/search', { params });
  return resp.data?.data ?? null;
}
