import { create } from "zustand"

export const DETAIL_VIEWS = [
  "journal",
  "preparer-cover-sheet",
  "reviewer-summary",
  "reviewer-cover-sheet",
] as const

export type DetailView = (typeof DETAIL_VIEWS)[number]

interface JournalStore {
  selectedAssetId: string | null
  detailView: DetailView
  setSelectedAssetId: (id: string | null) => void
  setDetailView: (view: DetailView) => void
  resetToJournalView: () => void
}

export const useJournalStore = create<JournalStore>((set) => ({
  selectedAssetId: null,
  detailView: "journal",
  setSelectedAssetId: (id) => set({ selectedAssetId: id, detailView: "journal" }),
  setDetailView: (view) => set({ detailView: view }),
  resetToJournalView: () => set({ detailView: "journal" }),
}))
