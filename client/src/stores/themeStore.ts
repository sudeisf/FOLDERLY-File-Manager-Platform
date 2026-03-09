import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "light" | "dark"

type ThemeStore = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        set({ theme: next })
      },
    }),
    {
      name: "theme-store",
    }
  )
)
