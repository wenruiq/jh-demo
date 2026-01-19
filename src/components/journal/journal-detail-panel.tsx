import { FileText, Loader2 } from "lucide-react"
import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useJournalStore } from "@/store/journal-store"
import type { AssetDetail } from "@/types/journal"
import { JournalDetailHeader } from "./journal-detail-header"
import { JournalView } from "./views/journal-view"

// Only lazy load secondary views - these are navigated to, not shown on initial load
const PreparerCoverSheetView = lazy(() =>
  import("./views/preparer-cover-sheet-view").then((m) => ({ default: m.PreparerCoverSheetView }))
)
const ReviewerCoverSheetView = lazy(() =>
  import("./views/reviewer-cover-sheet-view").then((m) => ({ default: m.ReviewerCoverSheetView }))
)
const ReviewerSummaryView = lazy(() =>
  import("./views/reviewer-summary-view").then((m) => ({ default: m.ReviewerSummaryView }))
)

interface JournalDetailPanelProps {
  asset: AssetDetail | null
  isLoading?: boolean
}

// Header skeleton - matches JournalDetailHeader layout
function HeaderSkeleton() {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="ml-2 flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Content skeleton - shows loading state for the main content area
function ContentSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// Full loading skeleton with header + content
function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HeaderSkeleton />
      <ContentSkeleton />
    </div>
  )
}

function ViewRouter({ asset }: { asset: AssetDetail }) {
  const detailView = useJournalStore((state) => state.detailView)

  // Default view is not lazy loaded - renders immediately
  if (detailView === "journal") {
    return <JournalView asset={asset} />
  }

  // Secondary views are lazy loaded - wrap in Suspense
  const lazyView = (() => {
    switch (detailView) {
      case "preparer-cover-sheet":
        return <PreparerCoverSheetView />
      case "reviewer-summary":
        return <ReviewerSummaryView />
      case "reviewer-cover-sheet":
        return <ReviewerCoverSheetView />
      default:
        return null
    }
  })()

  return <Suspense fallback={<ContentSkeleton />}>{lazyView}</Suspense>
}

export function JournalDetailPanel({ asset, isLoading }: JournalDetailPanelProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!asset) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
        <FileText className="mb-4 h-12 w-12" />
        <p className="font-medium text-lg">No journal selected</p>
        <p className="text-sm">Select a journal entry from the list to view details</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <JournalDetailHeader asset={asset} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <ViewRouter asset={asset} />
      </div>
    </div>
  )
}
