import { useCallback, useEffect, useRef } from "react"
import {
  useApproveAsset,
  useCompleteEbsUpload,
  useRejectAsset,
  useReverseAsset,
  useRevertAsset,
  useSubmitForReview,
  useValidateAsset,
} from "@/features/journal/api/mutations"
import { EbsUploadActions } from "@/features/journal/components/status-actions/ebs-upload-actions"
import { PreparationActions } from "@/features/journal/components/status-actions/preparation-actions"
import { ReviewActions } from "@/features/journal/components/status-actions/review-actions"
import { SubmissionActions } from "@/features/journal/components/status-actions/submission-actions"
import { useJournalStore } from "@/features/journal/state/journal-store"
import type { AssetDetail } from "@/features/journal/types"

interface StatusActionsProps {
  asset: AssetDetail
}

export function StatusActions({ asset }: StatusActionsProps) {
  const { status, ebsStatus } = asset
  const setDetailView = useJournalStore((state) => state.setDetailView)

  const validateMutation = useValidateAsset()
  const submitForReviewMutation = useSubmitForReview()
  const approveMutation = useApproveAsset()
  const completeEbsMutation = useCompleteEbsUpload()
  const rejectMutation = useRejectAsset()
  const reverseMutation = useReverseAsset()
  const revertMutation = useRevertAsset()

  const completeEbsRef = useRef(completeEbsMutation.mutate)
  completeEbsRef.current = completeEbsMutation.mutate

  const ebsTriggeredRef = useRef(false)

  const triggerEbsComplete = useCallback((assetId: string) => {
    completeEbsRef.current(assetId)
  }, [])

  useEffect(() => {
    if (status === "EBS_UPLOAD" && ebsStatus === "UPLOADING" && !ebsTriggeredRef.current) {
      ebsTriggeredRef.current = true
      const timer = setTimeout(() => {
        triggerEbsComplete(asset.id)
      }, 400)
      return () => clearTimeout(timer)
    }

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

  switch (status) {
    case "PREPARATION":
      return (
        <PreparationActions
          asset={asset}
          isLoading={isLoading}
          isValidating={validateMutation.isPending}
          onOpenCoverSheet={() => setDetailView("preparer-cover-sheet")}
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
          onOpenReviewSummary={() => setDetailView("reviewer-summary")}
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
