import { Check, ChevronDown, Edit2, Lightbulb, Loader2, Send, Sparkles, Wand2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { MarkdownDisplay } from "@/components/journal/shared/markdown-display"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAiFindingsStore } from "@/store/ai-findings-store"

// Finance/Accounting abbreviation expansions
const FINANCE_ABBREVIATIONS: [RegExp, string][] = [
  [/\bGL\b/g, "General Ledger"],
  [/\bAP\b/g, "Accounts Payable"],
  [/\bAR\b/g, "Accounts Receivable"],
  [/\bJE\b/g, "journal entry"],
  [/\bJEs\b/g, "journal entries"],
  [/\bYTD\b/g, "year-to-date"],
  [/\bMTD\b/g, "month-to-date"],
  [/\bQTD\b/g, "quarter-to-date"],
  [/\bPY\b/g, "prior year"],
  [/\bCY\b/g, "current year"],
  [/\bPM\b/g, "prior month"],
  [/\bCM\b/g, "current month"],
  [/\bFY\b/g, "fiscal year"],
  [/\bP&L\b/g, "Profit and Loss"],
  [/\bPnL\b/g, "Profit and Loss"],
  [/\bBS\b/g, "Balance Sheet"],
  [/\bTB\b/g, "Trial Balance"],
  [/\bSOX\b/g, "Sarbanes-Oxley"],
  [/\bGAAP\b/g, "Generally Accepted Accounting Principles"],
  [/\bIFRS\b/g, "International Financial Reporting Standards"],
  [/\bWIP\b/g, "work in progress"],
  [/\bFX\b/g, "foreign exchange"],
  [/\binterco\b/gi, "intercompany"],
  [/\brecon\b/gi, "reconciliation"],
  [/\brecons\b/gi, "reconciliations"],
  [/\bacct\b/gi, "account"],
  [/\baccts\b/gi, "accounts"],
  [/\badj\b/gi, "adjustment"],
  [/\badjs\b/gi, "adjustments"],
  [/\bvar\b/gi, "variance"],
  [/\bvars\b/gi, "variances"],
  [/\bdocs\b/gi, "documentation"],
  [/\bbal\b/gi, "balance"],
  [/\bbals\b/gi, "balances"],
  [/\bpmt\b/gi, "payment"],
  [/\bpmts\b/gi, "payments"],
  [/\btxn\b/gi, "transaction"],
  [/\btxns\b/gi, "transactions"],
]

