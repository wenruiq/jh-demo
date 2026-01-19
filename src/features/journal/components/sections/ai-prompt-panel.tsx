import { Check, ChevronDown, Edit2, Lightbulb, Loader2, Send, Sparkles, Wand2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
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
import { MarkdownDisplay } from "@/features/journal/components/shared/markdown-display"
import { SectionContainer } from "@/features/journal/components/shared/section-container"
import { useAiFindingsStore } from "@/features/journal/state/ai-findings-store"
import {
  type StreamController,
  simulateQuickStream,
  simulateRealisticStream,
} from "@/shared/lib/stream-simulation"
import { cn } from "@/shared/lib/utils"

function useAiPanelState(useLocalState: boolean) {
  const [localPrompt, setLocalPrompt] = useState("")
  const [localResponse, setLocalResponse] = useState("")
  const [localIsStreaming, setLocalIsStreaming] = useState(false)
  const store = useAiFindingsStore()
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
      {
        title: "Analyze this journal entry for potential risks and anomalies",
        content: `Analyze this journal entry for potential risks and anomalies:

- **Examine** transaction amounts for unusual patterns or statistical outliers
- **Identify** any account balances that exceed expected thresholds
- **Flag** entries with missing or incomplete supporting documentation
- **Highlight** transactions that deviate from standard business processes

Provide a comprehensive risk assessment with specific examples of any concerns identified.`,
      },
      {
        title: "Identify any account reconciliation discrepancies",
        content: `Identify any account reconciliation discrepancies:

- **Compare** journal entry amounts against source system records
- **Verify** that all debit and credit entries properly balance
- **Check** for rounding differences or calculation errors
- **Validate** that account codes match the Chart of Accounts structure

Document any variances found and recommend corrective actions if needed.`,
      },
      {
        title: "Check for unusual transaction patterns or outliers",
        content: `Check for unusual transaction patterns or outliers:

- **Analyze** transaction timing and frequency for anomalies
- **Identify** entries posted outside of normal business hours or periods
- **Flag** duplicate or potentially redundant transactions
- **Detect** unusual account code combinations or posting patterns

Summarize findings and assess whether anomalies require further investigation.`,
      },
    ],
  },
  {
    category: "Summary",
    prompts: [
      {
        title: "Summarize the key findings from the uploaded documents",
        content: `Summarize the key findings from the uploaded documents:

- **Review** all supporting documentation attached to this journal entry
- **Extract** material facts, amounts, and business justifications
- **Identify** the primary purpose and accounting treatment of this entry
- **Highlight** any special considerations or unusual circumstances

Present a concise executive summary suitable for management review.`,
      },
      {
        title: "Generate an executive summary of this journal entry",
        content: `Generate an executive summary of this journal entry:

- **Describe** the business purpose and accounting rationale
- **Quantify** the financial impact including total debits and credits
- **Assess** the overall quality and completeness of supporting documentation
- **Evaluate** compliance with accounting policies and internal controls

Provide a clear, high-level overview appropriate for senior stakeholders.`,
      },
      {
        title: "List the top 3 items requiring reviewer attention",
        content: `List the top 3 items requiring reviewer attention:

- **Prioritize** issues based on materiality and potential financial impact
- **Identify** unresolved quality check failures or data validation errors
- **Highlight** missing documentation or incomplete approval workflows
- **Flag** any regulatory compliance or policy deviation concerns

Rank items by urgency and provide specific recommendations for resolution.`,
      },
    ],
  },
  {
    category: "Compliance",
    prompts: [
      {
        title: "Verify compliance with internal controls requirements",
        content: `Verify compliance with internal controls requirements:

- **Confirm** proper segregation of duties between preparer and approver
- **Validate** that authorization thresholds have been respected
- **Check** that the approval workflow was completed correctly
- **Ensure** all required control checkpoints have been satisfied

Document the control testing results and any gaps requiring remediation.`,
      },
      {
        title: "Check if all required supporting documents are attached",
        content: `Check if all required supporting documents are attached:

- **Verify** presence of source documents, invoices, or contracts as applicable
- **Validate** that supporting calculations and reconciliations are included
- **Confirm** management approvals and authorization memos are present
- **Assess** whether documentation quality meets policy standards

Provide a completeness assessment and list any missing required attachments.`,
      },
      {
        title: "Identify any segregation of duties concerns",
        content: `Identify any segregation of duties concerns:

- **Review** the roles and responsibilities of personnel involved in this entry
- **Verify** that the preparer and approver are different individuals
- **Check** for any conflicts of interest or incompatible duties
- **Validate** compliance with independence and authorization requirements

Highlight any potential control weaknesses and recommend corrective measures.`,
      },
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

const MOCK_PREPARER_POLISH_RESPONSE = `Please analyze the following journal entry for compliance with month-end close procedures:

- **Verify** all account balances reconcile to supporting documentation
- **Confirm** variance explanations are within acceptable thresholds
- **Review** intercompany eliminations for proper matching
- **Validate** cutoff procedures were followed correctly

Flag any discrepancies or items requiring additional review before final approval.`

const MOCK_REVIEWER_POLISH_RESPONSE = `Please conduct a comprehensive review of the submitted journal entry and assess readiness for final approval:

- **Evaluate** the adequacy of supporting documentation and preparer explanations
- **Validate** that all quality check items have been appropriately addressed
- **Assess** whether variance explanations are reasonable and properly justified
- **Verify** internal controls compliance including maker-checker segregation
- **Confirm** all flagged items from data quality checks have been resolved or documented

Provide a final recommendation on whether this entry should be approved, returned for revision, or escalated for additional review.`

function GenerateButtonContent({
  isThinking,
  isStreaming,
}: {
  isThinking: boolean
  isStreaming: boolean
}) {
  if (isThinking) {
    return (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Thinking...
      </>
    )
  }
  if (isStreaming) {
    return (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Generating...
      </>
    )
  }
  return (
    <>
      <Send className="h-3.5 w-3.5" />
      Generate
    </>
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex w-6">
      <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
      <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
      <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
    </span>
  )
}

function ResponseContent({
  isThinking,
  isStreaming,
  hasContent,
  streamedContent,
}: {
  isThinking: boolean
  isStreaming: boolean
  hasContent: boolean
  streamedContent: string
}) {
  if (hasContent || isThinking) {
    return (
      <div className="relative">
        {isThinking && !hasContent ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Thinking
              <ThinkingDots />
            </span>
          </div>
        ) : (
          <>
            <MarkdownDisplay content={streamedContent} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
            )}
          </>
        )}
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
      <span>AI response will appear here</span>
    </div>
  )
}

