import { ActivitySection } from "@/features/journal/components/sections/activity-section"
import { AiPromptPanel } from "@/features/journal/components/sections/ai-prompt-panel"
import { DataUploadSection } from "@/features/journal/components/sections/data-upload-section"
import { JournalCheck } from "@/features/journal/components/sections/journal-check"
import { ProgressSummary } from "@/features/journal/components/sections/progress-summary"
import { SummarySection } from "@/features/journal/components/sections/summary-section"

export function ReviewerSummaryView() {
  return (
    <div className="flex flex-col">
      <ProgressSummary />
      <DataUploadSection defaultOpen={false} readonly />
      <JournalCheck defaultOpen={false} readonly />
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
