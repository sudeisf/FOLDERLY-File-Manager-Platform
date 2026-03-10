import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "light" | "dark"

type ThemeStore = {
  theme: ThemeMode
  isHydrated: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  markHydrated: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      isHydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        set({ theme: next })
      },
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "theme-store",
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    }
  )
)
