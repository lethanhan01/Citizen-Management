import apiClient from '../lib/axios';

export async function getPersons(params?: Record<string, any>) {
  const resp = await apiClient.get('/api/v1/nhan-khau', { params });
  return resp.data?.data ?? null;
}

export async function getPersonById(id: string) {
  const resp = await apiClient.get(`/api/v1/nhan-khau/${id}`);
  return resp.data?.data ?? null;
}

export async function updatePerson(id: string, payload: any) {
  const resp = await apiClient.put(`/api/v1/nhan-khau/${id}`, payload);
  return resp.data?.data ?? null;
}

export async function getPersonEvents(id: string) {
  const resp = await apiClient.get(`/api/v1/nhan-khau/${id}/lich-su`);
  return resp.data?.data ?? null;
}

export async function handlePersonEvent(nhanKhauId: string, payload: any) {
  const resp = await apiClient.put(`/api/v1/nhan-khau/${nhanKhauId}/bien-dong`, payload);
  return resp.data?.data ?? null;
}
