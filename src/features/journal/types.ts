// Asset types (journal entry categories)
export const ASSET_TYPES = ["GL", "AR", "AP", "GRP"] as const
export type AssetType = (typeof ASSET_TYPES)[number]

// Asset statuses (workflow stages)
export const ASSET_STATUSES = [
  "GENERATION",
  "PREPARATION",
  "SUBMISSION",
  "REVIEW",
  "EBS_UPLOAD",
] as const
export type AssetStatus = (typeof ASSET_STATUSES)[number]

// Human readable status labels
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  GENERATION: "Generation",
  PREPARATION: "Preparation",
  SUBMISSION: "Submission",
  REVIEW: "Review",
  EBS_UPLOAD: "EBS Upload",
}

// Validation status for preparation phase
export const VALIDATION_STATUSES = ["PENDING", "VALIDATING", "SUCCESS", "FAILED"] as const
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number]

// EBS upload status
export const EBS_STATUSES = ["PENDING", "UPLOADING", "SUCCESS", "FAILED"] as const
export type EbsStatus = (typeof EBS_STATUSES)[number]

// View modes for list filtering
export const VIEW_MODES = ["PENDING_ACTION", "INVOLVES_ME", "ALL"] as const
export type ViewMode = (typeof VIEW_MODES)[number]

// Identity (user/assignee)
export interface Identity {
  id: string
  username: string
  fullname: string
  avatar?: string
}

// Asset (journal entry container)
export interface Asset {
  id: string
  name: string
  description?: string
  type: AssetType
  status: AssetStatus
  validationStatus: ValidationStatus
  ebsStatus: EbsStatus
  period: string // e.g. "2025-01"
  currency?: string
  companyName?: string
  preparerList?: Identity[]
  reviewerList?: Identity[]
  createdAt: string
  updatedAt: string
}

// Asset detail (extended info for detail view)
export interface AssetDetail extends Asset {
  totalDebitAmount?: string
  totalCreditAmount?: string
  attachmentCount?: number
  journalEntryCount?: number
  rejectionReason?: string
}

// API response types
export interface ListAssetsResponse {
  data: Asset[]
  meta: {
    offset: number
    limit: number
    total: number
  }
}

export interface GetAssetResponse {
  data: AssetDetail
}

// Update status request/response
export interface UpdateAssetStatusRequest {
  status?: AssetStatus
  validationStatus?: ValidationStatus
  ebsStatus?: EbsStatus
  rejectionReason?: string
}

export interface UpdateAssetStatusResponse {
  data: AssetDetail
}
