import { Eye } from "lucide-react"
import { ActivitySection } from "@/components/journal/sections/activity-section"
import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { SummarySection } from "@/components/journal/sections/summary-section"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"
import { Badge } from "@/components/ui/badge"

export function ReviewerSummaryView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Journal" targetView="journal" />
        <div className="ml-auto flex items-center gap-2">
          <Badge className="gap-1" variant="secondary">
            <Eye className="h-3 w-3" />
            Reviewer
          </Badge>
          <ViewNavButton
            label="View Cover Sheet"
            targetView="reviewer-cover-sheet"
            variant="link"
          />
        </div>
      </ViewNavHeader>
      <ProgressSummary />
      <SummarySection />
      <AiPromptPanel
        promptPlaceholder="Ask the reviewer agent to analyze this entry..."
        title="Reviewer Agent"
      />
      <ActivitySection />
    </div>
  )
}
