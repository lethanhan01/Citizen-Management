import { create } from "zustand"
import { apiFetch } from "./api"

export const usePersonStore = create((set) => ({
  persons: [],
  loading: false,
  error: null,

  fetchAllNhanKhau: async () => {
    set({ loading: true, error: null })
    try {
      const data = await apiFetch("/get-all-nhan-khau")
      set({ persons: data, loading: false })
      return data
    } catch (e) {
      set({ error: e.message, loading: false })
      throw e
    }
  },
}))
