import { CheckCircle2, Clock, FileText } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { useDataUploadStore } from "@/store/data-upload-store"
import { useJournalStore } from "@/store/journal-store"

interface ProgressCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  description?: string
  variant?: "default" | "success" | "warning"
}

function ProgressCard({ icon, label, value, description, variant = "default" }: ProgressCardProps) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          variant === "success" && "bg-success-muted text-success",
          variant === "warning" && "bg-warning-muted text-warning",
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
  // Subscribe to the entire uploadsByAssetId to detect changes
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)
  const initializeAsset = useDataUploadStore((state) => state.initializeAsset)

  // Initialize asset uploads on mount/asset change
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

export function ProgressSummary({ readonly = false }: ProgressSummaryProps) {
  const { uploaded, total } = useDataUploadProgress()

  return (
    <div className={cn("flex gap-3 p-4", readonly && "opacity-80")}>
      <ProgressCard
        description={getUploadDescription(uploaded, total)}
        icon={<FileText className="h-5 w-5" />}
        label="Data Uploaded"
        value={`${uploaded}/${total}`}
        variant={getUploadVariant(uploaded, total)}
      />
      <ProgressCard
        description="2 checks pending"
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Quality Checks"
        value="8/10"
        variant="warning"
      />
      <ProgressCard
        description="On track for deadline"
        icon={<Clock className="h-5 w-5" />}
        label="Time Remaining"
        value="2 days"
        variant="default"
      />
    </div>
  )
}
