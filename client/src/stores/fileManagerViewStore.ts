import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FileManagerViewMode = "grid" | "list"

type FileManagerViewStore = {
  viewMode: FileManagerViewMode
  setViewMode: (mode: FileManagerViewMode) => void
}

export const useFileManagerViewStore = create<FileManagerViewStore>()(
  persist(
    (set) => ({
      viewMode: "grid",
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "file-manager-view-store",
    }
  )
)
