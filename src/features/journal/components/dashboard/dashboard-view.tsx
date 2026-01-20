import { useCallback, useEffect, useMemo, useState } from "react"
import { calculateMetrics, filterAssets, generateMockAssets } from "../../data/mock-dashboard-data"
import { useDashboardStore } from "../../state/dashboard-store"
import { DashboardFilterRow } from "./dashboard-filter-row"
import { DashboardMetricsRow } from "./dashboard-metrics-row"
import { DashboardTable } from "./dashboard-table"

export function DashboardView() {
  const [isLoading, setIsLoading] = useState(true)
  const { filters } = useDashboardStore()

  // Generate assets based on the selected period
  const periodAssets = useMemo(() => generateMockAssets(28, filters.period), [filters.period])

  // Filter assets based on current filters
  const filteredAssets = useMemo(
    () =>
      filterAssets(periodAssets, {
        teamProjects: filters.teamProjects,
        searchQuery: filters.searchQuery,
        columnFilters: filters.columnFilters,
      }),
    [periodAssets, filters.teamProjects, filters.searchQuery, filters.columnFilters]
  )

  // Calculate metrics from filtered assets
  const metrics = useMemo(() => calculateMetrics(filteredAssets), [filteredAssets])

  // Simulate loading delay when view is first mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 400)
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DashboardFilterRow onRefresh={handleRefresh} />
      <DashboardMetricsRow metrics={metrics} />
      <DashboardTable data={filteredAssets} isLoading={isLoading} />
    </div>
  )
}
