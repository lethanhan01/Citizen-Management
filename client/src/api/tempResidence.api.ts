import apiClient from '../lib/axios';

export async function createTempResidence(payload: any) {
  const resp = await apiClient.post('/api/v1/tam-tru-vang', payload);
  return resp.data?.data ?? null;
}

export async function getTempResidence(params?: Record<string, any>) {
  const resp = await apiClient.get('/api/v1/tam-tru-vang', { params });
  return resp.data?.data ?? null;
}

export async function updateTempResidence(id: string, payload: any) {
  const resp = await apiClient.put(`/api/v1/tam-tru-vang/${id}`, payload);
  return resp.data?.data ?? null;
}

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
