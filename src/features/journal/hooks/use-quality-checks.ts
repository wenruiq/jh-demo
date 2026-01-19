import { getAvailableMentions } from "@/features/journal/components/sections/quality-checks/utils"
import { useDataUploadStore } from "@/features/journal/state/data-upload-store"
import { useJournalStore } from "@/features/journal/state/journal-store"

export function useAvailableMentions(): string[] {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)

  const uploads = selectedAssetId ? (uploadsByAssetId[selectedAssetId] ?? []) : []
  const uploadNames = uploads.map((u) => u.name)

  return getAvailableMentions(uploadNames)
}
