import axios from "axios"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AuthUser = {
  id: string
  username: string
  email?: string
}

type AuthStoreState = {
  token: string | null
  user: AuthUser | null
  isLoggedIn: boolean
  loading: boolean
}

type AuthStoreActions = {
  setSession: (payload: { token: string; user: AuthUser }) => void
  updateUser: (user: Partial<AuthUser>) => void
  clearSession: () => void
  setIsLoggedIn: (isLoggedIn: boolean) => void
  setLoading: (loading: boolean) => void
  checkAuthStatus: () => Promise<void>
  logout: () => Promise<void>
}

type AuthStore = AuthStoreState & AuthStoreActions

const API_URL = import.meta.env.VITE_API_URL

function extractAuthPayload(data: unknown): { token: string | null; user: AuthUser | null; success: boolean } {
  const payload = (data as { data?: unknown } | undefined)?.data ?? data
  const source = payload as {
    token?: unknown
    accessToken?: unknown
    jwt?: unknown
    user?: unknown
    success?: unknown
  }

  const rawUser = source?.user as Partial<AuthUser> | undefined
  const user =
    rawUser?.id && rawUser?.username
      ? {
          id: rawUser.id,
          username: rawUser.username,
          email: rawUser.email,
        }
      : null

  const tokenCandidate = source?.token ?? source?.accessToken ?? source?.jwt
  const token = typeof tokenCandidate === "string" && tokenCandidate.length > 0 ? tokenCandidate : null
  const success = source?.success === true || Boolean(token) || Boolean(user)

  return { token, user, success }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      loading: false,
      setSession: ({ token, user }) =>
        set({
          token,
          user,
          isLoggedIn: true,
          loading: false,
        }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null,
        })),
      clearSession: () =>
        set({
          token: null,
          user: null,
          isLoggedIn: false,
          loading: false,
        }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setLoading: (loading) => set({ loading }),
      checkAuthStatus: async () => {
        set({ loading: true })
        try {
          const response = await axios.get(`${API_URL}/api/auth/protected`, {
            withCredentials: true,
          })
          const { token, user, success } = extractAuthPayload(response.data)
          set((state) => ({
            token: token ?? state.token,
            user: user ?? state.user,
            isLoggedIn: success,
            loading: false,
          }))
        } catch {
          set({ token: null, user: null, isLoggedIn: false, loading: false })
        }
      },
      logout: async () => {
        try {
          await axios.get(`${API_URL}/api/auth/logout`, {
            withCredentials: true,
          })
        } finally {
          set({ token: null, user: null, isLoggedIn: false, loading: false })
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
