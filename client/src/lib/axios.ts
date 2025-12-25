import axios, { AxiosError } from 'axios';

// Base URL lấy từ biến môi trường build-time
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    if (token) {
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
      localStorage.removeItem('token');
      // Điều hướng về trang đăng nhập
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
