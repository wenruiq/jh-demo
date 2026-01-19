import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { DataUploadSection } from "@/components/journal/sections/data-upload-section"
import { JournalCheck } from "@/components/journal/sections/journal-check"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"

export function PreparerCoverSheetView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Entry" targetView="journal" />
      </ViewNavHeader>
      <ProgressSummary />
      <DataUploadSection />
      <JournalCheck />
      <AiPromptPanel
        promptPlaceholder="Ask AI to analyze the journal data..."
        showUseResultButton
        title="Summary & Findings"
      />
    </div>
  )
}
