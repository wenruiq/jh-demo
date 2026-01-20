import { useEffect, useId, useState } from "react"

interface DonutChartProps {
  value: number
  label: string
  size?: number
  subtext?: string // Optional subtext shown below the label (e.g., "12 / 15 journals")
}

export function DonutChart({ value, label, size = 80, subtext }: DonutChartProps) {
  const id = useId()
  const [mounted, setMounted] = useState(false)

  // Trigger animation after mount
  useEffect(() => {
    // Use requestAnimationFrame to ensure CSS transition triggers
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const strokeWidth = size * 0.15
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const animatedValue = mounted ? value : 0
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          aria-hidden="true"
          className="-rotate-90"
          height={size}
          style={{ overflow: "visible" }}
          width={size}
        >
          {/* Track (background circle) */}
          <circle
            className="text-muted-foreground/20"
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            className="text-success transition-[stroke-dashoffset] duration-700 ease-out"
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={`url(#${id})`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
          <defs>
            <linearGradient id={id}>
              <stop offset="0%" stopColor="var(--color-success, #22c55e)" />
              <stop offset="100%" stopColor="var(--color-success, #22c55e)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-semibold text-sm">{value}%</span>
        </div>
      </div>
      <span className="text-muted-foreground text-xs">{label}</span>
      {/* Always reserve space for subtext to maintain consistent height across charts */}
      <span className={`text-[10px] ${subtext ? "text-muted-foreground" : "invisible"}`}>
        {subtext || "\u00A0"}
      </span>
    </div>
  )
}
