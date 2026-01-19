// AI Prompt Editor Component
// Helper component for editing AI check prompts

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MentionEditor } from "@/components/ui/mention-editor"

interface AiPromptEditorProps {
  localPrompt: string
  mentions: string[]
  hasChanges: boolean
  isStreaming: boolean
  isTestLoading: boolean
  isSaveLoading: boolean
  onPromptChange: (value: string) => void
  onTest: () => Promise<void>
  onSave: () => Promise<void>
}

export function AiPromptEditor({
  localPrompt,
  mentions,
  hasChanges,
  isStreaming,
  isTestLoading,
  isSaveLoading,
  onPromptChange,
  onTest,
  onSave,
}: AiPromptEditorProps) {
  const isBusy = isTestLoading || isSaveLoading || isStreaming

  return (
    <div className="space-y-2">
      <MentionEditor
        mentions={mentions}
        onChange={onPromptChange}
        placeholder="Enter prompt. Type @ to reference data assets..."
        value={localPrompt}
      />
      <div className="flex justify-end gap-2">
        <Button disabled={isBusy} onClick={onTest} size="sm" variant="outline">
          {isTestLoading || isStreaming ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Running...
            </>
          ) : (
            "Test"
          )}
        </Button>
        <Button disabled={!hasChanges || isBusy} onClick={onSave} size="sm">
          {isSaveLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  )
}
