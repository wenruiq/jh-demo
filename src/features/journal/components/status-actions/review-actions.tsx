import { AlertCircle, Check, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewActionsProps {
  onApprove: () => void
  onReject: () => void
  onOpenReviewSummary: () => void
  isApproving: boolean
  isRejecting: boolean
  isLoading: boolean
}

export function ReviewActions({
  onApprove,
  onReject,
  onOpenReviewSummary,
  isApproving,
  isRejecting,
  isLoading,
}: ReviewActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-muted-foreground text-sm">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Pending Review</span>
      </div>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onOpenReviewSummary}
        size="sm"
        variant="outline"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Review Summary
      </Button>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onReject}
        size="sm"
        variant="outline"
      >
        {isRejecting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        Reject
      </Button>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onApprove}
        size="sm"
      >
        {isApproving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Approve
      </Button>
    </div>
  )
}
