import { CheckCircle2, FileText, Sparkles } from "lucide-react"
import { useEffect } from "react"
import { isQualityCheckDone } from "@/features/journal/components/sections/quality-checks/utils"
import { type FindingsStatus, useAiFindingsStore } from "@/features/journal/state/ai-findings-store"
import { useDataQualityStore } from "@/features/journal/state/data-quality-store"
import { useDataUploadStore } from "@/features/journal/state/data-upload-store"
import { useJournalStore } from "@/features/journal/state/journal-store"
import { cn } from "@/shared/lib/utils"

interface ProgressCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  description?: string
  variant?: "default" | "success" | "warning" | "error"
}

function ProgressCard({ icon, label, value, description, variant = "default" }: ProgressCardProps) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          variant === "success" && "bg-success-muted text-success",
          variant === "warning" && "bg-warning-muted text-warning",
          variant === "error" && "bg-destructive/10 text-destructive",
          variant === "default" && "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-lg leading-none">{value}</p>
        <p className="mt-0.5 text-muted-foreground text-xs">{label}</p>
        {description && (
          <p className="mt-1 truncate text-muted-foreground text-xs">{description}</p>
        )}
      </div>
    </div>
  )
}

function useDataUploadProgress() {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)
  const initializeAsset = useDataUploadStore((state) => state.initializeAsset)

  useEffect(() => {
    if (selectedAssetId) {
      initializeAsset(selectedAssetId)
    }
  }, [selectedAssetId, initializeAsset])

  if (!selectedAssetId) {
    return { uploaded: 0, total: 0 }
  }

  const uploads = uploadsByAssetId[selectedAssetId] ?? []
  const total = uploads.length
  const uploaded = uploads.filter((u) => u.fileName).length

  return { uploaded, total }
}

interface ProgressSummaryProps {
  readonly?: boolean
}

function getUploadDescription(uploaded: number, total: number): string {
  const allUploaded = total > 0 && uploaded === total
  if (allUploaded) {
    return "All documents uploaded"
  }
  if (total > 0) {
    const pending = total - uploaded
    return `${pending} document${pending !== 1 ? "s" : ""} pending`
  }
  return "No documents defined"
}

function getUploadVariant(uploaded: number, total: number): "success" | "warning" | "default" {
  if (total > 0 && uploaded === total) {
    return "success"
  }
  if (total > 0) {
    return "warning"
  }
  return "default"
}

function useQualityCheckProgress() {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const checksByAssetId = useDataQualityStore((state) => state.checksByAssetId)
  const initializeAsset = useDataQualityStore((state) => state.initializeAsset)

  useEffect(() => {
    if (selectedAssetId) {
      initializeAsset(selectedAssetId)
    }
  }, [selectedAssetId, initializeAsset])

  if (!selectedAssetId) {
    return { done: 0, total: 0 }
  }

  const checks = checksByAssetId[selectedAssetId] ?? []
  const total = checks.length
  const done = checks.filter((c) => isQualityCheckDone(c)).length

  return { done, total }
}

function getQualityCheckDescription(done: number, total: number): string {
  if (total === 0) {
    return "No checks defined"
  }
  const allDone = done === total
  if (allDone) {
    return "All checks completed"
  }
  const pending = total - done
  return `${pending} check${pending !== 1 ? "s" : ""} pending`
}

function getQualityCheckVariant(done: number, total: number): "success" | "warning" | "default" {
  if (total > 0 && done === total) {
    return "success"
  }
  if (total > 0 && done > 0) {
    return "warning"
  }
  if (total > 0) {
    return "warning"
  }
  return "default"
}

function getFindingsStatusLabel(status: FindingsStatus): string {
  switch (status) {
    case "finalized":
      return "Finalized"
    case "generated":
      return "Generated"
    default:
      return "Not Started"
  }
}

function getFindingsStatusDescription(status: FindingsStatus): string {
  switch (status) {
    case "finalized":
      return "Findings adopted"
    case "generated":
      return "Awaiting review"
    default:
      return "Generate AI analysis"
  }
}

function getFindingsStatusVariant(status: FindingsStatus): "success" | "warning" | "error" {
  switch (status) {
    case "finalized":
      return "success"
    case "generated":
      return "warning"
    default:
      return "error"
  }
}

export function ProgressSummary({ readonly = false }: ProgressSummaryProps) {
  const { uploaded, total: uploadTotal } = useDataUploadProgress()
  const { done: checksDone, total: checksTotal } = useQualityCheckProgress()
  const findingsStatus = useAiFindingsStore((state) => state.getStatus())

  return (
    <div className={cn("flex gap-3 p-4", readonly && "opacity-80")}>
      <ProgressCard
        description={getUploadDescription(uploaded, uploadTotal)}
        icon={<FileText className="h-5 w-5" />}
        label="Data Uploaded"
        value={`${uploaded}/${uploadTotal}`}
        variant={getUploadVariant(uploaded, uploadTotal)}
      />
      <ProgressCard
        description={getQualityCheckDescription(checksDone, checksTotal)}
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Journal Checks"
        value={`${checksDone}/${checksTotal}`}
        variant={getQualityCheckVariant(checksDone, checksTotal)}
      />
      <ProgressCard
        description={getFindingsStatusDescription(findingsStatus)}
        icon={<Sparkles className="h-5 w-5" />}
        label="Summary & Key Findings"
        value={getFindingsStatusLabel(findingsStatus)}
        variant={getFindingsStatusVariant(findingsStatus)}
      />
    </div>
  )
}
