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

const MOCK_AI_RESPONSE_TEMPLATE = `## Analysis Summary

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

interface AiPromptPanelProps {
  title?: string
  readonly?: boolean
  promptPlaceholder?: string
  showUseResultButton?: boolean
  /** When true, uses local state instead of the shared store (for independent panels like Reviewer Agent) */
  useLocalState?: boolean
}

export function AiPromptPanel({
  title = "Summary & Findings",
  readonly = false,
  promptPlaceholder = "Ask AI to analyze this journal entry...",
  showUseResultButton = false,
  useLocalState = false,
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

    // Start streaming immediately with faster speed
    const intervalId = simulateStream(
      MOCK_AI_RESPONSE_TEMPLATE,
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
  ])

  const handlePolishWriting = useCallback(() => {
    if (!prompt.trim() || isPolishing) {
      return
    }

    setIsPolishing(true)
    setShowPolishDialog(true)
    setPolishStreamedText("")

    // The "polished" version - in demo, we'll add some refinements to show it's working
    const polished = prompt
      .split(". ")
      .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
      .join(". ")
      .replace(/\s+/g, " ")
      .trim()

    const polishedVersion = `${polished}${polished.endsWith(".") ? "" : "."}`
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
