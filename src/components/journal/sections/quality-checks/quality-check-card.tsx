// Quality Check Card Component
// Displays a quality check in the list

import { Check, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { QualityCheck } from "@/store/data-quality-store"
import { isQualityCheckDone } from "./utils"

interface QualityCheckCardProps {
  check: QualityCheck
  isSelected: boolean
  onClick: () => void
  onAcknowledge?: () => void
  onUnacknowledge?: () => void
  isLoading?: boolean
  readonly?: boolean
}

function getAcknowledgeButtonIcon(isLoading: boolean | undefined, canAcknowledge: boolean) {
  if (isLoading) {
    return <RotateCcw className="h-3.5 w-3.5 animate-spin" />
  }
  if (canAcknowledge) {
    return <Check className="h-3.5 w-3.5" />
  }
  return <RotateCcw className="h-3.5 w-3.5" />
}

function getLeftBorderColor(check: QualityCheck): string {
  const isManualCheck = check.type === "Manual Check"
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

function getTypeBadge(check: QualityCheck) {
  const isManualCheck = check.type === "Manual Check"
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

export function QualityCheckCard({
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
  const canAcknowledge = !isManualCheck && check.systemResult === "Pass" && !check.acknowledged
  const canUnacknowledge = !isManualCheck && check.systemResult === "Pass" && check.acknowledged

  return (
    <button
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-2 rounded-md border border-border/40 border-l-4 px-2.5 py-3 text-left transition-colors",
        isSelected ? "border-border/60 bg-muted" : "hover:bg-muted/50",
        getLeftBorderColor(check)
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
          {getTypeBadge(check)}
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
