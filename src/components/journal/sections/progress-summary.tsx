import { CheckCircle2, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ProgressSummaryProps {
  readonly?: boolean
}

export function ProgressSummary({ readonly = false }: ProgressSummaryProps) {
  return (
    <div className={cn("flex gap-3 p-4", readonly && "opacity-80")}>
      <ProgressCard
        description="All documents attached"
        icon={<FileText className="h-5 w-5" />}
        label="Documents"
        value="5/5"
        variant="success"
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
