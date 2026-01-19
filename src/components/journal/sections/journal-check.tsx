import {
  Bot,
  Check,
  ClipboardCheck,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Server,
} from "lucide-react"
import { useEffect, useState } from "react"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MentionEditor } from "@/components/ui/mention-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  ASSERTIONS,
  type Assertion,
  CHECK_TYPES,
  type CheckType,
  type QualityCheck,
  useDataQualityStore,
} from "@/store/data-quality-store"
import { useDataUploadStore } from "@/store/data-upload-store"
import { useJournalStore } from "@/store/journal-store"

// Get available mentions from data uploads + always include JournalEntry
function useAvailableMentions() {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)

  const uploads = selectedAssetId ? (uploadsByAssetId[selectedAssetId] ?? []) : []
  const uploadNames = uploads.map((u) => u.name)

  return ["JournalEntry", ...uploadNames]
}

// Helper to check if a QC is "done" (acknowledged if passed, marked success if failed, or verified if manual)
function isQualityCheckDone(check: QualityCheck): boolean {
  // Manual checks are done when user marks them as verified (userResult = Pass)
  if (check.type === "Manual Check") {
    return check.userResult === "Pass"
  }
  // System/AI checks: if system passed, need acknowledgment; if failed, need user pass
  if (check.systemResult === "Pass") {
    return check.acknowledged
  }
  return check.userResult === "Pass"
}

// Get the icon for the acknowledge button
function getAcknowledgeButtonIcon(isLoading: boolean | undefined, canAcknowledge: boolean) {
  if (isLoading) {
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />
  }
  if (canAcknowledge) {
    return <Check className="h-3.5 w-3.5" />
  }
  return <RotateCcw className="h-3.5 w-3.5" />
}

// Quality Check Card in the list
interface QualityCheckCardProps {
  check: QualityCheck
  isSelected: boolean
  onClick: () => void
  onAcknowledge?: () => void
  onUnacknowledge?: () => void
  isLoading?: boolean
  readonly?: boolean
}

function QualityCheckCard({
  check,
  isSelected,
  onClick,
  onAcknowledge,
  onUnacknowledge,
  isLoading,
  readonly,
}: QualityCheckCardProps) {
  const isDone = isQualityCheckDone(check)
  const isManualCheck = check.type === "Manual Check"
  // Manual checks don't have system results - they're purely user verified
  const canAcknowledge = !isManualCheck && check.systemResult === "Pass" && !check.acknowledged
  const canUnacknowledge = !isManualCheck && check.systemResult === "Pass" && check.acknowledged

  // Determine left border color based on status
  const getLeftBorderColor = () => {
    // Manual checks: green if verified, neutral if not
    if (isManualCheck) {
      return check.userResult === "Pass" ? "border-l-success/40" : "border-l-muted-foreground/30"
    }
    if (check.systemResult === "Pass") {
      return "border-l-success/40"
    }
    if (check.systemResult === "Failed" && check.userResult === "Pass") {
      return "border-l-warning/40"
    }
    if (check.systemResult === "Failed") {
      return "border-l-destructive/40"
    }
    return "border-l-transparent"
  }

  // Get the type label for the badge
  const getTypeBadge = () => {
    if (isManualCheck) {
      return (
        <Badge
          className="px-1.5 py-0 text-[10px]"
          variant={check.userResult === "Pass" ? "success" : "neutral"}
        >
          Manual: {check.userResult === "Pass" ? "Verified" : "Pending"}
        </Badge>
      )
    }
    return (
      <Badge
        className="px-1.5 py-0 text-[10px]"
        variant={check.systemResult === "Pass" ? "success" : "destructive-outline"}
      >
        {check.type === "AI Check" ? "AI" : "System"}: {check.systemResult}
      </Badge>
    )
  }

  return (
    <button
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-2 rounded-md border border-border/40 border-l-4 px-2.5 py-3 text-left transition-colors",
        isSelected ? "border-border/60 bg-muted" : "hover:bg-muted/50",
        getLeftBorderColor()
      )}
      onClick={onClick}
      type="button"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="font-semibold">{check.assertion}:</span>{" "}
          <span className="text-muted-foreground">{check.title}</span>
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          {getTypeBadge()}
          {!isManualCheck && check.systemResult === "Failed" && check.userResult === "Pass" && (
            <Badge className="px-1.5 py-0 text-[10px]" variant="success">
              User: Pass
            </Badge>
          )}
        </div>
      </div>
      {isDone && <Check className="absolute right-2 bottom-2.5 h-3.5 w-3.5 text-success" />}
      {!readonly && (canAcknowledge || canUnacknowledge) && (
        <button
          className={cn(
            "absolute right-2 bottom-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all disabled:opacity-50",
            canUnacknowledge
              ? "bg-background text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100"
              : "text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100"
          )}
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation()
            if (canAcknowledge && onAcknowledge) {
              onAcknowledge()
            }
            if (canUnacknowledge && onUnacknowledge) {
              onUnacknowledge()
            }
          }}
          type="button"
        >
          {getAcknowledgeButtonIcon(isLoading, canAcknowledge)}
        </button>
      )}
    </button>
  )
}

