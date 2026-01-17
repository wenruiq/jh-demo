import { Eye } from "lucide-react"
import { AiPromptPanel } from "@/components/journal/sections/ai-prompt-panel"
import { DataQualityCheck } from "@/components/journal/sections/data-quality-check"
import { DataUploadSection } from "@/components/journal/sections/data-upload-section"
import { ProgressSummary } from "@/components/journal/sections/progress-summary"
import { ViewNavButton, ViewNavHeader } from "@/components/journal/shared/view-nav-button"
import { Badge } from "@/components/ui/badge"

export function ReviewerCoverSheetView() {
  return (
    <div className="flex flex-col">
      <ViewNavHeader>
        <ViewNavButton label="Back to Journal" targetView="journal" />
        <div className="ml-auto flex items-center gap-2">
          <Badge className="gap-1" variant="secondary">
            <Eye className="h-3 w-3" />
            Viewing as Reviewer
          </Badge>
          <ViewNavButton label="View Summary" targetView="reviewer-summary" variant="link" />
        </div>
      </ViewNavHeader>
      <ProgressSummary readonly />
      <DataUploadSection readonly />
      <DataQualityCheck readonly />
      <AiPromptPanel
        promptPlaceholder="Ask AI to analyze the journal data..."
        readonly
        title="Summary & Findings"
      />
    </div>
  )
}
