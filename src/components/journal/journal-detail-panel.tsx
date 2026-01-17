import { FileText, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useJournalStore } from "@/store/journal-store"
import type { AssetDetail } from "@/types/journal"
import { JournalDetailHeader } from "./journal-detail-header"
import { JournalView } from "./views/journal-view"
import { PreparerCoverSheetView } from "./views/preparer-cover-sheet-view"
import { ReviewerCoverSheetView } from "./views/reviewer-cover-sheet-view"
import { ReviewerSummaryView } from "./views/reviewer-summary-view"

interface JournalDetailPanelProps {
  asset: AssetDetail | null
  isLoading?: boolean
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
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
      <div className="flex-1 p-6">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

function ViewRouter({ asset }: { asset: AssetDetail }) {
  const detailView = useJournalStore((state) => state.detailView)

  switch (detailView) {
    case "preparer-cover-sheet":
      return <PreparerCoverSheetView />
    case "reviewer-summary":
      return <ReviewerSummaryView />
    case "reviewer-cover-sheet":
      return <ReviewerCoverSheetView />
    default:
      return <JournalView asset={asset} />
  }
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
      <div className="flex-1 overflow-y-auto">
        <ViewRouter asset={asset} />
      </div>
    </div>
  )
}
