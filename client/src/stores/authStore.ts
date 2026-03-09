import axios from "axios"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type AuthStore = {
  isLoggedIn: boolean | null
  loading: boolean
  setIsLoggedIn: (isLoggedIn: boolean) => void
  setLoading: (loading: boolean) => void
  checkAuthStatus: () => Promise<void>
  logout: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: null,
      loading: true,
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setLoading: (loading) => set({ loading }),
      checkAuthStatus: async () => {
        set({ loading: true })
        try {
          const response = await axios.get(`${API_URL}/api/auth/protected`, {
            withCredentials: true,
          })
          const data = response.data?.data ?? response.data
          set({ isLoggedIn: Boolean(data?.success) })
        } catch {
          set({ isLoggedIn: false })
        } finally {
          set({ loading: false })
        }
      },
      logout: async () => {
        try {
          await axios.get(`${API_URL}/api/auth/logout`, {
            withCredentials: true,
          })
        } catch (error) {
          console.error("Logout failed:", error)
        } finally {
          set({ isLoggedIn: false })
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
)
