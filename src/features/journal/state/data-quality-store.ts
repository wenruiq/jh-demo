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

export const CHECK_TYPES = ["AI Check", "System Check", "Manual Check"] as const
export type CheckType = (typeof CHECK_TYPES)[number]

export type ResultStatus = "Pass" | "Failed"

export type CardStatus = "passed" | "warning" | "failed"

// Regex pattern for punctuation detection (top-level for performance)
const PUNCTUATION_END_PATTERN = /[.!?,;:]$/

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
  thinkingCheckId: string | null
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
    {
      id: "default-qc-5",
      assertion: "Existence",
      title: "Management Authorization Verification",
      type: "Manual Check",
      description:
        "This manual check requires verification that appropriate management authorization was obtained for material or unusual journal entries. Review the approval workflow to confirm that entries exceeding established thresholds have been properly approved by authorized personnel.\n\nThis control ensures that significant accounting adjustments receive adequate oversight and that proper segregation of duties is maintained throughout the journal entry approval process.",
      systemResult: "Failed",
      systemResultExplanation: "Awaiting manual verification by user.",
      acknowledged: false,
    },
  ]
}

// Pre-populated checks for asset-002 (Q4 Accounts Receivable Adjustment) - realistic mix of passes and user-attested overrides
function getAsset002Checks(): QualityCheck[] {
  return [
    {
      id: "asset002-qc-1",
      assertion: "Completeness",
      title: "AR Aging Completeness Check",
      type: "System Check",
      description:
        "Validates that all customer accounts are included in the AR aging report and no receivable balances are missing from the adjustment calculation.",
      systemResult: "Pass",
      systemResultExplanation:
        "All 1,247 customer accounts verified. Total AR balance of $3,456,789.12 reconciles to GL. No missing accounts detected.",
      acknowledged: true,
    },
    {
      id: "asset002-qc-2",
      assertion: "Accuracy",
      title: "Bad Debt Allowance Calculation",
      type: "AI Check",
      description:
        "AI-powered verification of the bad debt allowance calculation methodology and resulting adjustment amounts against historical collection rates.",
      prompt:
        "Verify the bad debt allowance calculation in @Bad Debt Allowance Calculation against historical payment data in @Customer Payment History",
      systemResult: "Failed",
      aiResult:
        "Variance detected: Bad debt allowance of $127,450 differs from AI-calculated estimate of $142,300 based on @Customer Payment History. The 10.4% difference exceeds the 5% threshold. Recommend review of aging bucket assumptions.",
      userResult: "Pass",
      attestation:
        "Reviewed with Finance Manager. The $14,850 variance is due to a one-time bulk payment received from Customer ABC Corp on Dec 28 that improved their aging category. This was a known timing difference and the $127,450 allowance is appropriate. Supporting email from FM attached.",
      acknowledged: true,
    },
    {
      id: "asset002-qc-3",
      assertion: "Valuation",
      title: "AR Valuation Assessment",
      type: "System Check",
      description:
        "Verifies that accounts receivable balances are stated at net realizable value after considering the allowance for doubtful accounts.",
      systemResult: "Failed",
      systemResultExplanation:
        "Warning: 3 customer accounts totaling $45,230 have balances exceeding credit limits. Account #4521 ($28,100), Account #7834 ($12,400), Account #9012 ($4,730). Review required per Credit Policy 3.2.",
      userResult: "Pass",
      attestation:
        "Investigated all 3 flagged accounts. Account #4521 has approved credit limit extension (see approval memo CL-2025-089). Accounts #7834 and #9012 are on payment plans with first installments received Jan 2. All balances deemed collectible.",
      acknowledged: true,
    },
    {
      id: "asset002-qc-4",
      assertion: "Existence",
      title: "Customer Account Verification",
      type: "Manual Check",
      description:
        "Manual verification that sampled customer accounts with significant balances represent valid, existing customer relationships with supporting documentation.",
      systemResult: "Failed",
      systemResultExplanation: "Awaiting manual verification by user.",
      userResult: "Pass",
      attestation:
        "Verified top 20 customer accounts representing 65% of total AR balance. All accounts confirmed as active customers with valid contracts on file. Sample testing completed per audit workpaper AR-3.",
      acknowledged: true,
    },
    {
      id: "asset002-qc-5",
      assertion: "Cutoff",
      title: "Period-End Cutoff Verification",
      type: "AI Check",
      description:
        "AI analysis to ensure all Q4 2025 invoices are properly recorded in the correct period and no subsequent period transactions are included.",
      prompt:
        "Analyze invoice dates in @Invoice Transaction Detail to verify proper period cutoff for Q4 2025",
      systemResult: "Pass",
      aiResult:
        "All 892 invoices in @Invoice Transaction Detail fall within Q4 2025 (Oct 1 - Dec 31, 2025). No invoices dated after Dec 31, 2025 detected. Revenue recognition timing verified against shipping/delivery dates.",
      acknowledged: true,
    },
  ]
}

