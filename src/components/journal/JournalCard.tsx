import type { Asset } from "@/types/journal"
import { ASSET_STATUS_LABELS } from "@/types/journal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface JournalCardProps {
  asset: Asset
  isSelected: boolean
  onClick: () => void
}

export function JournalCard({ asset, isSelected, onClick }: JournalCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg p-3 transition-colors",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected ? "bg-muted border-l-2 border-l-primary" : "border border-border bg-background",
      )}
    >
      <div className="mb-2 font-medium text-sm leading-tight">{asset.name}</div>
      <div className="flex items-center gap-2">
        <Badge variant="neutral">{asset.type}</Badge>
        <Badge variant="blue">{ASSET_STATUS_LABELS[asset.status]}</Badge>
      </div>
    </button>
  )
}
