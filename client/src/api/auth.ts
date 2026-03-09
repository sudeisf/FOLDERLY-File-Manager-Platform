import { apiClient } from "@/api/http"

type AuthRequest = {
  username: string
  password: string
}

type RegisterRequest = {
  username: string
  email: string
  password: string
}

type ForgotPasswordRequest = {
  email: string
}

type VerifyOtpRequest = {
  email: string
  otp: string
}

type ResetPasswordRequest = {
  email: string
  newPassword: string
  resetToken: string
}

export type AuthApiResponse = {
  success?: boolean
  message?: string
  resetToken?: string
  data?: unknown
}

export const authApi = {
  async login(payload: AuthRequest) {
    const { data } = await apiClient.post<AuthApiResponse>("/api/auth/login", payload)
    return data
  },

  async register(payload: RegisterRequest) {
    const { data } = await apiClient.post<AuthApiResponse>("/api/auth/register", payload)
    return data
  },

  async forgotPasswordRequest(payload: ForgotPasswordRequest) {
    const { data } = await apiClient.post<AuthApiResponse>("/api/auth/forgot-password/request", payload)
    return data
  },

  async forgotPasswordVerify(payload: VerifyOtpRequest) {
    const { data } = await apiClient.post<AuthApiResponse>("/api/auth/forgot-password/verify", payload)
    return data
  },

  async forgotPasswordReset(payload: ResetPasswordRequest) {
    const { data } = await apiClient.post<AuthApiResponse>("/api/auth/forgot-password/reset", payload)
    return data
  },

  async protectedStatus() {
    const { data } = await apiClient.get<AuthApiResponse>("/api/auth/protected")
    return data
  },

  async logout() {
    const { data } = await apiClient.get<AuthApiResponse>("/api/auth/logout")
    return data
  },
}
