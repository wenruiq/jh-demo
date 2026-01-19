import { ChevronRight, Link, RefreshCw, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type DetailView, useJournalStore } from "@/features/journal/state/journal-store"
import type { AssetDetail } from "@/features/journal/types"
import { ASSET_STATUS_LABELS } from "@/features/journal/types"

const VIEW_LABELS: Record<DetailView, string> = {
  journal: "",
  "preparer-cover-sheet": "Preparer Cover Sheet",
  "reviewer-summary": "Reviewer Summary",
  "reviewer-cover-sheet": "Preparer Cover Sheet (Read-only)",
}

interface JournalDetailHeaderProps {
  asset: AssetDetail
}

export function JournalDetailHeader({ asset }: JournalDetailHeaderProps) {
  const detailView = useJournalStore((state) => state.detailView)
  const viewLabel = VIEW_LABELS[detailView]

  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="cursor-pointer font-medium text-primary hover:underline">
          {asset.name}
        </span>
        {viewLabel && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{viewLabel}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="blue">{ASSET_STATUS_LABELS[asset.status]}</Badge>
        <Badge variant="outline">{asset.period}</Badge>
        <div className="ml-2 flex items-center gap-1">
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <Link className="h-4 w-4" />
          </Button>
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
