import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
    },
  })
}
