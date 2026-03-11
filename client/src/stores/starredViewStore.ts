import { create } from "zustand"
import { persist } from "zustand/middleware"

export type StarredViewMode = "grid" | "list"
export type StarredTab = "all" | "folders" | "files"

type StarredViewStore = {
  viewMode: StarredViewMode
  activeTab: StarredTab
  setViewMode: (mode: StarredViewMode) => void
  setActiveTab: (tab: StarredTab) => void
}

export const useStarredViewStore = create<StarredViewStore>()(
  persist(
    (set) => ({
      viewMode: "list",
      activeTab: "all",
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "starred-view-store",
    }
  )
)
