import apiClient from '../lib/axios';

export async function login(username: string, password: string) {
  const resp = await apiClient.post('/api/v1/auth/login', { username, password });
  return resp.data?.data ?? null;
}

export async function register(payload: any) {
  const resp = await apiClient.post('/api/v1/auth/register', payload);
  return resp.data?.data ?? null;
}

export async function getMe() {
  const resp = await apiClient.get('/api/v1/auth/me');
  return resp.data?.data ?? null;
}

export async function updateProfile(payload: any) {
  const resp = await apiClient.put('/api/v1/auth/updateProfile', payload);
  return resp.data?.data ?? null;
}

export async function logout() {
  const resp = await apiClient.post('/api/v1/auth/logout');
  return resp.data?.data ?? null;
}