interface AiPromptPanelProps {
  title?: string
  readonly?: boolean
  promptPlaceholder?: string
  showUseResultButton?: boolean
  useLocalState?: boolean
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
  const [isPolishing, setIsPolishing] = useState(false)
  const [polishedText, setPolishedText] = useState("")
  const [showPolishDialog, setShowPolishDialog] = useState(false)
  const [polishStreamedText, setPolishStreamedText] = useState("")
  const [isAdopting, setIsAdopting] = useState(false)
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [editedResponse, setEditedResponse] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isPolishThinking, setIsPolishThinking] = useState(false)
  const streamRef = useRef<StreamController | null>(null)
  const polishStreamRef = useRef<StreamController | null>(null)
  const responseContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    return () => {
      streamRef.current?.stop()
      polishStreamRef.current?.stop()
    }
  }, [])

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

    setIsStreaming(true)
    setIsThinking(true)
    resetForNewGeneration()

    const responseTemplate =
      agentType === "reviewer" ? MOCK_REVIEWER_RESPONSE_TEMPLATE : MOCK_PREPARER_RESPONSE_TEMPLATE

    const controller = simulateRealisticStream(
      responseTemplate,
      setStreamedContent,
      () => {
        setIsStreaming(false)
        setIsThinking(false)
        setHasGeneratedResponse(true)
      },
      {
        thinkingDelay: 1500,
        baseTokenDelay: 12,
        minTokenDelay: 5,
        maxTokenDelay: 25,
        sentenceEndDelay: 30,
        paragraphDelay: 50,
        accelerate: true,
        onStreamStart: () => setIsThinking(false),
      }
    )
    streamRef.current = controller
  }, [
    prompt,
    isStreaming,
    setIsStreaming,
    setHasGeneratedResponse,
    setStreamedContent,
    resetForNewGeneration,
    agentType,
  ])

  const handlePolishWriting = useCallback(() => {
    if (!prompt.trim() || isPolishing) {
      return
    }

    const polishResponse =
      agentType === "reviewer" ? MOCK_REVIEWER_POLISH_RESPONSE : MOCK_PREPARER_POLISH_RESPONSE

    setIsPolishing(true)
    setIsPolishThinking(true)
    setShowPolishDialog(true)
    setPolishStreamedText("")
    setPolishedText(polishResponse)

    const controller = simulateQuickStream(polishResponse, setPolishStreamedText, () =>
      setIsPolishing(false)
    )
    setTimeout(() => setIsPolishThinking(false), 800)
    polishStreamRef.current = controller
  }, [prompt, isPolishing, agentType])

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
    polishStreamRef.current?.stop()
    setIsPolishing(false)
    setIsPolishThinking(false)
  }, [])

  const handleSelectPrompt = useCallback(
    (selectedPromptContent: string) => {
      setPrompt(selectedPromptContent)
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
        <div className="flex w-[300px] shrink-0 flex-col gap-2">
          <div className="flex h-7 items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
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
                          key={suggestionPrompt.title}
                          onClick={() => handleSelectPrompt(suggestionPrompt.content)}
                        >
                          {suggestionPrompt.title}
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
            <GenerateButtonContent isStreaming={isStreaming} isThinking={isThinking} />
          </Button>
        </div>

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
            {!isEditingResponse && (
              <ResponseContent
                hasContent={hasContent}
                isStreaming={isStreaming}
                isThinking={isThinking}
                streamedContent={streamedContent}
              />
            )}
          </div>

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

      <Dialog onOpenChange={setShowPolishDialog} open={showPolishDialog}>
        <DialogContent className="sm:max-w-[600px]">
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
              <div className="max-h-[80px] overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm">
                {prompt}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 font-medium text-muted-foreground text-xs">
                Polished
                {isPolishing && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <div className="min-h-[140px] rounded-md border bg-primary/5 p-3 text-sm">
                {isPolishThinking ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      Polishing
                      <ThinkingDots />
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <MarkdownDisplay content={polishStreamedText} />
                    {isPolishing && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary" />
                    )}
                  </div>
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
