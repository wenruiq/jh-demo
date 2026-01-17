import { create } from "zustand"

export const ASSERTIONS = [
  "Accuracy",
  "Completeness",
  "Cutoff",
  "Existence",
  "Valuation",
  "Business Logic",
  "Timeliness",
] as const

export type Assertion = (typeof ASSERTIONS)[number]

export const CHECK_TYPES = ["AI Check", "System Check"] as const
export type CheckType = (typeof CHECK_TYPES)[number]

export type ResultStatus = "Pass" | "Failed"

export type CardStatus = "passed" | "warning" | "failed"

export interface QualityCheck {
  id: string
  assertion: Assertion
  title: string
  type: CheckType
  description: string
  prompt?: string // for AI checks
  systemResult: ResultStatus
  systemResultExplanation?: string // for System checks
  aiResult?: string // for AI checks
  userResult?: ResultStatus
  attestation?: string // required for mark success on system checks
  acknowledged: boolean
}

interface LoadingState {
  addCheck: boolean
  acknowledge: string | null // checkId being acknowledged
  unacknowledge: string | null // checkId being unacknowledged
  acknowledgeAll: boolean
  markSuccess: string | null // checkId being marked
  revertUserResult: string | null // checkId being reverted
  testAi: string | null // checkId running AI test
  savePrompt: string | null // checkId saving prompt
  updateAttestation: string | null // checkId updating attestation
}

interface DataQualityStore {
  checksByAssetId: Record<string, QualityCheck[]>
  loading: LoadingState
  streamingCheckId: string | null
  streamingContent: string
  getChecksForAsset: (assetId: string) => QualityCheck[]
  initializeAsset: (assetId: string) => void
  addCheck: (
    assetId: string,
    check: Omit<QualityCheck, "id" | "systemResult" | "acknowledged">
  ) => Promise<void>
  acknowledgeCheck: (assetId: string, checkId: string) => Promise<void>
  unacknowledgeCheck: (assetId: string, checkId: string) => Promise<void>
  acknowledgeAll: (assetId: string) => Promise<void>
  markSuccess: (assetId: string, checkId: string, attestation: string) => Promise<void>
  revertUserResult: (assetId: string, checkId: string) => Promise<void>
  updateAttestation: (assetId: string, checkId: string, attestation: string) => void
  updatePrompt: (assetId: string, checkId: string, prompt: string) => void
  savePrompt: (assetId: string, checkId: string) => Promise<void>
  testAiCheck: (assetId: string, checkId: string) => Promise<void>
}

