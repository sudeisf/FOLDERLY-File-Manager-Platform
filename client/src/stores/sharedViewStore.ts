import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SharedViewMode = "grid" | "list"
export type SharedTab = "all" | "folders" | "files"

type SharedViewStore = {
  viewMode: SharedViewMode
  activeTab: SharedTab
  setViewMode: (mode: SharedViewMode) => void
  setActiveTab: (tab: SharedTab) => void
}

export const useSharedViewStore = create<SharedViewStore>()(
  persist(
    (set) => ({
      viewMode: "list",
      activeTab: "all",
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "shared-view-store",
    }
  )
)
