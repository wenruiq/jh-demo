import { Bot, Check, Loader2, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MentionEditor } from "@/components/ui/mention-editor"
import { AiAttestationSection } from "@/features/journal/components/sections/quality-checks/ai-attestation-section"
import { AiPromptEditor } from "@/features/journal/components/sections/quality-checks/ai-prompt-editor"
import { isQualityCheckDone } from "@/features/journal/components/sections/quality-checks/utils"
import { useAvailableMentions } from "@/features/journal/hooks/use-quality-checks"
import type { QualityCheck } from "@/features/journal/state/data-quality-store"
import { useDataQualityStore } from "@/features/journal/state/data-quality-store"

interface AiCheckDetailProps {
  check: QualityCheck
  assetId: string
  readonly?: boolean
}

interface UndoAcknowledgeButtonProps {
  isLoading: boolean
  onClick: () => void
}

function UndoAcknowledgeButton({ isLoading, onClick }: UndoAcknowledgeButtonProps) {
  return (
    <Button disabled={isLoading} onClick={onClick} variant="outline">
      {isLoading ? (
        <>
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          Reverting...
        </>
      ) : (
        <>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Undo Acknowledge
        </>
      )}
    </Button>
  )
}

export function AiCheckDetail({ check, assetId, readonly = false }: AiCheckDetailProps) {
  const mentions = useAvailableMentions()
  const loading = useDataQualityStore((state) => state.loading)
  const thinkingCheckId = useDataQualityStore((state) => state.thinkingCheckId)
  const streamingCheckId = useDataQualityStore((state) => state.streamingCheckId)
  const streamingContent = useDataQualityStore((state) => state.streamingContent)
  const updatePrompt = useDataQualityStore((state) => state.updatePrompt)
  const savePrompt = useDataQualityStore((state) => state.savePrompt)
  const testAiCheck = useDataQualityStore((state) => state.testAiCheck)
  const acknowledgeCheck = useDataQualityStore((state) => state.acknowledgeCheck)
  const unacknowledgeCheck = useDataQualityStore((state) => state.unacknowledgeCheck)
  const markSuccess = useDataQualityStore((state) => state.markSuccess)
  const revertUserResult = useDataQualityStore((state) => state.revertUserResult)

  const [localPrompt, setLocalPrompt] = useState(check.prompt ?? "")
  const [hasChanges, setHasChanges] = useState(false)
  const [attestation, setAttestation] = useState(check.attestation ?? "")
  const [isEditing, setIsEditing] = useState(!check.userResult)

  useEffect(() => {
    setLocalPrompt(check.prompt ?? "")
    setHasChanges(false)
  }, [check.prompt])

  useEffect(() => {
    setAttestation(check.attestation ?? "")
    setIsEditing(!check.userResult)
  }, [check.attestation, check.userResult])

  const isThinking = thinkingCheckId === check.id
  const isStreaming = streamingCheckId === check.id
  const isDone = isQualityCheckDone(check)
  const canAcknowledge = check.systemResult === "Pass" && !check.acknowledged
  const canUnacknowledge = check.systemResult === "Pass" && check.acknowledged

  const handlePromptChange = (value: string) => {
    setLocalPrompt(value)
    setHasChanges(value !== check.prompt)
  }

  const handleSave = async () => {
    updatePrompt(assetId, check.id, localPrompt)
    await savePrompt(assetId, check.id)
    setHasChanges(false)
  }

  const handleTest = async () => {
    await testAiCheck(assetId, check.id)
  }

  const handleMarkSuccess = async () => {
    if (!attestation.trim()) {
      return
    }
    await markSuccess(assetId, check.id, attestation)
    setIsEditing(false)
  }

  const handleRevert = async () => {
    await revertUserResult(assetId, check.id)
    setIsEditing(true)
  }

  const displayResult = isStreaming ? streamingContent : check.aiResult

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base">
          <span className="font-bold">{check.assertion}:</span> {check.title}
        </h3>
        <Badge className="mt-1.5" variant="neutral">
          <Bot className="mr-1 h-3 w-3" />
          AI Check
        </Badge>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Prompt
        </p>
        {readonly ? (
          <div className="rounded-md bg-muted/50 px-3 py-2">
            <MentionEditor mentions={mentions} readonly value={localPrompt} />
          </div>
        ) : (
          <AiPromptEditor
            hasChanges={hasChanges}
            isSaveLoading={loading.savePrompt === check.id}
            isStreaming={isStreaming}
            isTestLoading={loading.testAi === check.id}
            localPrompt={localPrompt}
            mentions={mentions}
            onPromptChange={handlePromptChange}
            onSave={handleSave}
            onTest={handleTest}
          />
        )}
      </div>

      {(displayResult || isStreaming || isThinking) && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              AI Result
            </p>
            {!(isStreaming || isThinking) && (
              <Badge variant={check.systemResult === "Pass" ? "success" : "destructive-outline"}>
                {check.systemResult}
              </Badge>
            )}
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            {isThinking ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Thinking
                  <span className="inline-flex w-6">
                    <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
                    <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
                    <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
                  </span>
                </span>
              </div>
            ) : (
              <>
                {displayResult && (
                  <MentionEditor mentions={mentions} readonly value={displayResult} />
                )}
                {isStreaming && (
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle" />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <AiAttestationSection
        attestation={attestation}
        check={check}
        isEditing={isEditing}
        isLoading={loading.markSuccess === check.id || loading.revertUserResult === check.id}
        onAttestationChange={setAttestation}
        onMarkSuccess={handleMarkSuccess}
        onRevert={handleRevert}
        readonly={readonly}
      />

      {canAcknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.acknowledge === check.id}
            onClick={() => acknowledgeCheck(assetId, check.id)}
          >
            {loading.acknowledge === check.id ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Acknowledging...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Acknowledge
              </>
            )}
          </Button>
        </div>
      )}

      {canUnacknowledge && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
            <Check className="h-4 w-4 text-success" />
            <p className="font-medium text-sm text-success">
              Journal check passed & acknowledged by preparer
            </p>
          </div>
          {!readonly && (
            <div className="flex justify-end">
              <UndoAcknowledgeButton
                isLoading={loading.unacknowledge === check.id}
                onClick={() => unacknowledgeCheck(assetId, check.id)}
              />
            </div>
          )}
        </div>
      )}

      {isDone && !canUnacknowledge && (
        <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium text-sm text-success">
            Journal check result overridden & acknowledged by preparer
          </p>
        </div>
      )}
    </div>
  )
}
