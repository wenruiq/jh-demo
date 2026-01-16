import { create } from "zustand"

interface JournalStore {
  selectedAssetId: string | null
  setSelectedAssetId: (id: string | null) => void
}

export const useJournalStore = create<JournalStore>((set) => ({
  selectedAssetId: null,
  setSelectedAssetId: (id) => set({ selectedAssetId: id }),
}))
