import { Check, FileText, Loader2, Send, Upload, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssetDetail, AssetStatus, EbsStatus, ValidationStatus } from "@/types/journal"
import { ASSET_STATUS_LABELS, ASSET_STATUSES } from "@/types/journal"

interface StatusFlowProps {
  asset: AssetDetail
  className?: string
}

// Step configuration with icons - simplified professional colors
const STEP_ICONS: Record<AssetStatus, typeof FileText> = {
  GENERATION: FileText,
  PREPARATION: FileText,
  SUBMISSION: Send,
  REVIEW: UserCheck,
  EBS_UPLOAD: Upload,
}

type StepState = "completed" | "active" | "pending" | "loading"

function getStepState(
  stepStatus: AssetStatus,
  currentStatus: AssetStatus,
  validationStatus: ValidationStatus,
  ebsStatus: EbsStatus
): StepState {
  const stepIndex = ASSET_STATUSES.indexOf(stepStatus)
  const currentIndex = ASSET_STATUSES.indexOf(currentStatus)

  // Generation is always completed for demo
  if (stepStatus === "GENERATION") {
    return "completed"
  }

  if (stepIndex < currentIndex) {
    return "completed"
  }

  if (stepIndex === currentIndex) {
    // Check for loading states
    if (stepStatus === "PREPARATION" && validationStatus === "VALIDATING") {
      return "loading"
    }
    if (stepStatus === "EBS_UPLOAD") {
      if (ebsStatus === "UPLOADING") {
        return "loading"
      }
      if (ebsStatus === "SUCCESS") {
        return "completed"
      }
    }
    return "active"
  }

  return "pending"
}

function StepIcon({ state, Icon }: { state: StepState; Icon: typeof FileText }) {
  if (state === "completed") {
    return <Check className="h-3.5 w-3.5" />
  }
  if (state === "loading") {
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />
  }
  return <Icon className="h-3.5 w-3.5" />
}

export function StatusFlow({ asset, className }: StatusFlowProps) {
  const { status, validationStatus, ebsStatus } = asset

  return (
    <div className={cn("w-full", className)}>
      {/* Compact Steps container - evenly distributed */}
      <div className="flex items-center">
        {ASSET_STATUSES.map((stepStatus, index) => {
          const Icon = STEP_ICONS[stepStatus]
          const state = getStepState(stepStatus, status, validationStatus, ebsStatus)
          const isLast = index === ASSET_STATUSES.length - 1

          return (
            <div
              className={cn("flex items-center", isLast ? "flex-shrink-0" : "flex-1")}
              key={stepStatus}
            >
              {/* Step node - compact size with professional colors */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300",
                    state === "completed" &&
                      "scale-100 border-primary bg-primary text-primary-foreground",
                    state === "active" &&
                      "border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_hsl(var(--color-primary)/0.15)]",
                    state === "loading" && "border-primary bg-primary/10 text-primary",
                    state === "pending" &&
                      "scale-95 border-muted-foreground/30 bg-muted text-muted-foreground/50"
                  )}
                >
                  <StepIcon Icon={Icon} state={state} />
                </div>
                <span
                  className={cn(
                    "mt-1 font-medium text-[10px] transition-colors duration-300",
                    (state === "completed" || state === "active" || state === "loading") &&
                      "text-foreground",
                    state === "pending" && "text-muted-foreground/60"
                  )}
                >
                  {ASSET_STATUS_LABELS[stepStatus]}
                </span>
              </div>

              {/* Connector line - only if not last */}
              {!isLast && (
                <div className="mx-2 h-0.5 flex-1">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      state === "completed" ? "bg-primary/40" : "bg-muted-foreground/20"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
