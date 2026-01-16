import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RefreshCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  useApproveAsset,
  useCompleteEbsUpload,
  useRejectAsset,
  useReverseAsset,
  useRevertAsset,
  useSubmitForReview,
  useValidateAsset,
} from "@/hooks/use-assets"
import { cn } from "@/lib/utils"
import type { AssetDetail, EbsStatus } from "@/types/journal"

interface StatusActionsProps {
  asset: AssetDetail
}

export function StatusActions({ asset }: StatusActionsProps) {
  const { status, ebsStatus } = asset

  const validateMutation = useValidateAsset()
  const submitForReviewMutation = useSubmitForReview()
  const approveMutation = useApproveAsset()
  const completeEbsMutation = useCompleteEbsUpload()
  const rejectMutation = useRejectAsset()
  const reverseMutation = useReverseAsset()
  const revertMutation = useRevertAsset()

  // Stable reference to the complete mutation function
  const completeEbsRef = useRef(completeEbsMutation.mutate)
  completeEbsRef.current = completeEbsMutation.mutate

  // Track if EBS completion was triggered to prevent duplicate calls
  const ebsTriggeredRef = useRef(false)

  // Stable callback for completing EBS upload
  const triggerEbsComplete = useCallback((assetId: string) => {
    completeEbsRef.current(assetId)
  }, [])

  // Auto-complete EBS upload after moving to EBS_UPLOAD status
  useEffect(() => {
    // Only trigger when status is EBS_UPLOAD and ebsStatus is UPLOADING
    if (status === "EBS_UPLOAD" && ebsStatus === "UPLOADING" && !ebsTriggeredRef.current) {
      ebsTriggeredRef.current = true
      const timer = setTimeout(() => {
        triggerEbsComplete(asset.id)
      }, 400)
      return () => clearTimeout(timer)
    }

    // Reset ref when we leave EBS_UPLOAD status
    if (status !== "EBS_UPLOAD") {
      ebsTriggeredRef.current = false
    }
  }, [status, ebsStatus, asset.id, triggerEbsComplete])

  const isLoading =
    validateMutation.isPending ||
    submitForReviewMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    reverseMutation.isPending ||
    revertMutation.isPending

  // Render different action panels based on status
  switch (status) {
    case "PREPARATION":
      return (
        <PreparationActions
          asset={asset}
          isLoading={isLoading}
          isValidating={validateMutation.isPending}
          onValidate={() => validateMutation.mutate(asset.id)}
        />
      )

    case "SUBMISSION":
      return (
        <SubmissionActions
          isLoading={isLoading}
          isReverting={revertMutation.isPending}
          isSubmitting={submitForReviewMutation.isPending}
          onRevert={() => revertMutation.mutate(asset.id)}
          onSubmitForReview={() => submitForReviewMutation.mutate(asset.id)}
        />
      )

    case "REVIEW":
      return (
        <ReviewActions
          isApproving={approveMutation.isPending}
          isLoading={isLoading}
          isRejecting={rejectMutation.isPending}
          onApprove={() => approveMutation.mutate(asset.id)}
          onReject={() => rejectMutation.mutate({ assetId: asset.id })}
        />
      )

    case "EBS_UPLOAD":
      return (
        <EbsUploadActions
          ebsStatus={ebsStatus}
          isReversing={reverseMutation.isPending}
          onReverse={() => reverseMutation.mutate(asset.id)}
        />
      )

    default:
      return null
  }
}

// Preparation Phase Actions
interface PreparationActionsProps {
  asset: AssetDetail
  onValidate: () => void
  isValidating: boolean
  isLoading: boolean
}

function PreparationActions({
  asset,
  onValidate,
  isValidating,
  isLoading,
}: PreparationActionsProps) {
  const showRejectionNotice = Boolean(asset.rejectionReason)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Info - Warning/Destructive styling for rejection, Muted for in-progress */}
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

      {/* Action Buttons */}
      <Button className="h-8 gap-1.5 px-3 text-xs" disabled={isLoading} size="sm" variant="outline">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Cover Sheet
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

// Submission Phase Actions
interface SubmissionActionsProps {
  onSubmitForReview: () => void
  onRevert: () => void
  isSubmitting: boolean
  isReverting: boolean
  isLoading: boolean
}

function SubmissionActions({
  onSubmitForReview,
  onRevert,
  isSubmitting,
  isReverting,
  isLoading,
}: SubmissionActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Info - Success state with subtle green */}
      <div className="flex items-center gap-2 rounded-md bg-success-muted px-3 py-1.5 text-sm">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="font-medium text-success">Validation Passed</span>
      </div>

      {/* Action Buttons */}
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

// Review Phase Actions
interface ReviewActionsProps {
  onApprove: () => void
  onReject: () => void
  isApproving: boolean
  isRejecting: boolean
  isLoading: boolean
}

function ReviewActions({
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  isLoading,
}: ReviewActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Info */}
      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-muted-foreground text-sm">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Pending Review</span>
      </div>

      {/* Action Buttons */}
      <Button className="h-8 gap-1.5 px-3 text-xs" disabled={isLoading} size="sm" variant="outline">
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

// EBS Upload Phase Actions
interface EbsUploadActionsProps {
  ebsStatus: EbsStatus
  onReverse: () => void
  isReversing: boolean
}

function EbsUploadActions({ ebsStatus, onReverse, isReversing }: EbsUploadActionsProps) {
  const isUploading = ebsStatus === "UPLOADING"
  const isSuccess = ebsStatus === "SUCCESS"

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Info - Semantic colors based on state */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
          isSuccess && "bg-success-muted",
          isUploading && "bg-info-muted",
          !(isUploading || isSuccess) && "bg-muted text-muted-foreground"
        )}
      >
        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-info" />}
        {isSuccess && <CheckCircle2 className="h-4 w-4 text-success" />}
        {!(isUploading || isSuccess) && <AlertCircle className="h-4 w-4" />}
        <span
          className={cn("font-medium", isSuccess && "text-success", isUploading && "text-info")}
        >
          {isUploading && "Uploading to EBS..."}
          {isSuccess && "EBS Upload Complete"}
          {!(isUploading || isSuccess) && "EBS Upload Pending"}
        </span>
      </div>

      {/* Action Buttons - only show Reverse after success */}
      {isSuccess && (
        <Button
          className="h-8 gap-1.5 px-3 text-xs"
          disabled={isReversing}
          onClick={onReverse}
          size="sm"
          variant="outline"
        >
          {isReversing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5" />
          )}
          {isReversing ? "Reversing..." : "Reverse (Demo)"}
        </Button>
      )}
    </div>
  )
}
