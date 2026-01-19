import type {
  Asset,
  AssetDetail,
  AssetStatus,
  EbsStatus,
  ValidationStatus,
} from "@/features/journal/types"

function createAsset(
  id: string,
  name: string,
  type: Asset["type"],
  status: AssetStatus,
  period: string,
  companyName: string,
  validation: ValidationStatus = "PENDING",
  ebs: EbsStatus = "PENDING"
): Asset {
  return {
    id,
    name,
    type,
    status,
    validationStatus: validation,
    ebsStatus: ebs,
    period,
    companyName,
    createdAt: "2025-12-15T10:30:00Z",
    updatedAt: "2025-12-20T14:00:00Z",
  }
}

export const mockAssets: Asset[] = [
  createAsset(
    "asset-001",
    "AAGPH-Test One Time Upload",
    "GL",
    "PREPARATION",
    "2025-12",
    "Shopee SG",
    "SUCCESS"
  ),
  createAsset(
    "asset-002",
    "Q4 Accounts Receivable Adjustment",
    "AR",
    "REVIEW",
    "2025-12",
    "Shopee SG",
    "SUCCESS"
  ),
  createAsset(
    "asset-003",
    "Vendor Invoice Processing",
    "AP",
    "SUBMISSION",
    "2025-12",
    "Shopee MY",
    "SUCCESS"
  ),
  createAsset(
    "asset-004",
    "Intercompany Reconciliation",
    "GRP",
    "PREPARATION",
    "2025-12",
    "Sea Group",
    "PENDING"
  ),
  createAsset(
    "asset-005",
    "Depreciation Entry",
    "GL",
    "PREPARATION",
    "2025-12",
    "Shopee TH",
    "PENDING"
  ),
  createAsset(
    "asset-006",
    "Customer Payment Allocation",
    "AR",
    "EBS_UPLOAD",
    "2025-11",
    "Shopee ID",
    "SUCCESS",
    "SUCCESS"
  ),
  createAsset("asset-007", "Expense Accruals", "AP", "REVIEW", "2025-11", "Shopee PH", "SUCCESS"),
  createAsset(
    "asset-008",
    "Subsidiary Consolidation",
    "GRP",
    "PREPARATION",
    "2025-11",
    "Sea Group",
    "VALIDATING"
  ),
  createAsset(
    "asset-009",
    "Inventory Valuation Adjustment",
    "GL",
    "SUBMISSION",
    "2025-11",
    "Shopee VN",
    "SUCCESS"
  ),
  createAsset(
    "asset-010",
    "Bad Debt Write-off",
    "AR",
    "PREPARATION",
    "2025-11",
    "Shopee TW",
    "PENDING"
  ),
  createAsset(
    "asset-011",
    "Prepaid Expense Amortization",
    "GL",
    "EBS_UPLOAD",
    "2025-10",
    "Shopee SG",
    "SUCCESS",
    "SUCCESS"
  ),
  createAsset(
    "asset-012",
    "Credit Memo Processing",
    "AR",
    "EBS_UPLOAD",
    "2025-10",
    "Shopee MY",
    "SUCCESS",
    "SUCCESS"
  ),
  createAsset(
    "asset-013",
    "Accrued Liabilities",
    "AP",
    "EBS_UPLOAD",
    "2025-10",
    "Shopee ID",
    "SUCCESS",
    "SUCCESS"
  ),
  createAsset(
    "asset-014",
    "Dividend Distribution",
    "GRP",
    "REVIEW",
    "2025-10",
    "Sea Group",
    "SUCCESS"
  ),
  createAsset(
    "asset-015",
    "Foreign Currency Revaluation",
    "GL",
    "SUBMISSION",
    "2025-10",
    "Shopee BR",
    "SUCCESS"
  ),
]

export const mockAssetDetails: Record<string, AssetDetail> = Object.fromEntries(
  mockAssets.map((asset) => [
    asset.id,
    {
      ...asset,
      totalDebitAmount: (Math.random() * 1_000_000).toFixed(2),
      totalCreditAmount: (Math.random() * 1_000_000).toFixed(2),
      attachmentCount: Math.floor(Math.random() * 10),
      journalEntryCount: Math.floor(Math.random() * 50) + 5,
      rejectionReason: undefined,
    },
  ])
)

export function updateMockAsset(
  assetId: string,
  updates: Partial<AssetDetail>
): AssetDetail | null {
  const asset = mockAssetDetails[assetId]
  if (!asset) {
    return null
  }

  const updatedAsset = {
    ...asset,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  mockAssetDetails[assetId] = updatedAsset

  const listIndex = mockAssets.findIndex((a) => a.id === assetId)
  if (listIndex !== -1) {
    mockAssets[listIndex] = {
      ...mockAssets[listIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  }

  return updatedAsset
}
