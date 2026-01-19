import { ActivitySection } from "@/components/journal/sections/activity-section"
import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { SummarySection } from "@/components/journal/sections/summary-section"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"

export function ReviewerSummaryView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Entry" targetView="journal" />
        <ViewNavButton label="View Submission" targetView="reviewer-cover-sheet" variant="view" />
      </ViewNavHeader>
      <ProgressSummary />
      <SummarySection />
      <AiPromptPanel
        agentType="reviewer"
        promptPlaceholder="Ask the reviewer agent to analyze this entry..."
        title="Reviewer Agent"
        useLocalState
      />
      <ActivitySection />
    </div>
  )
}
