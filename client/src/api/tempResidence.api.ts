import apiClient from '../lib/axios';
import type { ApiParams, UnknownRecord } from '@/types/api';

// Tạm trú
export async function createTempResidence(payload: UnknownRecord) {
  const resp = await apiClient.post('/api/v1/tam-tru', payload);
  // Backend returns { message, tempResidence }
  return resp.data?.tempResidence ?? null;
}

// Danh sách tạm trú/tạm vắng (có thể truyền params lọc)
export async function getTempResidence(params?: ApiParams) {
  const resp = await apiClient.get('/api/v1/tam-tru-vang', { params });
  return resp.data?.data ?? null;
}

// Cập nhật phiếu tạm trú/tạm vắng theo id
export async function updateTempResidence(id: string, payload: UnknownRecord) {
  const resp = await apiClient.put(`/api/v1/tam-tru-vang/${id}`, payload);
  return resp.data?.data ?? null;
}

// Xóa phiếu tạm trú/tạm vắng theo id
export async function deleteTempResidence(id: string) {
  const resp = await apiClient.delete(`/api/v1/tam-tru-vang/${id}`);
  return resp.data?.data ?? null;
}

export type TempAbsencePayload = {
  household_no: string;
  citizen_id: string;
  from_date: string;
  to_date: string;
  note?: string;
  registered_by_person_id?: number;
};

export async function createTempAbsence(payload: TempAbsencePayload) {
  const resp = await apiClient.post("/api/v1/tam-vang", payload);
  return resp.data?.tempResidence ?? null;
}