function generateId(): string {
  return `qc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Simulate API delay for demo realism
const simulateApiDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

// AI response templates for different assertions
const AI_RESPONSE_TEMPLATES: Record<string, string[]> = {
  Accuracy: [
    "Total Accrual Amount of @JournalEntry ties out at 149,808 with minor discrepancy of 0.0001",
    "Verified @JournalEntry amounts against @HRIS Claims data. All figures reconcile within threshold.",
    "Cross-referenced @JournalEntry with @GL Account Reconciliation. Amounts match exactly.",
  ],
  Completeness: [
    "All required entries in @JournalEntry are present. Period cutoff verified against @HRIS Claims.",
    "Completeness check passed. @JournalEntry contains all expected transaction types for this period.",
  ],
  Cutoff: [
    "Period cutoff validated. All transactions in @JournalEntry fall within the reporting period.",
    "No transactions dated outside the period found in @JournalEntry. Cutoff is correct.",
  ],
  Existence: [
    "All accounts referenced in @JournalEntry exist in the Chart of Accounts.",
    "Verified existence of all entities. @JournalEntry references valid accounts and cost centers.",
  ],
  Valuation: [
    "Valuation amounts in @JournalEntry align with policy thresholds documented in @GL Account Reconciliation.",
    "Asset valuations verified against market data. @JournalEntry reflects current fair values.",
  ],
  "Business Logic": [
    "Account mapping in @JournalEntry follows standard classification rules per COA policy.",
    "Business rules validated. All debit/credit pairs in @JournalEntry comply with policy.",
  ],
  Timeliness: [
    "All entries in @JournalEntry were posted within the allowed window. No aged items detected.",
    "Timeliness verified. @JournalEntry entries meet SLA requirements.",
  ],
}

function getRandomAiResponse(assertion: string): string {
  const templates = AI_RESPONSE_TEMPLATES[assertion] ?? AI_RESPONSE_TEMPLATES.Accuracy
  return templates[Math.floor(Math.random() * templates.length)]
}

function getDefaultChecks(): QualityCheck[] {
  return [
    {
      id: "default-qc-1",
      assertion: "Completeness",
      title: "Period Cutoff Validation",
      type: "System Check",
      description:
        "This quality check validates that all transactions recorded in the journal fall within the designated reporting period boundaries. It ensures no entries are missing from the expected transaction set by comparing against source system records.\n\nThe check also verifies proper cutoff procedures were followed at period end, confirming that transactions were recorded in the correct accounting period based on their economic substance rather than processing date.",
      systemResult: "Pass",
      systemResultExplanation:
        "All 47 expected journal entries are present. Period boundaries verified from 2024-01-01 to 2024-01-31. No gaps detected in transaction sequence.",
      acknowledged: false,
    },
    {
      id: "default-qc-2",
      assertion: "Accuracy",
      title: "Tie-Out & Reconciliation",
      type: "AI Check",
      description:
        "Cross-reference the Accrual amount in Journal Entry against the calculated amount in the Data Warehouse table to ensure financial accuracy. This check validates that all transactions are categorized consistently across systems.\n\nThe AI analyzes both data sources, identifies any discrepancies, and provides detailed explanations for any variances found. Any discrepancies must be investigated and corrected promptly to uphold the reliability of financial statements.",
      prompt:
        "Reconcile Total Accrual Amount in @JournalEntry vs Total Accrual Amount in @HRIS Claims",
      systemResult: "Pass",
      aiResult:
        "Total Accrual Amount of @JournalEntry ties out at 149,808 with minor discrepancy of 0.0001. All line items reconciled successfully against @HRIS Claims data.",
      acknowledged: false,
    },
    {
      id: "default-qc-3",
      assertion: "Business Logic",
      title: "Account Classification Check",
      type: "System Check",
      description:
        "This check cross-references each Account Code in the journal against the official Chart of Accounts (COA) to confirm proper classification. It validates that expenses, revenues, assets, and liabilities are posted to the correct ledgers.\n\nProper account classification prevents misstatements that could distort financial reporting and lead to flawed business analysis. The system flags any transactions where the account mapping deviates from established accounting policies.",
      systemResult: "Failed",
      systemResultExplanation:
        "Reclassification error detected: HRIS Claims record ID 15686547 was posted to account 630001 (Travel) but should be 610106 (Telephone) per Accounting Policy section 4.2.1.",
      acknowledged: false,
    },
    {
      id: "default-qc-4",
      assertion: "Valuation",
      title: "Currency Translation Review",
      type: "AI Check",
      description:
        "This AI-powered check reviews all foreign currency transactions to validate that appropriate exchange rates were applied. It compares the rates used against published market rates for the transaction dates.\n\nThe check also identifies any unusual currency gains or losses that may indicate data entry errors or require additional disclosure. Material variances are flagged for manual review by the accounting team.",
      prompt:
        "Review currency translation rates applied to foreign transactions in @JournalEntry and compare against market rates from @GL Account Reconciliation",
      systemResult: "Failed",
      aiResult:
        "Currency translation variance detected in @JournalEntry line items 23-27. EUR/USD rate of 1.0823 used differs from market rate of 1.0891 on transaction date, resulting in $2,340 understatement.",
      acknowledged: false,
    },
  ]
}

// Helper to derive card status from system and user results
export function getCardStatus(check: QualityCheck): CardStatus {
  if (check.systemResult === "Pass") {
    return "passed"
  }
  if (check.userResult === "Pass") {
    return "warning" // Marked success by user
  }
  return "failed"
}

// Helper to check if a check is "passed" (either system pass or user marked)
export function isCheckPassed(check: QualityCheck): boolean {
  return check.systemResult === "Pass" || check.userResult === "Pass"
}

export const useDataQualityStore = create<DataQualityStore>((set, get) => ({
  checksByAssetId: {},
  loading: {
    addCheck: false,
    acknowledge: null,
    unacknowledge: null,
    acknowledgeAll: false,
    markSuccess: null,
    revertUserResult: null,
    testAi: null,
    savePrompt: null,
    updateAttestation: null,
  },
  streamingCheckId: null,
  streamingContent: "",

  initializeAsset: (assetId: string) => {
    const checks = get().checksByAssetId[assetId]
    if (!checks) {
      set((state) => ({
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: getDefaultChecks(),
        },
      }))
    }
  },

  getChecksForAsset: (assetId: string) => {
    const checks = get().checksByAssetId[assetId]
    if (!checks) {
      const defaultChecks = getDefaultChecks()
      set((state) => ({
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: defaultChecks,
        },
      }))
      return defaultChecks
    }
    return checks
  },

  addCheck: async (assetId, checkData) => {
    set((state) => ({ loading: { ...state.loading, addCheck: true } }))

    await simulateApiDelay(600)

    // New checks start with system running them
    const newCheck: QualityCheck = {
      ...checkData,
      id: generateId(),
      systemResult: "Pass", // Default to pass for demo
      systemResultExplanation:
        checkData.type === "System Check"
          ? "System validation completed successfully. All criteria met."
          : undefined,
      aiResult:
        checkData.type === "AI Check"
          ? "AI analysis completed. No issues detected in the reviewed data."
          : undefined,
      acknowledged: false,
    }

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? getDefaultChecks()
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: [...existingChecks, newCheck],
        },
        loading: { ...state.loading, addCheck: false },
      }
    })
  },

  acknowledgeCheck: async (assetId, checkId) => {
    set((state) => ({ loading: { ...state.loading, acknowledge: checkId } }))

    await simulateApiDelay(400)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId ? { ...c, acknowledged: true } : c
          ),
        },
        loading: { ...state.loading, acknowledge: null },
      }
    })
  },

  unacknowledgeCheck: async (assetId, checkId) => {
    set((state) => ({ loading: { ...state.loading, unacknowledge: checkId } }))

    await simulateApiDelay(400)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId ? { ...c, acknowledged: false } : c
          ),
        },
        loading: { ...state.loading, unacknowledge: null },
      }
    })
  },

  acknowledgeAll: async (assetId) => {
    set((state) => ({ loading: { ...state.loading, acknowledgeAll: true } }))

    await simulateApiDelay(800)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.systemResult === "Pass" || c.userResult === "Pass" ? { ...c, acknowledged: true } : c
          ),
        },
        loading: { ...state.loading, acknowledgeAll: false },
      }
    })
  },

  markSuccess: async (assetId, checkId, attestation) => {
    set((state) => ({ loading: { ...state.loading, markSuccess: checkId } }))

    await simulateApiDelay(600)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId
              ? { ...c, userResult: "Pass" as ResultStatus, attestation, acknowledged: true }
              : c
          ),
        },
        loading: { ...state.loading, markSuccess: null },
      }
    })
  },

  revertUserResult: async (assetId, checkId) => {
    set((state) => ({ loading: { ...state.loading, revertUserResult: checkId } }))

    await simulateApiDelay(400)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId
              ? { ...c, userResult: undefined, attestation: undefined, acknowledged: false }
              : c
          ),
        },
        loading: { ...state.loading, revertUserResult: null },
      }
    })
  },

  updateAttestation: (assetId, checkId, attestation) => {
    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) => (c.id === checkId ? { ...c, attestation } : c)),
        },
      }
    })
  },

  updatePrompt: (assetId, checkId, prompt) => {
    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) => (c.id === checkId ? { ...c, prompt } : c)),
        },
      }
    })
  },

  savePrompt: async (_assetId, checkId) => {
    set((state) => ({ loading: { ...state.loading, savePrompt: checkId } }))

    await simulateApiDelay(500)

    set((state) => ({ loading: { ...state.loading, savePrompt: null } }))
  },

  testAiCheck: async (assetId, checkId) => {
    const check = get().checksByAssetId[assetId]?.find((c) => c.id === checkId)
    if (!check) {
      return
    }

    set((state) => ({
      loading: { ...state.loading, testAi: checkId },
      streamingCheckId: checkId,
      streamingContent: "",
    }))

    // Get a random AI response based on the assertion
    const fullResponse = getRandomAiResponse(check.assertion)
    const words = fullResponse.split(" ")

    // Simulate streaming word by word
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))
      set({
        streamingContent: words.slice(0, i + 1).join(" "),
      })
    }

    // Final update with complete result
    await simulateApiDelay(200)

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId ? { ...c, aiResult: fullResponse } : c
          ),
        },
        loading: { ...state.loading, testAi: null },
        streamingCheckId: null,
        streamingContent: "",
      }
    })
  },
}))