// Initial checks pre-populated for specific assets
const INITIAL_CHECKS: Record<string, QualityCheck[]> = {
  "asset-002": getAsset002Checks(),
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

function getChecksForAssetId(assetId: string): QualityCheck[] {
  return INITIAL_CHECKS[assetId] ?? getDefaultChecks()
}

export const useDataQualityStore = create<DataQualityStore>((set, get) => ({
  checksByAssetId: { ...INITIAL_CHECKS },
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
  thinkingCheckId: null,
  streamingCheckId: null,
  streamingContent: "",

  initializeAsset: (assetId: string) => {
    const checks = get().checksByAssetId[assetId]
    if (!checks) {
      set((state) => ({
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: getChecksForAssetId(assetId),
        },
      }))
    }
  },

  getChecksForAsset: (assetId: string) => {
    const checks = get().checksByAssetId[assetId]
    if (!checks) {
      const assetChecks = getChecksForAssetId(assetId)
      set((state) => ({
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: assetChecks,
        },
      }))
      return assetChecks
    }
    return checks
  },

  addCheck: async (assetId, checkData) => {
    set((state) => ({ loading: { ...state.loading, addCheck: true } }))

    await simulateApiDelay(600)

    // Manual checks start with "Failed" system result (pending user action)
    // AI and System checks start with "Pass" for demo
    const isManualCheck = checkData.type === "Manual Check"

    // Determine system result explanation based on check type
    const getSystemResultExplanation = (): string | undefined => {
      if (checkData.type === "System Check") {
        return "System validation completed successfully. All criteria met."
      }
      if (isManualCheck) {
        return "Awaiting manual verification by user."
      }
      return undefined
    }

    const newCheck: QualityCheck = {
      ...checkData,
      id: generateId(),
      systemResult: isManualCheck ? "Failed" : "Pass",
      systemResultExplanation: getSystemResultExplanation(),
      aiResult:
        checkData.type === "AI Check"
          ? "AI analysis completed. No issues detected in the reviewed data."
          : undefined,
      acknowledged: false,
    }

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? getChecksForAssetId(assetId)
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
      thinkingCheckId: checkId,
      streamingCheckId: checkId,
      streamingContent: "",
    }))

    // Get a random AI response based on the assertion
    const fullResponse = getRandomAiResponse(check.assertion)
    const words = fullResponse.split(" ")

    // Initial "thinking" delay - simulates AI processing before responding
    await simulateApiDelay(1000 + Math.random() * 500)

    // Clear thinking state, start streaming
    set({ thinkingCheckId: null })

    // Simulate fast streaming word by word (like Gemini Flash)
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const progress = i / words.length

      // Fast base delay with slight acceleration
      const baseDelay = 25 - progress * 10 // 25ms down to 15ms

      // Add slight variability
      const randomFactor = 0.8 + Math.random() * 0.4

      // Small pause after punctuation
      const hasPunctuation = PUNCTUATION_END_PATTERN.test(word)
      const punctuationDelay = hasPunctuation ? 20 + Math.random() * 15 : 0

      const delay = baseDelay * randomFactor + punctuationDelay

      await new Promise((resolve) => setTimeout(resolve, delay))
      set({
        streamingContent: words.slice(0, i + 1).join(" "),
      })
    }

    // Brief pause before showing final result
    await simulateApiDelay(100)

    // Randomly determine pass/fail (70% pass, 30% fail for demo variety)
    const randomResult: ResultStatus = Math.random() > 0.3 ? "Pass" : "Failed"

    set((state) => {
      const existingChecks = state.checksByAssetId[assetId] ?? []
      return {
        checksByAssetId: {
          ...state.checksByAssetId,
          [assetId]: existingChecks.map((c) =>
            c.id === checkId
              ? {
                  ...c,
                  aiResult: fullResponse,
                  systemResult: randomResult,
                  // Reset user result if system result changed
                  userResult: undefined,
                  acknowledged: false,
                }
              : c
          ),
        },
        loading: { ...state.loading, testAi: null },
        streamingCheckId: null,
        streamingContent: "",
      }
    })
  },
}))
