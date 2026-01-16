import { http, HttpResponse, delay } from "msw"
import { mockAssets, mockAssetDetails } from "@/data/mockJournals"
import type { ListAssetsResponse, GetAssetResponse } from "@/types/journal"

const API_DELAY = 300 // Simulated network delay in ms

export const handlers = [
  // List assets
  http.get("/api/assets", async ({ request }) => {
    await delay(API_DELAY)

    const url = new URL(request.url)
    const period = url.searchParams.get("period")

    let filteredAssets = mockAssets

    // Filter by period if provided
    if (period) {
      filteredAssets = mockAssets.filter((asset) => asset.period === period)
    }

    const response: ListAssetsResponse = {
      data: filteredAssets,
      meta: {
        offset: 0,
        limit: 50,
        total: filteredAssets.length,
      },
    }

    return HttpResponse.json(response)
  }),

  // Get single asset detail
  http.get("/api/assets/:assetId", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params
    const assetDetail = mockAssetDetails[assetId as string]

    if (!assetDetail) {
      return new HttpResponse(null, { status: 404 })
    }

    const response: GetAssetResponse = {
      data: assetDetail,
    }

    return HttpResponse.json(response)
  }),

  // Update asset status (for future use)
  http.patch("/api/assets/:assetId/status", async ({ params, request }) => {
    await delay(API_DELAY)

    const { assetId } = params
    const body = (await request.json()) as { status: string }

    const asset = mockAssets.find((a) => a.id === assetId)
    if (!asset) {
      return new HttpResponse(null, { status: 404 })
    }

    // In a real app, this would update the database
    // For the mock, we just return the updated asset
    const updatedAsset = {
      ...mockAssetDetails[assetId as string],
      status: body.status,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: updatedAsset })
  }),
]
