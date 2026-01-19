import { AlertCircle, CheckCircle2, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EbsStatus } from "@/features/journal/types"
import { cn } from "@/shared/lib/utils"

interface EbsUploadActionsProps {
  ebsStatus: EbsStatus
  onReverse: () => void
  isReversing: boolean
}

export function EbsUploadActions({ ebsStatus, onReverse, isReversing }: EbsUploadActionsProps) {
  const isUploading = ebsStatus === "UPLOADING"
  const isSuccess = ebsStatus === "SUCCESS"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
          isSuccess && "bg-success-muted",
          isUploading && "bg-info-muted",
          !(isUploading || isSuccess) && "bg-muted text-muted-foreground"
        )}
      >
        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-info" />}
        {isSuccess && <CheckCircle2 className="h-4 w-4 text-success" />}
        {!(isUploading || isSuccess) && <AlertCircle className="h-4 w-4" />}
        <span
          className={cn("font-medium", isSuccess && "text-success", isUploading && "text-info")}
        >
          {isUploading && "Uploading to EBS..."}
          {isSuccess && "EBS Upload Complete"}
          {!(isUploading || isSuccess) && "EBS Upload Pending"}
        </span>
      </div>

      {isSuccess && (
        <Button
          className="h-8 gap-1.5 px-3 text-xs"
          disabled={isReversing}
          onClick={onReverse}
          size="sm"
          variant="outline"
        >
          {isReversing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5" />
          )}
          {isReversing ? "Reversing..." : "Reverse (Demo)"}
        </Button>
      )}
    </div>
  )
}
