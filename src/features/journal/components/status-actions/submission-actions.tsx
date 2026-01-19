import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmissionActionsProps {
  onSubmitForReview: () => void
  onRevert: () => void
  isSubmitting: boolean
  isReverting: boolean
  isLoading: boolean
}

export function SubmissionActions({
  onSubmitForReview,
  onRevert,
  isSubmitting,
  isReverting,
  isLoading,
}: SubmissionActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-md bg-success-muted px-3 py-1.5 text-sm">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="font-medium text-success">Validation Passed</span>
      </div>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onRevert}
        size="sm"
        variant="outline"
      >
        {isReverting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowLeft className="h-3.5 w-3.5" />
        )}
        Back
      </Button>

      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isLoading}
        onClick={onSubmitForReview}
        size="sm"
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {isSubmitting ? "Submitting..." : "Submit for Review"}
      </Button>
    </div>
  )
}
