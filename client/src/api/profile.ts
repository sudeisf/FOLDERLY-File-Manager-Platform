import { apiClient } from "@/api/http"

export type Profile = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  about: string
  avatarUrl: string
  portfolioName: string
  portfolioLink: string
  emailNotifications: boolean
  desktopNotifications: boolean
  sharedActivity: boolean
  twoFactorEnabled: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export type UpdateProfilePayload = {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  about?: string
  avatarUrl?: string
  portfolioName?: string
  portfolioLink?: string
  emailNotifications?: boolean
  desktopNotifications?: boolean
  sharedActivity?: boolean
  twoFactorEnabled?: boolean
}

export const profileApi = {
  async getMyProfile() {
    const { data } = await apiClient.get<Profile>("/api/profile/me")
    return data
  },

  async updateMyProfile(payload: UpdateProfilePayload) {
    const { data } = await apiClient.put<{ success: boolean; message: string; profile: Profile }>("/api/profile/me", payload)
    return data
  },

  async uploadMyAvatar(file: File) {
    const formData = new FormData()
    formData.append("image", file)

    const { data } = await apiClient.post<{ success: boolean; message: string; avatarUrl: string; storagePath: string }>(
      "/api/profile/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return data
  },

  async getMyRecentActivity() {
    const { data } = await apiClient.get<{ activities: any[] }>("/api/profile/me/activity")
    return data.activities
  },
}