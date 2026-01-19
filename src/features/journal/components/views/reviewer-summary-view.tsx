import { ActivitySection } from "@/features/journal/components/sections/activity-section"
import { AiPromptPanel } from "@/features/journal/components/sections/ai-prompt-panel"
import { ProgressSummary } from "@/features/journal/components/sections/progress-summary"
import { SummarySection } from "@/features/journal/components/sections/summary-section"
import { ViewNavButton, ViewNavHeader } from "@/features/journal/components/shared/view-nav-button"

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
