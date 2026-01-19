import apiClient from '../lib/axios';
import type { ApiParams, UnknownRecord } from '@/types/api';

export async function createFee(payload: UnknownRecord) {
  const resp = await apiClient.post('/api/v1/khoan-thu', payload);
  return resp.data?.data ?? null;
}

export async function getAllFees(params?: ApiParams) {
  const resp = await apiClient.get('/api/v1/khoan-thu/danh-sach', { params });
  return resp.data?.data ?? null;
}

export async function deleteFee(id: string) {
  const resp = await apiClient.delete(`/api/v1/khoan-thu/${id}`);
  return resp.data?.data ?? null;
}

export async function searchPayments(params?: ApiParams) {
  const resp = await apiClient.get('/api/v1/khoan-thu/tim-kiem', { params });
  return resp.data?.data ?? null;
}

export async function confirmPayment(payload: UnknownRecord) {
  const resp = await apiClient.post('/api/v1/khoan-thu/xac-nhan', payload);
  return resp.data?.data ?? null;
}
