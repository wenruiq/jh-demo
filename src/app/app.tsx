import { ChevronRight, Plus } from "lucide-react"
import { useEffect } from "react"
import { Toaster } from "sonner"
import { MainLayout } from "@/app/layout/main-layout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssetDetail, useAssets } from "@/features/journal/api/queries"
import { JournalDetailPanel } from "@/features/journal/components/journal-detail-panel"
import { JournalListPanel } from "@/features/journal/components/journal-list-panel"
import { useJournalStore } from "@/features/journal/state/journal-store"
import { useThemeStore } from "@/shared/state/theme-store"

export function AppShell() {
  const { selectedAssetId, setSelectedAssetId } = useJournalStore()
  const theme = useThemeStore((state) => state.theme)

  const { data: assetsResponse, isLoading: isLoadingAssets } = useAssets()
  const assets = assetsResponse?.data ?? []

  const { data: assetDetailResponse, isLoading: isLoadingDetail } = useAssetDetail(selectedAssetId)
  const selectedAsset = assetDetailResponse?.data ?? null

  useEffect(() => {
    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id)
    }
  }, [assets, selectedAssetId, setSelectedAssetId])

  return (
    <MainLayout>
      <Toaster
        duration={2500}
        expand={false}
        gap={8}
        offset={16}
        position="bottom-center"
        theme={theme}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-md group-[.toaster]:rounded-md",
            description: "group-[.toast]:text-muted-foreground text-xs",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            success: "[&_[data-icon]]:text-success",
            error: "[&_[data-icon]]:text-destructive",
          },
        }}
        visibleToasts={3}
      />
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
          isLoading={
            isLoadingAssets ||
            (isLoadingDetail && !!selectedAssetId) ||
            (assets.length > 0 && !selectedAssetId)
          }
        />
      </div>
    </MainLayout>
  )
}
