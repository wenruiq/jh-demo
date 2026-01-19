import { AlertCircle, Check, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AssetDetail } from "@/features/journal/types"
import { cn } from "@/shared/lib/utils"

interface PreparationActionsProps {
  asset: AssetDetail
  onValidate: () => void
  onOpenCoverSheet: () => void
  isValidating: boolean
  isLoading: boolean
}

export function PreparationActions({
  asset,
  onValidate,
  onOpenCoverSheet,
  isValidating,
  isLoading,
}: PreparationActionsProps) {
  const showRejectionNotice = Boolean(asset.rejectionReason)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
          showRejectionNotice ? "bg-warning-muted text-warning" : "bg-muted text-muted-foreground"
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">
          {showRejectionNotice ? "Returned for Revision" : "Preparation in Progress"}
        </span>
      </div>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onOpenCoverSheet}
        size="sm"
        variant="outline"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Prepare Cover Sheet
      </Button>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onValidate}
        size="sm"
      >
        {isValidating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        {isValidating ? "Validating..." : "Validate"}
      </Button>
    </div>
  )
}
