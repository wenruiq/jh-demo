import { FileText, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { AssetDetail } from "@/types/journal"
import { JournalDetailHeader } from "./journal-detail-header"

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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex h-full items-center justify-center rounded-lg border-2 border-muted border-dashed">
          <p className="text-muted-foreground">Detail content will be added here</p>
        </div>
      </div>
    </div>
  )
}
