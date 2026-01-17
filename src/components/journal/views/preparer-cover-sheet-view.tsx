import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { DataQualityCheck } from "@/components/journal/sections/data-quality-check"
import { DataUploadSection } from "@/components/journal/sections/data-upload-section"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"

export function PreparerCoverSheetView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Journal" targetView="journal" />
      </ViewNavHeader>
      <ProgressSummary />
      <DataUploadSection />
      <DataQualityCheck />
      <AiPromptPanel
        promptPlaceholder="Ask AI to analyze the journal data..."
        title="Summary & Findings"
      />
    </div>
  )
}
