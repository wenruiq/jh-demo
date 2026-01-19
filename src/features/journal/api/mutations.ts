import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { syncAssetQueries } from "@/features/journal/api/cache"
import {
  approveAsset,
  completeEbsUpload,
  rejectAsset,
  reverseAsset,
  revertAsset,
  submitForReview,
  validateAsset,
} from "@/features/journal/api/client"
import type { UpdateAssetStatusResponse } from "@/features/journal/types"

interface MutationMessages {
  successTitle: string
  successDescription: string
  errorTitle: string
  errorDescription: string
}

interface MutationConfig<TVariables> {
  mutationFn: (variables: TVariables) => Promise<UpdateAssetStatusResponse>
  messages: MutationMessages
  getAssetId?: (variables: TVariables) => string
  onSuccess?: (data: UpdateAssetStatusResponse, variables: TVariables) => void
}

function useAssetMutation<TVariables>({
  mutationFn,
  messages,
  getAssetId,
  onSuccess,
}: MutationConfig<TVariables>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      const assetId = getAssetId?.(variables)
      if (assetId) {
        syncAssetQueries(queryClient, assetId, data)
      }
      onSuccess?.(data, variables)
      toast.success(messages.successTitle, {
        description: messages.successDescription,
      })
    },
    onError: () => {
      toast.error(messages.errorTitle, {
        description: messages.errorDescription,
      })
    },
  })
}

export function useValidateAsset() {
  return useAssetMutation({
    mutationFn: (assetId: string) => validateAsset(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Validation complete",
      successDescription: "Ready for submission",
      errorTitle: "Validation failed",
      errorDescription: "Please check the entry and try again",
    },
  })
}

export function useSubmitForReview() {
  return useAssetMutation({
    mutationFn: (assetId: string) => submitForReview(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Submitted for review",
      successDescription: "Entry is now pending reviewer approval",
      errorTitle: "Submission failed",
      errorDescription: "Please try again",
    },
  })
}

export function useApproveAsset() {
  return useAssetMutation({
    mutationFn: (assetId: string) => approveAsset(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Entry approved",
      successDescription: "Proceeding to EBS upload",
      errorTitle: "Approval failed",
      errorDescription: "Please try again",
    },
  })
}

export function useCompleteEbsUpload() {
  return useAssetMutation({
    mutationFn: (assetId: string) => completeEbsUpload(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Upload complete",
      successDescription: "Entry successfully posted to EBS",
      errorTitle: "Upload failed",
      errorDescription: "Please try again",
    },
  })
}

export function useRejectAsset() {
  return useAssetMutation({
    mutationFn: ({ assetId, reason }: { assetId: string; reason?: string }) =>
      rejectAsset(assetId, reason),
    getAssetId: (variables) => variables.assetId,
    messages: {
      successTitle: "Entry returned",
      successDescription: "Sent back to preparer for revision",
      errorTitle: "Action failed",
      errorDescription: "Please try again",
    },
  })
}

export function useReverseAsset() {
  return useAssetMutation({
    mutationFn: (assetId: string) => reverseAsset(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Entry reversed",
      successDescription: "Workflow has been reset",
      errorTitle: "Reverse failed",
      errorDescription: "Please try again",
    },
  })
}

export function useRevertAsset() {
  return useAssetMutation({
    mutationFn: (assetId: string) => revertAsset(assetId),
    getAssetId: (assetId) => assetId,
    messages: {
      successTitle: "Reverted to preparation",
      successDescription: "You can now make changes",
      errorTitle: "Revert failed",
      errorDescription: "Please try again",
    },
  })
}
