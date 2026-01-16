// Asset types (journal entry categories)
export const ASSET_TYPES = ["GL", "AR", "AP", "GRP"] as const
export type AssetType = (typeof ASSET_TYPES)[number]

// Asset statuses (workflow stages)
export const ASSET_STATUSES = [
  "ASSET_GENERATED",
  "ENTRY_GENERATED",
  "SUBMITTING",
  "VALIDATING",
  "VALIDATED",
  "IN_REVIEW",
  "APPROVED",
  "CLOSED",
] as const
export type AssetStatus = (typeof ASSET_STATUSES)[number]

// Human readable status labels
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  ASSET_GENERATED: "Generated",
  ENTRY_GENERATED: "Entry Generated",
  SUBMITTING: "Submitting",
  VALIDATING: "Validating",
  VALIDATED: "Validated",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  CLOSED: "Closed",
}

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
