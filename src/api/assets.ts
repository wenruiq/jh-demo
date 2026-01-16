import type { GetAssetResponse, ListAssetsResponse } from "@/types/journal"

export async function fetchAssets(period?: string): Promise<ListAssetsResponse> {
  const params = new URLSearchParams()
  if (period) {
    params.set("period", period)
  }

  const url = `/api/assets${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch assets")
  }

  return response.json()
}

export async function fetchAssetDetail(assetId: string): Promise<GetAssetResponse> {
  const response = await fetch(`/api/assets/${assetId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch asset detail")
  }

  return response.json()
}

export async function updateAssetStatus(
  assetId: string,
  status: string
): Promise<GetAssetResponse> {
  const response = await fetch(`/api/assets/${assetId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error("Failed to update asset status")
  }

  return response.json()
}
