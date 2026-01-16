import { useQuery } from "@tanstack/react-query"
import { fetchAssets, fetchAssetDetail } from "@/api/assets"

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
      if (!assetId) throw new Error("Asset ID is required")
      return fetchAssetDetail(assetId)
    },
    enabled: !!assetId,
  })
}
