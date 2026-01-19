import apiClient from '../lib/axios';
import type { ApiParams } from '@/types/api';

export async function search(params?: ApiParams) {
  const resp = await apiClient.get('/api/v1/search', { params });
  return resp.data?.data ?? null;
}
