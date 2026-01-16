import type {
  GetAssetResponse,
  ListAssetsResponse,
  UpdateAssetStatusRequest,
  UpdateAssetStatusResponse,
} from "@/types/journal"

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
  updates: UpdateAssetStatusRequest
): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update asset status")
  }

  return response.json()
}

export async function validateAsset(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/validate`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to validate asset")
  }

  return response.json()
}

export async function submitAsset(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/submit`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to submit asset")
  }

  return response.json()
}

export async function submitForReview(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/submit-for-review`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to submit for review")
  }

  return response.json()
}

export async function approveAsset(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/approve`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to approve asset")
  }

  return response.json()
}

export async function completeEbsUpload(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/complete-ebs`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to complete EBS upload")
  }

  return response.json()
}

export async function rejectAsset(
  assetId: string,
  reason?: string
): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    throw new Error("Failed to reject asset")
  }

  return response.json()
}

export async function reverseAsset(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/reverse`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to reverse asset")
  }

  return response.json()
}

export async function revertAsset(assetId: string): Promise<UpdateAssetStatusResponse> {
  const response = await fetch(`/api/assets/${assetId}/revert`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to revert asset")
  }

  return response.json()
}
