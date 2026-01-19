import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { DataUploadSection } from "@/components/journal/sections/data-upload-section"
import { JournalCheck } from "@/components/journal/sections/journal-check"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"

export function ReviewerCoverSheetView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Entry" targetView="journal" />
        <ViewNavButton label="Back to Summary" targetView="reviewer-summary" variant="return" />
      </ViewNavHeader>
      <ProgressSummary readonly />
      <DataUploadSection readonly />
      <JournalCheck readonly />
      <AiPromptPanel
        promptPlaceholder="Ask AI to analyze the journal data..."
        readonly
        title="Summary & Findings"
      />
    </div>
  )
}
