import { create } from "zustand"
import { apiFetch } from "./api"

export const useNhanKhauStore = create((set) => ({
  detail: null,
  loading: false,
  error: null,

  fetchDetail: async (id) => {
    set({ loading: true, error: null })
    try {
      const data = await apiFetch(`/nhan-khau/${id}`)
      set({ detail: data, loading: false })
      return data
    } catch (e) {
      set({ error: e.message, loading: false, detail: null })
      throw e
    }
  },

  clearDetail: () => set({ detail: null, error: null }),
}))
