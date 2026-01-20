import { ChevronRight, Plus } from "lucide-react"
import { lazy, Suspense, useEffect } from "react"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ListViewLoading, ViewLoading } from "@/components/ui/view-loading"
import { useAssetDetail, useAssets } from "@/features/journal/api/queries"
import { useUrlSync } from "@/features/journal/hooks/use-url-sync"
import { useDashboardStore, type ViewMode } from "@/features/journal/state/dashboard-store"
import { useJournalStore } from "@/features/journal/state/journal-store"
import { useThemeStore } from "@/shared/state/theme-store"

// Lazy load heavy view components for code splitting
const DashboardView = lazy(() =>
  import("@/features/journal/components/dashboard/dashboard-view").then((m) => ({
    default: m.DashboardView,
  }))
)
const JournalDetailPanel = lazy(() =>
  import("@/features/journal/components/journal-detail-panel").then((m) => ({
    default: m.JournalDetailPanel,
  }))
)
const JournalListPanel = lazy(() =>
  import("@/features/journal/components/journal-list-panel").then((m) => ({
    default: m.JournalListPanel,
  }))
)

export function AppShell() {
  const { selectedAssetId, setSelectedAssetId } = useJournalStore()
  const { viewMode, setViewMode } = useDashboardStore()
  const theme = useThemeStore((state) => state.theme)

  // Sync URL with dashboard state
  useUrlSync()

  const { data: assetsResponse, isLoading: isLoadingAssets } = useAssets()
  const assets = assetsResponse?.data ?? []

  const { data: assetDetailResponse, isLoading: isLoadingDetail } = useAssetDetail(selectedAssetId)
  const selectedAsset = assetDetailResponse?.data ?? null

  useEffect(() => {
    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id)
    }
  }, [assets, selectedAssetId, setSelectedAssetId])

  const handleViewModeChange = (value: string) => {
    if (value) {
      setViewMode(value as ViewMode)
    }
  }

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
          {viewMode === "list" && (
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
          )}
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup onValueChange={handleViewModeChange} type="single" value={viewMode}>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="dashboard">Dashboard</ToggleGroupItem>
          </ToggleGroup>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Journal Entry
          </Button>
        </div>
      </div>
      <Suspense fallback={viewMode === "list" ? <ListViewLoading /> : <ViewLoading />}>
        {viewMode === "list" ? (
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
        ) : (
          <DashboardView />
        )}
      </Suspense>
    </MainLayout>
  )
}
