import { Download, RefreshCw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardStore } from "../../state/dashboard-store"
import type { ColumnFilters } from "../../types/dashboard"
import { TeamProjectSelect } from "./team-project-select"

interface DashboardFilterRowProps {
  onRefresh: () => void
}

const DEFAULT_PERIOD = "2025-12"

// Check if column filters have any active values
function hasActiveColumnFilters(columnFilters: ColumnFilters): boolean {
  return (
    columnFilters.entity.length > 0 ||
    columnFilters.type.length > 0 ||
    columnFilters.status.length > 0 ||
    columnFilters.progress.length > 0 ||
    columnFilters.frequency.length > 0 ||
    columnFilters.coverSheetCompleted !== null ||
    columnFilters.isSystem !== null ||
    columnFilters.isManual !== null ||
    columnFilters.adjustment !== null ||
    columnFilters.reverse !== null
  )
}

export function DashboardFilterRow({ onRefresh }: DashboardFilterRowProps) {
  const { filters, sorting, setTeamProjects, setPeriod, setSearchQuery, resetFilters } =
    useDashboardStore()

  // Check if any filters or sorting are active (differ from defaults)
  const hasActiveFiltersOrSort =
    filters.teamProjects.length > 0 ||
    filters.period !== DEFAULT_PERIOD ||
    filters.searchQuery.length > 0 ||
    hasActiveColumnFilters(filters.columnFilters) ||
    sorting.length > 0

  return (
    <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="w-64">
          <TeamProjectSelect onChange={setTeamProjects} value={filters.teamProjects} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Period</span>
          <Select onValueChange={setPeriod} value={filters.period}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-12">2025-12</SelectItem>
              <SelectItem value="2025-11">2025-11</SelectItem>
              <SelectItem value="2025-10">2025-10</SelectItem>
              <SelectItem value="2025-09">2025-09</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 w-48 pl-8"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journals..."
            value={filters.searchQuery}
          />
        </div>
        {hasActiveFiltersOrSort && (
          <Button
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={resetFilters}
            size="sm"
            variant="ghost"
          >
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export Data
        </Button>
        <Button onClick={onRefresh} size="icon" title="Refresh table" variant="ghost">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
