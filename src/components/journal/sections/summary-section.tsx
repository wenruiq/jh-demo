import { Check, Edit2, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { MarkdownDisplay } from "@/components/journal/shared/markdown-display"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"
import { useAiFindingsStore } from "@/store/ai-findings-store"
import { MonthlyTrendChart } from "./monthly-trend-chart"

const FALLBACK_CONTENT = "*Key findings have not been generated.*"

export function SummarySection() {
  const { adoptedFindings, setAdoptedFindings } = useAiFindingsStore()

  const hasAdoptedContent = adoptedFindings !== null
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Sync edit content with adopted findings
  useEffect(() => {
    if (adoptedFindings) {
      setEditContent(adoptedFindings.content)
    }
  }, [adoptedFindings])

  const handleStartEdit = () => {
    if (adoptedFindings) {
      setEditContent(adoptedFindings.content)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    if (adoptedFindings) {
      setEditContent(adoptedFindings.content)
    }
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!(adoptedFindings && editContent.trim())) {
      return
    }

    setIsSaving(true)
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setAdoptedFindings({
      ...adoptedFindings,
      content: editContent,
    })
    setIsSaving(false)
    setIsEditing(false)
  }

  const hasChanges = adoptedFindings && editContent !== adoptedFindings.content

  return (
    <SectionContainer title="Summary">
      <div className="flex gap-6" style={{ height: "280px" }}>
        <div className="flex flex-[65] flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Key Findings
            </h4>
            <div className="flex items-center gap-2">
              {hasAdoptedContent && adoptedFindings && !isEditing && (
                <>
                  <span className="text-muted-foreground text-xs">
                    Generated {adoptedFindings.generatedAt.toLocaleTimeString()}
                  </span>
                  <Button
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={handleStartEdit}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                </>
              )}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    className="h-6 gap-1 px-2 text-xs"
                    disabled={isSaving}
                    onClick={handleCancelEdit}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                  <Button
                    className="h-6 gap-1 px-2 text-xs"
                    disabled={!hasChanges || isSaving}
                    onClick={handleSaveEdit}
                    size="sm"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3">
            {isEditing && (
              <textarea
                className="h-full w-full resize-none bg-transparent font-mono text-sm focus:outline-none"
                onChange={(e) => setEditContent(e.target.value)}
                value={editContent}
              />
            )}
            {!isEditing && hasAdoptedContent && adoptedFindings && (
              <MarkdownDisplay content={adoptedFindings.content} />
            )}
            {!(isEditing || hasAdoptedContent) && (
              <div className="flex h-full items-center justify-center">
                <MarkdownDisplay content={FALLBACK_CONTENT} />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-[35] flex-col">
          <h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Monthly Trends
          </h4>
          <div className="flex-1 rounded-md border border-border/60 bg-muted/20 p-3">
            <MonthlyTrendChart />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
