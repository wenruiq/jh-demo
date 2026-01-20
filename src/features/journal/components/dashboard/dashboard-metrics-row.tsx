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
          subtext={`(${metrics.completed}/${metrics.total})`}
          value={`${metrics.completionPercent}%`}
          variant="success"
        />
        <MetricCard label="In Progress" value={metrics.inProgress} variant="blue" />
        <MetricCard label="Due Soon" value={metrics.dueSoon} variant="warning" />
        <MetricCard label="Overdue" value={metrics.overdue} variant="destructive" />
      </div>
      <div className="flex items-center gap-6">
        <DonutChart
          label="On Time"
          subtext={`(${metrics.onTimeCount}/${metrics.completed})`}
          value={metrics.onTimePercent}
        />
        <DonutChart
          label="Cover Sheet"
          subtext={`(${metrics.coverSheetCount}/${metrics.total})`}
          value={metrics.coverSheetPercent}
        />
        <DonutChart
          label="Automation"
          subtext={`(${metrics.automationCount}/${metrics.total})`}
          value={metrics.automationPercent}
        />
      </div>
    </div>
  )
}