// System Check Detail Panel
interface SystemCheckDetailProps {
  check: QualityCheck
  assetId: string
  readonly?: boolean
}

function SystemCheckDetail({ check, assetId, readonly = false }: SystemCheckDetailProps) {
  const loading = useDataQualityStore((state) => state.loading)
  const markSuccess = useDataQualityStore((state) => state.markSuccess)
  const acknowledgeCheck = useDataQualityStore((state) => state.acknowledgeCheck)
  const unacknowledgeCheck = useDataQualityStore((state) => state.unacknowledgeCheck)
  const revertUserResult = useDataQualityStore((state) => state.revertUserResult)

  const [attestation, setAttestation] = useState(check.attestation ?? "")
  const [isEditing, setIsEditing] = useState(!check.userResult)

  useEffect(() => {
    setAttestation(check.attestation ?? "")
    setIsEditing(!check.userResult)
  }, [check.attestation, check.userResult])

  const isDone = isQualityCheckDone(check)
  const canAcknowledge = check.systemResult === "Pass" && !check.acknowledged
  const canUnacknowledge = check.systemResult === "Pass" && check.acknowledged

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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base">
          <span className="font-bold">{check.assertion}:</span> {check.title}
        </h3>
        <Badge className="mt-1.5" variant="neutral">
          <Server className="mr-1 h-3 w-3" />
          System Check
        </Badge>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Description
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{check.description}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            System Result
          </p>
          <Badge variant={check.systemResult === "Pass" ? "success" : "destructive-outline"}>
            {check.systemResult}
          </Badge>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm leading-relaxed">{check.systemResultExplanation}</p>
        </div>
      </div>

      {check.systemResult === "Failed" && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Attestation
            </p>
            {check.userResult === "Pass" && (
              <div className="flex items-center gap-1">
                <Badge variant="success">Marked Success</Badge>
                {!readonly && (
                  <Button
                    className="h-6 px-1.5 text-[10px]"
                    disabled={loading.revertUserResult === check.id}
                    onClick={handleRevert}
                    size="sm"
                    variant="ghost"
                  >
                    {loading.revertUserResult === check.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Revert
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
          {isEditing && !readonly ? (
            <div className="space-y-2">
              <Textarea
                className="min-h-[80px]"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setAttestation(e.target.value)
                }
                placeholder="Explain why this check should be marked as success..."
                value={attestation}
              />
              <div className="flex justify-end">
                <Button
                  disabled={!attestation.trim() || loading.markSuccess === check.id}
                  onClick={handleMarkSuccess}
                  size="sm"
                >
                  {loading.markSuccess === check.id ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Mark Success"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm leading-relaxed">
                {check.attestation || "No attestation provided"}
              </p>
            </div>
          )}
        </div>
      )}

      {canAcknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.acknowledge === check.id}
            onClick={() => acknowledgeCheck(assetId, check.id)}
            size="sm"
          >
            {loading.acknowledge === check.id ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Acknowledging...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Acknowledge
              </>
            )}
          </Button>
        </div>
      )}

      {canUnacknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.unacknowledge === check.id}
            onClick={() => unacknowledgeCheck(assetId, check.id)}
            size="sm"
            variant="outline"
          >
            {loading.unacknowledge === check.id ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Reverting...
              </>
            ) : (
              <>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Undo Acknowledge
              </>
            )}
          </Button>
        </div>
      )}

      {isDone && !canUnacknowledge && (
        <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium text-sm text-success">Quality check completed</p>
        </div>
      )}
    </div>
  )
}

