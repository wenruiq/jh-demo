import { AiPromptPanel } from "@/features/journal/components/sections/ai-prompt-panel"
import { DataUploadSection } from "@/features/journal/components/sections/data-upload-section"
import { JournalCheck } from "@/features/journal/components/sections/journal-check"
import { ProgressSummary } from "@/features/journal/components/sections/progress-summary"
import { ViewNavButton, ViewNavHeader } from "@/features/journal/components/shared/view-nav-button"

export function ReviewerCoverSheetView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
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