// Informal word replacements
const WORD_REPLACEMENTS: [RegExp, string][] = [
  [/\bpls\b/gi, "please"],
  [/\bplz\b/gi, "please"],
  [/\bthx\b/gi, "thank you"],
  [/\basap\b/gi, "as soon as possible"],
  [/\bfyi\b/gi, "for your information"],
  [/\bw\/\b/gi, "with"],
  [/\bw\/o\b/gi, "without"],
  [/\bi'm\b/gi, "I am"],
  [/\bdon't\b/gi, "do not"],
  [/\bcan't\b/gi, "cannot"],
  [/\bwon't\b/gi, "will not"],
  [/\bdidn't\b/gi, "did not"],
  [/\bdoesn't\b/gi, "does not"],
  [/\bisn't\b/gi, "is not"],
  [/\bhaven't\b/gi, "have not"],
  [/\bwouldn't\b/gi, "would not"],
  [/\bcouldn't\b/gi, "could not"],
  [/\bshouldn't\b/gi, "should not"],
  [/\bit's\b/gi, "it is"],
  [/\bthat's\b/gi, "that is"],
  [/\bthere's\b/gi, "there is"],
  [/\bi've\b/gi, "I have"],
  [/\bwe've\b/gi, "we have"],
  [/\bi'll\b/gi, "I will"],
  [/\bwe'll\b/gi, "we will"],
  [/\byou're\b/gi, "you are"],
  [/\bwe're\b/gi, "we are"],
  [/\bwanna\b/gi, "want to"],
  [/\bgonna\b/gi, "going to"],
  [/\bgotta\b/gi, "need to"],
  [/\bcuz\b/gi, "because"],
  [/\btho\b/gi, "though"],
]

// Regex patterns for text polishing (top-level for performance)
const SENTENCE_START_REGEX = /(^|[.!?]\s+)([a-z])/g
const ENDS_WITH_PUNCTUATION_REGEX = /[.!?]$/
const SPACE_BEFORE_PUNCTUATION_REGEX = /\s+([.!?,;:])/g
const MULTIPLE_SPACES_REGEX = /\s{2,}/g
const WHITESPACE_REGEX = /\s+/g
const STANDALONE_I_REGEX = /\bi\b/g

// Finance-context phrase improvements
const PHRASE_IMPROVEMENTS: [RegExp, string][] = [
  // Finance-specific phrases
  [/\bcheck if.* balance[s]? match\b/gi, "verify account reconciliation status"],
  [/\bmake sure.* tie[s]? out\b/gi, "confirm balances reconcile"],
  [/\bwhy.* (number|amount)[s]? (are |is )?off\b/gi, "identify the root cause of the variance"],
  [/\bdig into\b/gi, "investigate"],
  [/\blook at\b/gi, "analyze"],
  [/\blook into\b/gi, "investigate"],
  [/\bcheck out\b/gi, "review"],
  [/\bcheck on\b/gi, "verify"],
  [/\bcheck for\b/gi, "identify any"],
  [/\bfigure out\b/gi, "determine"],
  [/\bfind out\b/gi, "identify"],
  [/\bmake sure\b/gi, "ensure"],
  [/\bsign off\b/gi, "approve"],
  [/\bclose out\b/gi, "finalize"],
  [/\bbook(?:ed)?\b/gi, "record"],
  [/\bbooked to\b/gi, "recorded in"],
  // General professional phrases
  [/\ba lot of\b/gi, "significant"],
  [/\ba bunch of\b/gi, "multiple"],
  [/\bkind of\b/gi, "somewhat"],
  [/\bpretty\b/gi, "relatively"],
  [/\bi think\b/gi, "it appears"],
  [/\bi guess\b/gi, "it appears"],
  [/\bmaybe\b/gi, "potentially"],
  [/\bstuff\b/gi, "items"],
  [/\bthings\b/gi, "items"],
  [/\bbig\b/gi, "material"],
  [/\bsmall\b/gi, "immaterial"],
  [/\bweird\b/gi, "unusual"],
  [/\bodd\b/gi, "anomalous"],
  [/\boff\b/gi, "discrepant"],
  [/\bwrong\b/gi, "incorrect"],
  [/\bmissing\b/gi, "absent"],
  [/\bget\b/gi, "obtain"],
  [/\bgive\b/gi, "provide"],
  [/\bneed\b/gi, "require"],
  [/\bfix\b/gi, "correct"],
  [/\bflag\b/gi, "highlight"],
]

// Polish text with rule-based transformations for finance/accounting context
function polishText(input: string): string {
  let result = input.trim()

  // Apply finance abbreviation expansions first
  for (const [pattern, replacement] of FINANCE_ABBREVIATIONS) {
    result = result.replace(pattern, replacement)
  }

  // Apply informal word replacements
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }

  // Apply phrase improvements
  for (const [pattern, replacement] of PHRASE_IMPROVEMENTS) {
    result = result.replace(pattern, replacement)
  }

  // Normalize whitespace
  result = result.replace(WHITESPACE_REGEX, " ")

  // Capitalize first letter of each sentence
  result = result.replace(
    SENTENCE_START_REGEX,
    (_, prefix, letter) => prefix + letter.toUpperCase()
  )

  // Ensure first character is capitalized
  result = result.charAt(0).toUpperCase() + result.slice(1)

  // Add period at end if missing punctuation
  if (result && !ENDS_WITH_PUNCTUATION_REGEX.test(result)) {
    result += "."
  }

  // Fix common patterns: double spaces, space before punctuation
  result = result.replace(SPACE_BEFORE_PUNCTUATION_REGEX, "$1")
  result = result.replace(MULTIPLE_SPACES_REGEX, " ")

  // Capitalize "I" when standalone
  result = result.replace(STANDALONE_I_REGEX, "I")

  return result
}

// Hook to manage AI panel state - either local (isolated) or from store (shared)
function useAiPanelState(useLocalState: boolean) {
  // Local state for isolated panels (Reviewer Agent)
  const [localPrompt, setLocalPrompt] = useState("")
  const [localResponse, setLocalResponse] = useState("")
  const [localIsStreaming, setLocalIsStreaming] = useState(false)

  // Store state (persisted across view changes) - for Preparer panel
  const store = useAiFindingsStore()

  // No-op function for local state mode (doesn't affect progress/findings)
  const noop = useCallback(() => undefined, [])
  const resetLocal = useCallback(() => setLocalResponse(""), [])

  if (useLocalState) {
    return {
      prompt: localPrompt,
      setPrompt: setLocalPrompt,
      streamedContent: localResponse,
      setStreamedContent: setLocalResponse,
      isStreaming: localIsStreaming,
      setIsStreaming: setLocalIsStreaming,
      setHasGeneratedResponse: noop,
      setAdoptedFindings: noop,
      resetForNewGeneration: resetLocal,
    }
  }

  return {
    prompt: store.currentPrompt,
    setPrompt: store.setCurrentPrompt,
    streamedContent: store.currentResponse,
    setStreamedContent: store.setCurrentResponse,
    isStreaming: store.isStreaming,
    setIsStreaming: store.setIsStreaming,
    setHasGeneratedResponse: store.setHasGeneratedResponse,
    setAdoptedFindings: store.setAdoptedFindings,
    resetForNewGeneration: store.resetForNewGeneration,
  }
}

const PROMPT_SUGGESTIONS = [
  {
    category: "Analysis",
    prompts: [
      "Analyze this journal entry for potential risks and anomalies",
      "Identify any account reconciliation discrepancies",
      "Check for unusual transaction patterns or outliers",
    ],
  },
  {
    category: "Summary",
    prompts: [
      "Summarize the key findings from the uploaded documents",
      "Generate an executive summary of this journal entry",
      "List the top 3 items requiring reviewer attention",
    ],
  },
  {
    category: "Compliance",
    prompts: [
      "Verify compliance with internal controls requirements",
      "Check if all required supporting documents are attached",
      "Identify any segregation of duties concerns",
    ],
  },
]

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

const MOCK_REVIEWER_RESPONSE_TEMPLATE = `## Reviewer Assessment

After thorough review of the submitted journal entry and supporting documentation, I have completed my analysis:

### Review Summary

| Review Area | Status | Notes |
|------------|-------|-------|
| **Accuracy** | ✅ Approved | All amounts tie out to source documents |
| **Completeness** | ✅ Approved | Required documentation is present |
| **Compliance** | ⚠️ Conditional | Minor documentation gaps noted below |
| **Internal Controls** | ✅ Approved | Maker-checker segregation maintained |

### Detailed Findings

**Strengths:**
- Variance explanation for Account 4500-01 is well-documented and reasonable
- Timing difference explanation aligns with cutoff procedures
- All intercompany transactions are properly matched

**Areas Requiring Attention:**
1. **Reclassification Entry (Line 23)** - Supporting memo has been provided and reviewed. The reclassification is appropriate and properly authorized.
2. **Manual Override (Line 47)** - Controller approval is documented. The override is justified based on business circumstances.
3. **Duplicate Entry Concern** - After investigation, lines 45 and 47 are not duplicates. They represent separate transactions with different reference numbers.

### Control Testing

| Control Objective | Test Result | Evidence Reviewed |
|-------------------|-------------|-------------------|
| Authorization | ✅ Pass | Approval memos verified |
| Documentation | ✅ Pass | All required docs attached |
| Reconciliation | ✅ Pass | Account balances reconciled |
| Segregation of Duties | ✅ Pass | Different preparer/reviewer |

### Recommendation

**APPROVED** - This journal entry is ready for posting. The preparer has adequately addressed all quality check items and provided sufficient supporting documentation. The minor items identified during preparation have been resolved or appropriately documented.

**Reviewer Notes:** The variance analysis and supporting explanations demonstrate appropriate due diligence. No material concerns identified.`

interface AiPromptPanelProps {
  title?: string
  readonly?: boolean
  promptPlaceholder?: string
  showUseResultButton?: boolean
  /** When true, uses local state instead of the shared store (for independent panels like Reviewer Agent) */
  useLocalState?: boolean
  /** Agent type determines which response template to use */
  agentType?: "preparer" | "reviewer"
}

export function AiPromptPanel({
  title = "Summary & Findings",
  readonly = false,
  promptPlaceholder = "Ask AI to analyze this journal entry...",
  showUseResultButton = false,
  useLocalState = false,
  agentType = "preparer",
}: AiPromptPanelProps) {
  // Local UI state (not persisted)
  const [isPolishing, setIsPolishing] = useState(false)
  const [polishedText, setPolishedText] = useState("")
  const [showPolishDialog, setShowPolishDialog] = useState(false)
  const [polishStreamedText, setPolishStreamedText] = useState("")
  const [isAdopting, setIsAdopting] = useState(false)
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [editedResponse, setEditedResponse] = useState("")
  const streamRef = useRef<number | null>(null)
  const polishStreamRef = useRef<number | null>(null)
  const responseContainerRef = useRef<HTMLDivElement>(null)

  // Get state from either local state or store based on prop
  const {
    prompt,
    setPrompt,
    streamedContent,
    setStreamedContent,
    isStreaming,
    setIsStreaming,
    setHasGeneratedResponse,
    setAdoptedFindings,
    resetForNewGeneration,
  } = useAiPanelState(useLocalState)

  // Simulate streaming text character by character
  const simulateStream = useCallback(
    (fullText: string, setContent: (text: string) => void, onComplete?: () => void, speed = 2) => {
      let index = 0
      const streamInterval = setInterval(() => {
        if (index < fullText.length) {
          // Stream in chunks of 3-8 characters for faster, natural feel
          const chunkSize = Math.min(Math.floor(Math.random() * 6) + 3, fullText.length - index)
          index += chunkSize
          setContent(fullText.slice(0, index))
        } else {
          clearInterval(streamInterval)
          onComplete?.()
        }
      }, speed)
      return streamInterval
    },
    []
  )

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        clearInterval(streamRef.current)
      }
      if (polishStreamRef.current) {
        clearInterval(polishStreamRef.current)
      }
    }
  }, [])

  // Auto-scroll to bottom as content streams in
  useEffect(() => {
    const container = responseContainerRef.current
    if (isStreaming && container && streamedContent) {
      container.scrollTop = container.scrollHeight
    }
  }, [isStreaming, streamedContent])

  const handleGenerateResponse = useCallback(() => {
    if (!prompt.trim() || isStreaming) {
      return
    }

    // Reset state for new generation
    setIsStreaming(true)
    resetForNewGeneration()

    // Select appropriate template based on agent type
    const responseTemplate =
      agentType === "reviewer" ? MOCK_REVIEWER_RESPONSE_TEMPLATE : MOCK_PREPARER_RESPONSE_TEMPLATE

    // Start streaming immediately with faster speed
    const intervalId = simulateStream(
      responseTemplate,
      setStreamedContent,
      () => {
        setIsStreaming(false)
        setHasGeneratedResponse(true)
      },
      2
    )
    streamRef.current = intervalId as unknown as number
  }, [
    prompt,
    isStreaming,
    setIsStreaming,
    setHasGeneratedResponse,
    setStreamedContent,
    resetForNewGeneration,
    simulateStream,
    agentType,
  ])

  const handlePolishWriting = useCallback(() => {
    if (!prompt.trim() || isPolishing) {
      return
    }

    setIsPolishing(true)
    setShowPolishDialog(true)
    setPolishStreamedText("")

    // Enhanced mock polish with visible transformations
    const polishedVersion = polishText(prompt)
    setPolishedText(polishedVersion)

    // Simulate AI thinking then streaming the result
    setTimeout(() => {
      const intervalId = simulateStream(
        polishedVersion,
        setPolishStreamedText,
        () => setIsPolishing(false),
        20
      )
      polishStreamRef.current = intervalId as unknown as number
    }, 800)
  }, [prompt, isPolishing, simulateStream])

  const handleAcceptPolish = useCallback(() => {
    setPrompt(polishedText)
    setShowPolishDialog(false)
    setPolishedText("")
    setPolishStreamedText("")
  }, [polishedText, setPrompt])

  const handleRejectPolish = useCallback(() => {
    setShowPolishDialog(false)
    setPolishedText("")
    setPolishStreamedText("")
    if (polishStreamRef.current) {
      clearInterval(polishStreamRef.current)
      setIsPolishing(false)
    }
  }, [])

  const handleSelectPrompt = useCallback(
    (selectedPrompt: string) => {
      setPrompt(selectedPrompt)
    },
    [setPrompt]
  )

  const handleStartEditResponse = useCallback(() => {
    setEditedResponse(streamedContent)
    setIsEditingResponse(true)
  }, [streamedContent])

  const handleCancelEditResponse = useCallback(() => {
    setIsEditingResponse(false)
    setEditedResponse("")
  }, [])

  const handleSaveEditResponse = useCallback(() => {
    if (editedResponse.trim()) {
      setStreamedContent(editedResponse)
    }
    setIsEditingResponse(false)
    setEditedResponse("")
  }, [editedResponse, setStreamedContent])

  const handleUseResult = useCallback(() => {
    if (!streamedContent || isStreaming || isAdopting) {
      return
    }

    setIsAdopting(true)

    // Simulate a brief loading state
    setTimeout(() => {
      setAdoptedFindings({
        content: streamedContent,
        generatedAt: new Date(),
      })
      setIsAdopting(false)
      setIsEditingResponse(false)
      toast.success("Findings adopted", {
        description: "Summary added to cover sheet",
      })
    }, 600)
  }, [streamedContent, isStreaming, isAdopting, setAdoptedFindings])

  const hasContent = streamedContent.length > 0
  const canUseResult = hasContent && !isStreaming && !isAdopting && !isEditingResponse
  const canEditResponse = hasContent && !isStreaming && !isAdopting && !isEditingResponse

  return (
    <SectionContainer title={title}>
      <div className="flex gap-4" style={{ height: "320px" }}>
        {/* Left Panel - Prompt Input */}
        <div className="flex w-[300px] shrink-0 flex-col gap-2">
          <div className="flex h-7 items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Polish Writing Button */}
              <Button
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={readonly || !prompt.trim() || isPolishing || isStreaming}
                onClick={handlePolishWriting}
                size="sm"
                title="Polish my writing"
                variant="ghost"
              >
                <Wand2 className="h-3 w-3" />
                Polish
              </Button>

              {/* Prompt Suggestions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={readonly}
                    size="sm"
                    variant="ghost"
                  >
                    <Lightbulb className="h-3 w-3" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px]">
                  {PROMPT_SUGGESTIONS.map((category, idx) => (
                    <div key={category.category}>
                      {idx > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel className="text-muted-foreground text-xs">
                        {category.category}
                      </DropdownMenuLabel>
                      {category.prompts.map((suggestionPrompt) => (
                        <DropdownMenuItem
                          className="cursor-pointer text-xs"
                          key={suggestionPrompt}
                          onClick={() => handleSelectPrompt(suggestionPrompt)}
                        >
                          <span className="line-clamp-2">{suggestionPrompt}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <textarea
            className={cn(
              "flex-1 resize-none rounded-md border bg-muted/30 p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              readonly && "cursor-not-allowed opacity-60"
            )}
            disabled={readonly}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={promptPlaceholder}
            value={prompt}
          />

          <Button
            className="gap-2"
            disabled={readonly || !prompt.trim() || isStreaming}
            onClick={handleGenerateResponse}
            size="sm"
            variant="outline"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - AI Response */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex h-7 items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Response</span>
            </div>
            {canEditResponse && showUseResultButton && (
              <Button
                className="h-6 gap-1 px-2 text-xs"
                onClick={handleStartEditResponse}
                size="sm"
                variant="ghost"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            )}
            {isEditingResponse && (
              <div className="flex items-center gap-1">
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={handleCancelEditResponse}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className="h-6 gap-1 px-2 text-xs"
                  onClick={handleSaveEditResponse}
                  size="sm"
                >
                  <Check className="h-3 w-3" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex-1 overflow-y-auto rounded-md border bg-muted/20 p-4",
              isStreaming && "relative"
            )}
            ref={responseContainerRef}
          >
            {isEditingResponse && (
              <textarea
                className="h-full w-full resize-none bg-transparent font-mono text-sm focus:outline-none"
                onChange={(e) => setEditedResponse(e.target.value)}
                value={editedResponse}
              />
            )}
            {!isEditingResponse && hasContent && (
              <div className="relative">
                <MarkdownDisplay content={streamedContent} />
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
                )}
              </div>
            )}
            {!(isEditingResponse || hasContent) && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                <span>AI response will appear here</span>
              </div>
            )}
          </div>

          {/* Use Result Button - Only for Preparer view */}
          {showUseResultButton && (
            <Button
              className="gap-2 self-end"
              disabled={!canUseResult}
              onClick={handleUseResult}
              size="sm"
            >
              {isAdopting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Adopting...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Use this result
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Polish Writing Dialog */}
      <Dialog onOpenChange={setShowPolishDialog} open={showPolishDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Polish Your Writing
            </DialogTitle>
            <DialogDescription>
              AI has refined your prompt. Would you like to use this version?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <div className="mb-1.5 font-medium text-muted-foreground text-xs">Original</div>
              <div className="rounded-md border bg-muted/30 p-3 text-sm">{prompt}</div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 font-medium text-muted-foreground text-xs">
                Polished
                {isPolishing && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <div className="min-h-[60px] rounded-md border bg-primary/5 p-3 text-sm">
                {polishStreamedText || <span className="text-muted-foreground">Processing...</span>}
                {isPolishing && (
                  <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary" />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleRejectPolish} size="sm" variant="ghost">
              Keep Original
            </Button>
            <Button disabled={isPolishing} onClick={handleAcceptPolish} size="sm">
              Use Polished
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionContainer>
  )
}
