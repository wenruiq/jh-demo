import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSearch,
  ListFilter,
  Minus,
  X,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ASSET_STATUSES,
  ASSET_TYPES,
  ENTITIES,
  extractUniqueAssignees,
  FREQUENCY_OPTIONS,
} from "../../data/mock-dashboard-data"
import { useDashboardStore } from "../../state/dashboard-store"
import type { AssetStatus, AssetType } from "../../types"
import {
  type DashboardAsset,
  type Frequency,
  PROGRESS_STATUSES,
  type ProgressStatus,
} from "../../types/dashboard"
import { AssigneeCell } from "./assignee-cell"
import { AssigneeFilterHeader } from "./assignee-filter-header"

// Status badge variant mapping - blue for all active, secondary for uploaded
const STATUS_VARIANTS: Record<AssetStatus, "blue" | "secondary"> = {
  GENERATION: "blue",
  PREPARATION: "blue",
  SUBMISSION: "blue",
  REVIEW: "blue",
  EBS_UPLOAD: "secondary",
}

const STATUS_LABELS: Record<AssetStatus, string> = {
  GENERATION: "Generation",
  PREPARATION: "Preparation",
  SUBMISSION: "Submission",
  REVIEW: "Review",
  EBS_UPLOAD: "Uploaded",
}

// Progress badge variant mapping
const PROGRESS_VARIANTS: Record<
  ProgressStatus,
  "success" | "blue" | "warning" | "destructive-outline"
> = {
  completed: "success",
  in_progress: "blue",
  due_soon: "warning",
  overdue: "destructive-outline",
}

const PROGRESS_LABELS: Record<ProgressStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  due_soon: "Due Soon",
  overdue: "Overdue",
}

// Frequency labels
const FREQUENCY_LABELS: Record<Frequency, string> = {
  "one-time": "One-time",
  quarterly: "Quarterly",
  monthly: "Monthly",
}

// Check/uncheck cell component
function CheckCell({ checked }: { checked: boolean }) {
  return checked ? (
    <Check className="h-4 w-4 text-success" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" />
  )
}

