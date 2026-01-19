import { useQuery } from "@tanstack/react-query"
import { fetchAssetDetail, fetchAssets } from "@/features/journal/api/client"

export const assetsQueryKey = (period?: string) => ["assets", period] as const
export const assetDetailQueryKey = (assetId: string) => ["asset", assetId] as const

export function useAssets(period?: string) {
  return useQuery({
    queryKey: assetsQueryKey(period),
    queryFn: () => fetchAssets(period),
  })
}

export function useAssetDetail(assetId: string | null) {
  const assetDetailId = assetId ?? ""
  const enabled = assetDetailId.length > 0

  return useQuery({
    queryKey: enabled ? assetDetailQueryKey(assetDetailId) : ["asset", "none"],
    queryFn: () => fetchAssetDetail(assetDetailId),
    enabled,
  })
}
