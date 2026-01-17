import { Send, Sparkles } from "lucide-react"
import { useState } from "react"
import { MarkdownDisplay } from "@/components/journal/shared/markdown-display"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOCK_AI_RESPONSE = `
## Analysis Summary

Based on the uploaded documents and data quality checks, here are the key findings:

### Observations
- All supporting documents have been verified
- Account balances reconcile within acceptable tolerance (±0.01%)
- No duplicate entries detected

### Recommendations
1. Review the variance in Account 4500-01 (exceeded 5% threshold)
2. Confirm the manual adjustment on line 47
3. Attach supporting memo for the reclassification entry

### Risk Assessment
**Low Risk** - This journal entry follows standard month-end close procedures with no significant anomalies detected.
`

interface AiPromptPanelProps {
  title?: string
  readonly?: boolean
  promptPlaceholder?: string
}

export function AiPromptPanel({
  title = "Summary & Findings",
  readonly = false,
  promptPlaceholder = "Ask AI to analyze this journal entry...",
}: AiPromptPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [hasResponse] = useState(true)

  return (
    <SectionContainer title={title}>
      <div className="flex gap-4" style={{ minHeight: "200px" }}>
        <div className="flex w-[280px] shrink-0 flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Assistant</span>
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
          <Button className="gap-2" disabled={readonly || !prompt.trim()} size="sm">
            <Send className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto rounded-md border bg-muted/20 p-3">
          {hasResponse ? (
            <MarkdownDisplay content={MOCK_AI_RESPONSE} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              AI response will appear here
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
