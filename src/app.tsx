import { ChevronRight, Plus } from "lucide-react"
import { useEffect } from "react"
import { JournalDetailPanel } from "@/components/journal/journal-detail-panel"
import { JournalListPanel } from "@/components/journal/journal-list-panel"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssetDetail, useAssets } from "@/hooks/use-assets"
import { useJournalStore } from "@/store/journal-store"

function App() {
  const { selectedAssetId, setSelectedAssetId } = useJournalStore()

  // Fetch assets list
  const { data: assetsResponse, isLoading: isLoadingAssets } = useAssets()
  const assets = assetsResponse?.data ?? []

  // Fetch selected asset detail
  const { data: assetDetailResponse, isLoading: isLoadingDetail } = useAssetDetail(selectedAssetId)
  const selectedAsset = assetDetailResponse?.data ?? null

  // Auto-select first asset when list loads
  useEffect(() => {
    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id)
    }
  }, [assets, selectedAssetId, setSelectedAssetId])

  return (
    <MainLayout>
      <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Journal Entry</span>
          </div>
          <Select defaultValue="2025-12">
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-12">2025-12</SelectItem>
              <SelectItem value="2025-11">2025-11</SelectItem>
              <SelectItem value="2025-10">2025-10</SelectItem>
              <SelectItem value="2025-09">2025-09</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Journal Entry
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <JournalListPanel
          assets={assets}
          isLoading={isLoadingAssets}
          onSelect={setSelectedAssetId}
          selectedId={selectedAssetId}
        />
        <JournalDetailPanel
          asset={selectedAsset}
          isLoading={isLoadingDetail && !!selectedAssetId}
        />
      </div>
    </MainLayout>
  )
}

export default App