// Helper component for AI prompt editor
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

function AiPromptEditor({
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

// Helper component for AI attestation section
interface AiAttestationSectionProps {
  check: QualityCheck
  attestation: string
  isEditing: boolean
  readonly: boolean
  isLoading: boolean
  onAttestationChange: (value: string) => void
  onMarkSuccess: () => Promise<void>
  onRevert: () => Promise<void>
}

function AiAttestationSection({
  check,
  attestation,
  isEditing,
  readonly,
  isLoading,
  onAttestationChange,
  onMarkSuccess,
  onRevert,
}: AiAttestationSectionProps) {
  if (check.systemResult !== "Failed") {
    return null
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Attestation
        </p>
        {check.userResult === "Pass" && (
          <div className="flex items-center gap-1.5">
            <Badge variant="success">Marked Success</Badge>
            {!readonly && (
              <Button
                className="h-6 px-2 text-[10px]"
                disabled={isLoading}
                onClick={onRevert}
                size="sm"
                variant="ghost"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Revert
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
      {isEditing && !readonly ? (
        <div className="space-y-2">
          <Textarea
            className="min-h-[80px]"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onAttestationChange(e.target.value)
            }
            placeholder="Explain why this check should be marked as success..."
            value={attestation}
          />
          <div className="flex justify-end">
            <Button disabled={!attestation.trim() || isLoading} onClick={onMarkSuccess} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Mark Success"
              )}
            </Button>
          </div>
        </div>
      ) : (
        check.userResult === "Pass" && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm leading-relaxed">
              {check.attestation || "No attestation provided"}
            </p>
          </div>
        )
      )}
    </div>
  )
}

// AI Check Detail Panel
interface AiCheckDetailProps {
  check: QualityCheck
  assetId: string
  readonly?: boolean
}

function AiCheckDetail({ check, assetId, readonly = false }: AiCheckDetailProps) {
  const mentions = useAvailableMentions()
  const loading = useDataQualityStore((state) => state.loading)
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

      {(displayResult || isStreaming) && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              AI Result
            </p>
            {!isStreaming && (
              <Badge variant={check.systemResult === "Pass" ? "success" : "destructive-outline"}>
                {check.systemResult}
              </Badge>
            )}
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            {displayResult && <MentionEditor mentions={mentions} readonly value={displayResult} />}
            {isStreaming && (
              <span className="inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle" />
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

      {canUnacknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.unacknowledge === check.id}
            onClick={() => unacknowledgeCheck(assetId, check.id)}
            variant="outline"
          >
            {loading.unacknowledge === check.id ? (
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
        </div>
      )}

      {isDone && !canUnacknowledge && (
        <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium text-sm text-success">Quality check completed</p>
        </div>
      )}
    </div>
  )
}

// Manual Check Detail Panel
interface ManualCheckDetailProps {
  check: QualityCheck
  assetId: string
  readonly?: boolean
}

function ManualCheckDetail({ check, assetId, readonly = false }: ManualCheckDetailProps) {
  const loading = useDataQualityStore((state) => state.loading)
  const markSuccess = useDataQualityStore((state) => state.markSuccess)
  const revertUserResult = useDataQualityStore((state) => state.revertUserResult)

  const [attestation, setAttestation] = useState(check.attestation ?? "")
  const [isEditing, setIsEditing] = useState(!check.userResult)

  useEffect(() => {
    setAttestation(check.attestation ?? "")
    setIsEditing(!check.userResult)
  }, [check.attestation, check.userResult])

  const isDone = check.userResult === "Pass"

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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base">
          <span className="font-bold">{check.assertion}:</span> {check.title}
        </h3>
        <Badge className="mt-1.5" variant="neutral">
          <ClipboardCheck className="mr-1 h-3 w-3" />
          Manual Check
        </Badge>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Description
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{check.description}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Verification
          </p>
          {check.userResult === "Pass" && (
            <div className="flex items-center gap-1">
              <Badge variant="success">Verified</Badge>
              {!readonly && (
                <Button
                  className="h-6 px-1.5 text-[10px]"
                  disabled={loading.revertUserResult === check.id}
                  onClick={handleRevert}
                  size="sm"
                  variant="ghost"
                >
                  {loading.revertUserResult === check.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Revert
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
        {isEditing && !readonly ? (
          <div className="space-y-2">
            <Textarea
              className="min-h-[80px]"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAttestation(e.target.value)
              }
              placeholder="Provide verification notes explaining how this check was completed..."
              value={attestation}
            />
            <div className="flex justify-end">
              <Button
                disabled={!attestation.trim() || loading.markSuccess === check.id}
                onClick={handleMarkSuccess}
                size="sm"
              >
                {loading.markSuccess === check.id ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Mark Verified
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          check.userResult === "Pass" && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm leading-relaxed">
                {check.attestation || "No verification notes provided"}
              </p>
            </div>
          )
        )}
      </div>

      {isDone && (
        <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium text-sm text-success">Manual check verified</p>
        </div>
      )}
    </div>
  )
}

// Add Quality Check Dialog
interface AddQualityCheckDialogProps {
  isLoading: boolean
  onAdd: (check: {
    assertion: Assertion
    title: string
    type: CheckType
    description: string
  }) => Promise<void>
}

function AddQualityCheckDialog({ isLoading, onAdd }: AddQualityCheckDialogProps) {
  const [open, setOpen] = useState(false)
  const [assertion, setAssertion] = useState<Assertion>("Accuracy")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CheckType>("System Check")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setAssertion("Accuracy")
    setTitle("")
    setType("System Check")
    setDescription("")
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return
    }

    await onAdd({
      assertion,
      title: title.trim(),
      type,
      description: description.trim(),
    })

    resetForm()
    setOpen(false)
  }

  const isValid = title.trim().length > 0

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="h-7 px-2 text-xs" size="sm" variant="outline">
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Journal Check</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="w-[130px] shrink-0 space-y-1.5">
              <Label htmlFor="qc-assertion">Assertion</Label>
              <Select onValueChange={(v) => setAssertion(v as Assertion)} value={assertion}>
                <SelectTrigger className="h-9" id="qc-assertion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSERTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="qc-title">Title</Label>
              <Input
                className="h-9"
                id="qc-title"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g., Tie-Out & Reconciliation"
                value={title}
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="font-semibold">{assertion}:</span>{" "}
            <span className="text-muted-foreground">{title || "..."}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-type">Type</Label>
            <Select onValueChange={(v) => setType(v as CheckType)} value={type}>
              <SelectTrigger className="h-9" id="qc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHECK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-1.5">
                      {t === "AI Check" && <Bot className="h-3.5 w-3.5" />}
                      {t === "System Check" && <Server className="h-3.5 w-3.5" />}
                      {t === "Manual Check" && <ClipboardCheck className="h-3.5 w-3.5" />}
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-description">Description</Label>
            <Textarea
              className="min-h-[80px]"
              id="qc-description"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what this quality check validates..."
              value={description}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Check"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface JournalCheckProps {
  readonly?: boolean
}

export function JournalCheck({ readonly = false }: JournalCheckProps) {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const checksByAssetId = useDataQualityStore((state) => state.checksByAssetId)
  const initializeAsset = useDataQualityStore((state) => state.initializeAsset)
  const loading = useDataQualityStore((state) => state.loading)
  const acknowledgeCheck = useDataQualityStore((state) => state.acknowledgeCheck)
  const unacknowledgeCheck = useDataQualityStore((state) => state.unacknowledgeCheck)
  const acknowledgeAll = useDataQualityStore((state) => state.acknowledgeAll)
  const addCheck = useDataQualityStore((state) => state.addCheck)

  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize asset on mount/change
  useEffect(() => {
    if (selectedAssetId) {
      initializeAsset(selectedAssetId)
    }
  }, [selectedAssetId, initializeAsset])

  // Get checks for the current asset
  const checks = selectedAssetId ? (checksByAssetId[selectedAssetId] ?? []) : []

  // Filter checks by search
  const filteredChecks = checks.filter((check) => {
    if (!searchQuery.trim()) {
      return true
    }
    const searchLower = searchQuery.toLowerCase()
    return (
      check.title.toLowerCase().includes(searchLower) ||
      check.assertion.toLowerCase().includes(searchLower)
    )
  })

  // Select first check by default
  useEffect(() => {
    if (filteredChecks.length > 0 && !selectedCheckId) {
      setSelectedCheckId(filteredChecks[0].id)
    }
  }, [filteredChecks, selectedCheckId])

  const selectedCheck = checks.find((c) => c.id === selectedCheckId)

  const handleAcknowledgeAll = async () => {
    if (!selectedAssetId) {
      return
    }
    await acknowledgeAll(selectedAssetId)
  }

  const handleAddCheck = async (checkData: {
    assertion: Assertion
    title: string
    type: CheckType
    description: string
  }) => {
    if (!selectedAssetId) {
      return
    }
    await addCheck(selectedAssetId, checkData)
  }

  // Count checks that need attention
  const pendingCount = checks.filter((c) => !isQualityCheckDone(c)).length
  const acknowledgeableCount = checks.filter(
    (c) => c.systemResult === "Pass" && !c.acknowledged
  ).length

  return (
    <SectionContainer title="Journal Checks">
      <div
        className={cn("flex overflow-hidden rounded-lg border", readonly && "opacity-80")}
        style={{ height: "520px" }}
      >
        {/* Left Panel - List */}
        <div className="flex w-[340px] shrink-0 flex-col border-r">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-2 py-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-7 pl-7 text-xs"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search..."
                value={searchQuery}
              />
            </div>
            <Button className="h-7 w-7 shrink-0" size="icon" variant="ghost">
              <Filter className="h-3.5 w-3.5" />
            </Button>
            {!readonly && (
              <>
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={acknowledgeableCount === 0 || loading.acknowledgeAll}
                  onClick={handleAcknowledgeAll}
                  size="sm"
                  variant="ghost"
                >
                  {loading.acknowledgeAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      All
                    </>
                  )}
                </Button>
                <AddQualityCheckDialog isLoading={loading.addCheck} onAdd={handleAddCheck} />
              </>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredChecks.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-muted-foreground text-sm">No quality checks found</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredChecks.map((check) => (
                  <QualityCheckCard
                    check={check}
                    isLoading={
                      loading.acknowledge === check.id || loading.unacknowledge === check.id
                    }
                    isSelected={selectedCheckId === check.id}
                    key={check.id}
                    onAcknowledge={
                      selectedAssetId
                        ? () => acknowledgeCheck(selectedAssetId, check.id)
                        : undefined
                    }
                    onClick={() => setSelectedCheckId(check.id)}
                    onUnacknowledge={
                      selectedAssetId
                        ? () => unacknowledgeCheck(selectedAssetId, check.id)
                        : undefined
                    }
                    readonly={readonly}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-1.5">
            <p className="text-[11px] text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} check${pendingCount !== 1 ? "s" : ""} pending`
                : "All checks completed"}
            </p>
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCheck && selectedCheck.type === "System Check" && (
            <SystemCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {selectedCheck && selectedCheck.type === "AI Check" && (
            <AiCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {selectedCheck && selectedCheck.type === "Manual Check" && (
            <ManualCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {!selectedCheck && (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Select a quality check to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
