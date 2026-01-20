import type { DashboardMetrics } from "../../types/dashboard"
import { DonutChart } from "./donut-chart"
import { MetricCard } from "./metric-card"

interface DashboardMetricsRowProps {
  metrics: DashboardMetrics
}

export function DashboardMetricsRow({ metrics }: DashboardMetricsRowProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-8">
        <MetricCard
          label="Completion"
          subtext={`(${metrics.completed}/${metrics.total} journals)`}
          value={`${metrics.completionPercent}%`}
        />
        <MetricCard label="In Progress" value={metrics.inProgress} variant="blue" />
        <MetricCard label="Due Soon" value={metrics.dueSoon} variant="warning" />
        <MetricCard label="Overdue" value={metrics.overdue} variant="destructive" />
      </div>
      <div className="flex items-center gap-6">
        <DonutChart
          label="On Time"
          subtext={`(${metrics.onTimeCount}/${metrics.completed} journals)`}
          value={metrics.onTimePercent}
        />
        <DonutChart label="Automation" value={metrics.automationPercent} />
        <DonutChart label="Cover Sheet" value={metrics.coverSheetPercent} />
      </div>
    </div>
  )
}
