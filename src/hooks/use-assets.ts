import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  approveAsset,
  completeEbsUpload,
  fetchAssetDetail,
  fetchAssets,
  rejectAsset,
  reverseAsset,
  revertAsset,
  submitForReview,
  validateAsset,
} from "@/api/assets"

export function useAssets(period?: string) {
  return useQuery({
    queryKey: ["assets", period],
    queryFn: () => fetchAssets(period),
  })
}

export function useAssetDetail(assetId: string | null) {
  return useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => {
      if (!assetId) {
        throw new Error("Asset ID is required")
      }
      return fetchAssetDetail(assetId)
    },
    enabled: !!assetId,
  })
}

// Hook for validating asset entries
export function useValidateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => validateAsset(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Validation complete", {
        description: "Ready for submission",
      })
    },
    onError: () => {
      toast.error("Validation failed", {
        description: "Please check the entry and try again",
      })
    },
  })
}

// Hook for submitting asset for review
export function useSubmitForReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => submitForReview(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Submitted for review", {
        description: "Entry is now pending reviewer approval",
      })
    },
    onError: () => {
      toast.error("Submission failed", {
        description: "Please try again",
      })
    },
  })
}

// Hook for approving asset
export function useApproveAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => approveAsset(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Entry approved", {
        description: "Proceeding to EBS upload",
      })
    },
    onError: () => {
      toast.error("Approval failed", {
        description: "Please try again",
      })
    },
  })
}

// Hook for completing EBS upload
export function useCompleteEbsUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => completeEbsUpload(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Upload complete", {
        description: "Entry successfully posted to EBS",
      })
    },
    onError: () => {
      toast.error("Upload failed", {
        description: "Please try again",
      })
    },
  })
}

// Hook for rejecting asset
export function useRejectAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assetId, reason }: { assetId: string; reason?: string }) =>
      rejectAsset(assetId, reason),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["asset", variables.assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Entry returned", {
        description: "Sent back to preparer for revision",
      })
    },
    onError: () => {
      toast.error("Action failed", {
        description: "Please try again",
      })
    },
  })
}

// Hook for reversing asset (demo reset)
export function useReverseAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => reverseAsset(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Entry reversed", {
        description: "Workflow has been reset",
      })
    },
    onError: () => {
      toast.error("Reverse failed", {
        description: "Please try again",
      })
    },
  })
}

// Hook for reverting to preparation
export function useRevertAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) => revertAsset(assetId),
    onSuccess: (data, assetId) => {
      queryClient.setQueryData(["asset", assetId], data)
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Reverted to preparation", {
        description: "You can now make changes",
      })
    },
    onError: () => {
      toast.error("Revert failed", {
        description: "Please try again",
      })
    },
  })
}
