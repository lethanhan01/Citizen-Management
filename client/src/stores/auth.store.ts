import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as AuthAPI from '@/api/auth.api';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
};

interface AuthState {
  user: AuthAPI.AuthUser | null;
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
        } catch (err: unknown) {
          set({ error: getErrorMessage(err, 'Đăng nhập thất bại'), loading: false });
        }
      },
      logout() {
        try {
          localStorage.removeItem('token');
        } finally {
          set({ user: null, token: null });
        }
      },
      async fetchMe() {
        set({ loading: true, error: null });
        try {
          const me = await AuthAPI.getMe();
          set((state) => ({
            user: me ? { ...(state.user ?? {}), ...me } : (state.user ?? null),
            loading: false,
          }));
        } catch (err: unknown) {
          set({
            error: getErrorMessage(err, 'Không lấy được thông tin người dùng'),
            loading: false,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
