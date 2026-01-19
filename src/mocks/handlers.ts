import { delay, HttpResponse, http } from "msw"
import {
  mockAssetDetails,
  mockAssets,
  updateMockAsset,
} from "@/features/journal/data/mock-journals"
import type {
  GetAssetResponse,
  ListAssetsResponse,
  UpdateAssetStatusRequest,
  UpdateAssetStatusResponse,
} from "@/features/journal/types"

const API_DELAY = 150 // Simulated network delay in ms
const VALIDATION_DELAY = 400 // Delay for validation simulation
const EBS_UPLOAD_DELAY = 600 // Delay for EBS upload simulation

export const handlers = [
  // List assets
  http.get("/api/assets", async ({ request }) => {
    await delay(API_DELAY)

    const url = new URL(request.url)
    const period = url.searchParams.get("period")

    let filteredAssets = [...mockAssets]

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
      data: { ...assetDetail },
    }

    return HttpResponse.json(response)
  }),

  // Update asset workflow status
  http.patch("/api/assets/:assetId/status", async ({ params, request }) => {
    const { assetId } = params
    const body = (await request.json()) as UpdateAssetStatusRequest

    const asset = mockAssetDetails[assetId as string]
    if (!asset) {
      return new HttpResponse(null, { status: 404 })
    }

    // Simulate different delays based on action
    if (body.validationStatus === "VALIDATING") {
      await delay(VALIDATION_DELAY)
      // Auto-complete validation with success for demo
      body.validationStatus = "SUCCESS"
    } else if (body.ebsStatus === "UPLOADING") {
      await delay(EBS_UPLOAD_DELAY)
      // Auto-complete EBS upload with success for demo
      body.ebsStatus = "SUCCESS"
    } else {
      await delay(API_DELAY)
    }

    // Update the mock data
    const updatedAsset = updateMockAsset(assetId as string, {
      status: body.status ?? asset.status,
      validationStatus: body.validationStatus ?? asset.validationStatus,
      ebsStatus: body.ebsStatus ?? asset.ebsStatus,
      rejectionReason: body.rejectionReason,
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    const response: UpdateAssetStatusResponse = {
      data: updatedAsset,
    }

    return HttpResponse.json(response)
  }),

  // Validate asset entries - moves to SUBMISSION on success
  http.post("/api/assets/:assetId/validate", async ({ params }) => {
    await delay(VALIDATION_DELAY)

    const { assetId } = params

    // Validation passes → move to SUBMISSION status
    const updatedAsset = updateMockAsset(assetId as string, {
      status: "SUBMISSION",
      validationStatus: "SUCCESS",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    const response: UpdateAssetStatusResponse = {
      data: updatedAsset,
    }

    return HttpResponse.json(response)
  }),

  // Submit asset for review
  http.post("/api/assets/:assetId/submit", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params

    const updatedAsset = updateMockAsset(assetId as string, {
      status: "SUBMISSION",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Submit for review (from submission to review)
  http.post("/api/assets/:assetId/submit-for-review", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params

    const updatedAsset = updateMockAsset(assetId as string, {
      status: "REVIEW",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Approve asset (reviewer action)
  http.post("/api/assets/:assetId/approve", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params

    // Move to EBS upload and start uploading
    const updatedAsset = updateMockAsset(assetId as string, {
      status: "EBS_UPLOAD",
      ebsStatus: "UPLOADING",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Complete EBS upload
  http.post("/api/assets/:assetId/complete-ebs", async ({ params }) => {
    await delay(EBS_UPLOAD_DELAY)

    const { assetId } = params

    const updatedAsset = updateMockAsset(assetId as string, {
      ebsStatus: "SUCCESS",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Reject asset (reviewer action)
  http.post("/api/assets/:assetId/reject", async ({ params, request }) => {
    await delay(API_DELAY)

    const { assetId } = params
    const body = (await request.json()) as { reason?: string }

    const updatedAsset = updateMockAsset(assetId as string, {
      status: "PREPARATION",
      validationStatus: "PENDING",
      rejectionReason: body.reason || "Rejected by reviewer",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Reverse/reset asset (demo utility)
  http.post("/api/assets/:assetId/reverse", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params

    const updatedAsset = updateMockAsset(assetId as string, {
      status: "PREPARATION",
      validationStatus: "PENDING",
      ebsStatus: "PENDING",
      rejectionReason: undefined,
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),

  // Revert to preparation (from submission)
  http.post("/api/assets/:assetId/revert", async ({ params }) => {
    await delay(API_DELAY)

    const { assetId } = params

    const updatedAsset = updateMockAsset(assetId as string, {
      status: "PREPARATION",
      validationStatus: "PENDING",
    })

    if (!updatedAsset) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: updatedAsset })
  }),
]
