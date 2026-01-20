import { cn } from "@/shared/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  variant?: "default" | "blue" | "warning" | "destructive"
  className?: string
}

const valueStyles = {
  default: "text-foreground",
  blue: "text-info",
  warning: "text-warning",
  destructive: "text-destructive",
}

export function MetricCard({
  label,
  value,
  subtext,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-lg border bg-card px-4 py-3", className)}>
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("font-semibold text-2xl tabular-nums", valueStyles[variant])}>
          {value}
        </span>
        {subtext && <span className="text-muted-foreground text-xs">{subtext}</span>}
      </div>
    </div>
  )
}