// Multi-select filter popover for array filters
function MultiSelectFilterHeader<T extends string>({
  label,
  options,
  selectedValues,
  onSelectionChange,
  renderLabel,
}: {
  label: string
  options: readonly T[]
  selectedValues: T[]
  onSelectionChange: (values: T[]) => void
  renderLabel?: (value: T) => string
}) {
  const [open, setOpen] = useState(false)
  const hasFilters = selectedValues.length > 0

  const toggleValue = (value: T) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange([])
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
          type="button"
        >
          <span>{label}</span>
          <ListFilter
            className={`h-3 w-3 ${hasFilters ? "text-primary" : "text-muted-foreground/60"}`}
          />
          {hasFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {selectedValues.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-2" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-sm">Filter {label}</span>
          {hasFilters && (
            <Button onClick={clearFilter} size="sm" variant="ghost">
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-48 space-y-1 overflow-auto">
          {options.map((option) => (
            <button
              className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              key={option}
              onClick={() => toggleValue(option)}
              type="button"
            >
              <Checkbox
                checked={selectedValues.includes(option)}
                onCheckedChange={() => toggleValue(option)}
              />
              <span className="text-sm">{renderLabel ? renderLabel(option) : option}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Boolean filter popover
function BooleanFilterHeader({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}) {
  const [open, setOpen] = useState(false)
  const hasFilter = value !== null

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
          type="button"
        >
          <span>{label}</span>
          <ListFilter
            className={`h-3 w-3 ${hasFilter ? "text-primary" : "text-muted-foreground/60"}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-36 p-2" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-sm">Filter</span>
          {hasFilter && (
            <Button onClick={clearFilter} size="sm" variant="ghost">
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <button
            className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
            onClick={() => onChange(true)}
            type="button"
          >
            <Checkbox checked={value === true} onCheckedChange={() => onChange(true)} />
            <span className="text-sm">Yes</span>
          </button>
          <button
            className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
            onClick={() => onChange(false)}
            type="button"
          >
            <Checkbox checked={value === false} onCheckedChange={() => onChange(false)} />
            <span className="text-sm">No</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Format date with time (concise: "Feb 9, 14:30")
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${month} ${day}, ${hours}:${minutes}`
}

// Hook to create columns with filter functionality
function useFilterableColumns(
  availableUsers: Array<{ type: "user"; id: string; label: string }>,
  availableTeams: Array<{ type: "team"; id: string; label: string }>
): ColumnDef<DashboardAsset>[] {
  const {
    filters,
    setEntityFilter,
    setTypeFilter,
    setStatusFilter,
    setProgressFilter,
    setFrequencyFilter,
    setBooleanFilter,
  } = useDashboardStore()
  const cf = filters.columnFilters

  return [
    {
      accessorKey: "entity",
      header: () => (
        <MultiSelectFilterHeader
          label="Entity"
          onSelectionChange={setEntityFilter}
          options={ENTITIES}
          selectedValues={cf.entity}
        />
      ),
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.entity}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="cursor-pointer font-medium text-primary text-sm hover:underline">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => <span className="text-sm">{formatDateTime(row.original.dueDate)}</span>,
    },
    {
      accessorKey: "progress",
      header: () => (
        <MultiSelectFilterHeader
          label="Progress"
          onSelectionChange={setProgressFilter}
          options={PROGRESS_STATUSES}
          renderLabel={(v) => PROGRESS_LABELS[v]}
          selectedValues={cf.progress}
        />
      ),
      cell: ({ row }) => (
        <Badge variant={PROGRESS_VARIANTS[row.original.progress]}>
          {PROGRESS_LABELS[row.original.progress]}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <MultiSelectFilterHeader
          label="Status"
          onSelectionChange={(values) => setStatusFilter(values as AssetStatus[])}
          options={ASSET_STATUSES}
          renderLabel={(v) => STATUS_LABELS[v]}
          selectedValues={cf.status}
        />
      ),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status]}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: () => (
        <MultiSelectFilterHeader
          label="Type"
          onSelectionChange={(values) => setTypeFilter(values as AssetType[])}
          options={ASSET_TYPES}
          selectedValues={cf.type}
        />
      ),
      cell: ({ row }) => <Badge variant="neutral">{row.original.type}</Badge>,
    },
    {
      accessorKey: "frequency",
      header: () => (
        <MultiSelectFilterHeader
          label="Frequency"
          onSelectionChange={(values) => setFrequencyFilter(values as Frequency[])}
          options={FREQUENCY_OPTIONS}
          renderLabel={(v) => FREQUENCY_LABELS[v]}
          selectedValues={cf.frequency}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{FREQUENCY_LABELS[row.original.frequency]}</span>
      ),
    },
    {
      accessorKey: "preparer",
      header: () => (
        <AssigneeFilterHeader
          availableTeams={availableTeams}
          availableUsers={availableUsers}
          column="preparer"
          filter={cf.preparer}
          label="Preparer"
        />
      ),
      cell: ({ row }) => <AssigneeCell assignee={row.original.preparer} />,
    },
    {
      accessorKey: "reviewer",
      header: () => (
        <AssigneeFilterHeader
          availableTeams={availableTeams}
          availableUsers={availableUsers}
          column="reviewer"
          filter={cf.reviewer}
          label="Reviewer"
        />
      ),
      cell: ({ row }) => <AssigneeCell assignee={row.original.reviewer} />,
    },
    {
      accessorKey: "coverSheetCompleted",
      header: () => (
        <BooleanFilterHeader
          label="Cover Sheet"
          onChange={(v) => setBooleanFilter("coverSheetCompleted", v)}
          value={cf.coverSheetCompleted}
        />
      ),
      cell: ({ row }) => <CheckCell checked={row.original.coverSheetCompleted} />,
    },
    {
      accessorKey: "isSystem",
      header: () => (
        <BooleanFilterHeader
          label="System"
          onChange={(v) => setBooleanFilter("isSystem", v)}
          value={cf.isSystem}
        />
      ),
      cell: ({ row }) => <CheckCell checked={row.original.isSystem} />,
    },
    {
      accessorKey: "isManual",
      header: () => (
        <BooleanFilterHeader
          label="Manual"
          onChange={(v) => setBooleanFilter("isManual", v)}
          value={cf.isManual}
        />
      ),
      cell: ({ row }) => <CheckCell checked={row.original.isManual} />,
    },
    {
      accessorKey: "adjustment",
      header: () => (
        <BooleanFilterHeader
          label="Adjustment"
          onChange={(v) => setBooleanFilter("adjustment", v)}
          value={cf.adjustment}
        />
      ),
      cell: ({ row }) => <CheckCell checked={row.original.adjustment} />,
    },
    {
      accessorKey: "reverse",
      header: () => (
        <BooleanFilterHeader
          label="Reverse"
          onChange={(v) => setBooleanFilter("reverse", v)}
          value={cf.reverse}
        />
      ),
      cell: ({ row }) => <CheckCell checked={row.original.reverse} />,
    },
  ]
}

interface DashboardTableProps {
  data: DashboardAsset[]
  isLoading?: boolean
}

export function DashboardTable({ data, isLoading }: DashboardTableProps) {
  const { sorting, setSorting } = useDashboardStore()

  // Extract unique users and teams from the actual data for filter options
  const { users: availableUsers, teams: availableTeams } = extractUniqueAssignees(data)

  const columns = useFilterableColumns(availableUsers, availableTeams)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="cursor-pointer whitespace-nowrap border-b px-3 py-2 text-left font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/80"
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="py-16" colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-muted p-3">
                      <FileSearch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No results found</p>
                    <p className="mt-1 max-w-sm text-muted-foreground text-sm">
                      No journals match your current filters. Try adjusting your search or filter
                      criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr className="border-b transition-colors hover:bg-muted/30" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="whitespace-nowrap px-3 py-2.5" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {data.length === 0 ? (
            <span>No entries</span>
          ) : (
            <span>
              Showing{" "}
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}{" "}
              of {data.length} entries
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows per page</span>
            <Select
              onValueChange={(value) => table.setPageSize(Number(value))}
              value={String(table.getState().pagination.pageSize)}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
              size="icon"
              variant="ghost"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              size="icon"
              variant="ghost"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
