import { Link, RefreshCw, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AssetDetail } from "@/types/journal"
import { ASSET_STATUS_LABELS } from "@/types/journal"

interface JournalDetailHeaderProps {
  asset: AssetDetail
}

export function JournalDetailHeader({ asset }: JournalDetailHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
      <span className="cursor-pointer font-medium text-primary hover:underline">{asset.name}</span>
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
