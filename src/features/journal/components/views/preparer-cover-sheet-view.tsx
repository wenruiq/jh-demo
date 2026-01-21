import { AiPromptPanel } from "@/features/journal/components/sections/ai-prompt-panel"
import { DataUploadSection } from "@/features/journal/components/sections/data-upload-section"
import { JournalCheck } from "@/features/journal/components/sections/journal-check"
import { ProgressSummary } from "@/features/journal/components/sections/progress-summary"

export function PreparerCoverSheetView() {
  return (
    <div className="flex flex-col">
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
