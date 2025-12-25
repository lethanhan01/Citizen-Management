import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as AuthAPI from '@/api/auth.api';

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      async login(username, password) {
        set({ loading: true, error: null });
        try {
          const data = await AuthAPI.login(username, password);
          const token = data?.token;
          const user = data?.user;
          if (token) localStorage.setItem('token', token);
          set({ token: token ?? null, user: user ?? null, loading: false });
        } catch (err: any) {
          set({ error: err?.message || 'Đăng nhập thất bại', loading: false });
        }
      },
      logout() {
        try {
          localStorage.removeItem('token');
        } finally {
          set({ user: null, token: null });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },
      async fetchMe() {
        set({ loading: true, error: null });
        try {
          const me = await AuthAPI.getMe();
          set({ user: me ?? null, loading: false });
        } catch (err: any) {
          set({ error: err?.message || 'Không lấy được thông tin người dùng', loading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
