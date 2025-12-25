import { create } from "zustand"

const API_BASE = "http://localhost:5000/api/v1"

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")

      // Response format: { success: true, message: "...", data: { token: "...", user: {...} } }
      const token = data.data?.token || data.token
      if (!token) throw new Error("Không thấy token trong response")

      localStorage.setItem("token", token)
      set({ token, user: data.data?.user || data.user, loading: false })
      return data
    } catch (e) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  logout: async () => {
    localStorage.removeItem("token")
    set({ token: null, user: null })
  },
}))
