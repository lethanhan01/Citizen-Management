import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: number };
    if (!payload?.exp) return false; // Không có exp thì không tự đăng xuất
    const nowSeconds = Date.now() / 1000;
    return payload.exp <= nowSeconds;
  } catch {
    return false; // Token không đúng format JWT thì vẫn cho qua, sẽ bị backend chặn nếu sai
  }
};

// Base URL lấy từ biến môi trường build-time
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Hiện hệ thống dùng Bearer token qua header Authorization
  withCredentials: false,
  timeout: 10000,
});

// Request interceptor: gắn JWT từ localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Chỉ kiểm tra hết hạn khi có token; nếu chưa đăng nhập thì để request (như /auth/login) chạy bình thường
    if (token) {
      if (isTokenExpired(token)) {
        try {
          const { logout } = useAuthStore.getState();
          logout();
        } catch {}
        redirectToLogin();
        return Promise.reject({ success: false, message: 'Token expired', status: 401 });
      }

      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: chuẩn hoá lỗi + xử lý 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Lỗi mạng/timeout
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error or timeout',
        status: 0,
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Tự động đăng xuất theo flow SPA
      try {
        const { logout } = useAuthStore.getState();
        logout();
        redirectToLogin();
      } catch {}
    }

    const message = (data as any)?.message || error.message || 'Request failed';

    return Promise.reject({
      success: false,
      message,
      status,
      data,
    });
  }
);

export default apiClient;
