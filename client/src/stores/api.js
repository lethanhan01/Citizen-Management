import { useAuthStore } from "./useAuthStore"

const API_BASE = "http://localhost:5000/api/v1"

export async function apiFetch(path, options = {}) {
  // Lấy token từ localStorage trực tiếp (đáng tin cậy hơn store)
  const token = localStorage.getItem("token") || useAuthStore.getState().token

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => null)
  
  // Xử lý 401 - Token không hợp lệ hoặc hết hạn
  if (res.status === 401) {
    localStorage.removeItem("token")
    useAuthStore.getState().logout()
    // Chỉ redirect nếu đang ở client-side
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.")
  }

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}
