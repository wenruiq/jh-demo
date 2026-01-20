import { create } from "zustand"

export type FindingsStatus = "not-started" | "generated" | "finalized"

export interface AiFindings {
  content: string
  generatedAt: Date
}

const MOCK_PREPARER_RESPONSE_TEMPLATE = `## Analysis Summary

Based on the uploaded documents and data quality checks, here are the key findings:

### Risk Assessment Table

| Category | Status | Risk Level | Action Required |
|----------|--------|------------|-----------------|
| Account Balances | Reconciled | ✅ Low | None |
| Supporting Docs | Complete | ✅ Low | None |
| Variance Analysis | Flag | ⚠️ Medium | Review needed |
| Duplicate Check | Passed | ✅ Low | None |

### Key Observations
- All supporting documents have been verified and attached
- Account balances reconcile within acceptable tolerance (±0.01%)
- No duplicate entries detected in the current period
- **Variance detected**: Account 4500-01 exceeded 5% threshold

### Recommended Actions
1. **Review variance in Account 4500-01** - Variance of 7.2% exceeds the standard 5% threshold
2. **Confirm manual adjustment** - Line 47 contains a manual override requiring approval
3. **Attach supporting memo** - Reclassification entry on line 23 needs documentation

### Compliance Status
| Control Point | Status |
|---------------|--------|
| Maker-Checker | ✅ Compliant |
| Documentation | ⚠️ Pending |
| Approval Chain | ✅ Compliant |

**Overall Risk Rating: Low to Medium** - This journal entry follows standard month-end close procedures with minor items requiring attention.`

// Pre-populated findings for asset-002 (Q4 Accounts Receivable Adjustment) which is in REVIEW status
const INITIAL_ADOPTED_FINDINGS: Record<string, AiFindings> = {
  "asset-002": {
    content: MOCK_PREPARER_RESPONSE_TEMPLATE,
    generatedAt: new Date("2025-01-19T14:30:00Z"),
  },
}

interface AiFindingsStore {
  adoptedFindingsByAsset: Record<string, AiFindings>
  hasGeneratedResponseByAsset: Record<string, boolean>
  currentPromptByAsset: Record<string, string>
  currentResponseByAsset: Record<string, string>
  isStreaming: boolean
  selectedAssetId: string | null
  setSelectedAssetId: (assetId: string | null) => void
  getAdoptedFindings: () => AiFindings | null
  setAdoptedFindings: (findings: AiFindings | null) => void
  getHasGeneratedResponse: () => boolean
  setHasGeneratedResponse: (hasGenerated: boolean) => void
  getCurrentPrompt: () => string
  setCurrentPrompt: (prompt: string) => void
  getCurrentResponse: () => string
  setCurrentResponse: (response: string) => void
  setIsStreaming: (streaming: boolean) => void
  clearAdoptedFindings: () => void
  resetForNewGeneration: () => void
  getStatus: () => FindingsStatus
}

export const useAiFindingsStore = create<AiFindingsStore>((set, get) => ({
  adoptedFindingsByAsset: { ...INITIAL_ADOPTED_FINDINGS },
  hasGeneratedResponseByAsset: {},
  currentPromptByAsset: {},
  currentResponseByAsset: {},
  isStreaming: false,
  selectedAssetId: null,

  setSelectedAssetId: (assetId) => set({ selectedAssetId: assetId }),

  getAdoptedFindings: () => {
    const state = get()
    const assetId = state.selectedAssetId
    if (!assetId) {
      return null
    }
    return state.adoptedFindingsByAsset[assetId] ?? null
  },

  setAdoptedFindings: (findings) =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      return {
        adoptedFindingsByAsset: {
          ...state.adoptedFindingsByAsset,
          [assetId]: findings as AiFindings,
        },
      }
    }),

  getHasGeneratedResponse: () => {
    const state = get()
    const assetId = state.selectedAssetId
    if (!assetId) {
      return false
    }
    return state.hasGeneratedResponseByAsset[assetId] ?? false
  },

  setHasGeneratedResponse: (hasGenerated) =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      return {
        hasGeneratedResponseByAsset: {
          ...state.hasGeneratedResponseByAsset,
          [assetId]: hasGenerated,
        },
      }
    }),

  getCurrentPrompt: () => {
    const state = get()
    const assetId = state.selectedAssetId
    if (!assetId) {
      return ""
    }
    return state.currentPromptByAsset[assetId] ?? ""
  },

  setCurrentPrompt: (prompt) =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      return {
        currentPromptByAsset: {
          ...state.currentPromptByAsset,
          [assetId]: prompt,
        },
      }
    }),

  getCurrentResponse: () => {
    const state = get()
    const assetId = state.selectedAssetId
    if (!assetId) {
      return ""
    }
    return state.currentResponseByAsset[assetId] ?? ""
  },

  setCurrentResponse: (response) =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      return {
        currentResponseByAsset: {
          ...state.currentResponseByAsset,
          [assetId]: response,
        },
      }
    }),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  clearAdoptedFindings: () =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      const { [assetId]: _, ...rest } = state.adoptedFindingsByAsset
      return { adoptedFindingsByAsset: rest }
    }),

  resetForNewGeneration: () =>
    set((state) => {
      const assetId = state.selectedAssetId
      if (!assetId) {
        return state
      }
      const { [assetId]: _adopted, ...restAdopted } = state.adoptedFindingsByAsset
      const { [assetId]: _response, ...restResponse } = state.currentResponseByAsset
      return {
        hasGeneratedResponseByAsset: {
          ...state.hasGeneratedResponseByAsset,
          [assetId]: false,
        },
        adoptedFindingsByAsset: restAdopted,
        currentResponseByAsset: {
          ...restResponse,
          [assetId]: "",
        },
      }
    }),

  getStatus: () => {
    const state = get()
    const assetId = state.selectedAssetId
    if (!assetId) {
      return "not-started"
    }
    if (state.adoptedFindingsByAsset[assetId]) {
      return "finalized"
    }
    if (state.hasGeneratedResponseByAsset[assetId]) {
      return "generated"
    }
    return "not-started"
  },
}))
