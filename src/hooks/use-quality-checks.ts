// Quality Checks Hook
// Custom hook for quality check operations

import { getAvailableMentions } from "@/components/journal/sections/quality-checks/utils"
import { useDataUploadStore } from "@/store/data-upload-store"
import { useJournalStore } from "@/store/journal-store"

/**
 * Hook to get available mentions for quality checks
 * Combines JournalEntry with data upload names
 */
export function useAvailableMentions(): string[] {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)

  const uploads = selectedAssetId ? (uploadsByAssetId[selectedAssetId] ?? []) : []
  const uploadNames = uploads.map((u) => u.name)

  return getAvailableMentions(uploadNames)
}
