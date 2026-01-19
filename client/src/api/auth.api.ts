import apiClient from '../lib/axios';
import type { UnknownRecord } from '@/types/api';

export type AuthUser = {
  user_id: string | number;
  username: string;
  role: string;
  full_name?: string;
};

export type AuthLoginResponse = {
  token: string;
  user: AuthUser;
};

export type AuthRegisterPayload = {
  username: string;
  password: string;
  full_name?: string;
  role?: string;
};

export type AuthUpdateProfilePayload = {
  full_name?: string;
  password?: string;
} & UnknownRecord;

export async function login(username: string, password: string): Promise<AuthLoginResponse | null> {
  const resp = await apiClient.post('/api/v1/auth/login', { username, password });
  return resp.data?.data ?? null;
}

export async function register(payload: AuthRegisterPayload) {
  const resp = await apiClient.post('/api/v1/auth/register', payload);
  return resp.data?.data ?? null;
}

export async function getMe(): Promise<AuthUser | null> {
  const resp = await apiClient.get('/api/v1/auth/me');
  return resp.data?.data ?? null;
}

export async function updateProfile(payload: AuthUpdateProfilePayload) {
  const resp = await apiClient.put('/api/v1/auth/updateProfile', payload);
  return resp.data?.data ?? null;
}

export async function logout() {
  const resp = await apiClient.post('/api/v1/auth/logout');
  return resp.data?.data ?? null;
}
