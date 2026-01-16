import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Asset } from "@/types/journal"
import { ASSET_STATUS_LABELS } from "@/types/journal"

interface JournalCardProps {
  asset: Asset
  isSelected: boolean
  onClick: () => void
}

export function JournalCard({ asset, isSelected, onClick }: JournalCardProps) {
  return (
    <button
      className={cn(
        "w-full rounded-lg p-3 text-left transition-colors",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected ? "border-l-2 border-l-primary bg-muted" : "border border-border bg-background"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 font-medium text-sm leading-tight">{asset.name}</div>
      <div className="flex items-center gap-2">
        <Badge variant="neutral">{asset.type}</Badge>
        <Badge variant="blue">{ASSET_STATUS_LABELS[asset.status]}</Badge>
      </div>
    </button>
  )
}
