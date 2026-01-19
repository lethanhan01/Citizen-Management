import apiClient from '../lib/axios';
import type { ApiParams, UnknownRecord } from '@/types/api';

export type PersonsResponse = {
  rows: UnknownRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export async function getPersons(params?: ApiParams): Promise<PersonsResponse> {
  const resp = await apiClient.get("/api/v1/nhan-khau", { params });

  return {
    rows: Array.isArray(resp.data?.data) ? resp.data.data : [],
    pagination: resp.data?.pagination ?? {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: params?.limit ?? 20,
    },
  };
}

export async function getPersonById(id: string) {
  const resp = await apiClient.get(`/api/v1/nhan-khau/${id}`);
  return resp.data?.data ?? null;
}

export async function updatePerson(id: string, payload: UnknownRecord) {
  const resp = await apiClient.put(`/api/v1/nhan-khau/${id}`, payload);
  return resp.data?.data ?? null;
}

export async function getPersonEvents(id: string) {
  const resp = await apiClient.get(`/api/v1/nhan-khau/${id}/lich-su`);
  return resp.data?.data ?? null;
}

export async function handlePersonEvent(nhanKhauId: string, payload: UnknownRecord) {
  const resp = await apiClient.put(`/api/v1/nhan-khau/${nhanKhauId}/bien-dong`, payload);
  return resp.data?.data ?? null;
}
