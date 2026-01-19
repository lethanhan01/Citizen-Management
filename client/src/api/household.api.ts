import apiClient from '../lib/axios';
import type { ApiParams, UnknownRecord } from '@/types/api';

export async function createHousehold(payload: UnknownRecord) {
  const resp = await apiClient.post('/api/v1/ho-khau', payload);
  return resp.data?.data ?? null;
}

export async function getHouseholds(params?: ApiParams) {
  const resp = await apiClient.get('/api/v1/ho-khau', { params });
  return resp.data?.data ?? null;
}

export async function getHouseholdById(id: string) {
  const resp = await apiClient.get(`/api/v1/ho-khau/${id}`);
  return resp.data?.data ?? null;
}

export async function updateHousehold(id: string, payload: UnknownRecord) {
  const resp = await apiClient.put(`/api/v1/ho-khau/${id}`, payload);
  return resp.data?.data ?? null;
}

export async function deleteHousehold(id: string) {
  const resp = await apiClient.delete(`/api/v1/ho-khau/${id}`);
  return resp.data?.data ?? null;
}

export async function addPersonToHousehold(hoKhauId: string, payload: UnknownRecord) {
  const resp = await apiClient.post(`/api/v1/ho-khau/${hoKhauId}/nhan-khau`, payload);
  return resp.data?.data ?? null;
}

export async function splitHousehold(payload: UnknownRecord) {
  const resp = await apiClient.post('/api/v1/ho-khau/tach-khau', payload);
  return resp.data?.data ?? null;
}

export async function getHouseholdHistory(id: string) {
  const resp = await apiClient.get(`/api/v1/ho-khau/${id}/lich-su`);
  return resp.data?.data ?? null;
}

export async function changeHouseholdHead(hoKhauId: string, payload: UnknownRecord) {
  const resp = await apiClient.put(`/api/v1/ho-khau/${hoKhauId}/thay-doi-chu-ho`, payload);
  return resp.data?.data ?? null;
}
