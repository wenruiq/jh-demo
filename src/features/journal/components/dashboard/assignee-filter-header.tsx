import { ListFilter, Network, Search, User, Users, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type AssigneeFilterSelection,
  type AssigneeFilterType,
  useDashboardStore,
} from "../../state/dashboard-store"
import type { AssigneeFilter } from "../../types/dashboard"

interface AssigneeFilterHeaderProps {
  label: string
  column: "preparer" | "reviewer"
  filter: AssigneeFilter
  availableUsers: AssigneeFilterSelection[]
  availableTeams: AssigneeFilterSelection[]
}

export function AssigneeFilterHeader({
  label,
  column,
  filter,
  availableUsers,
  availableTeams,
}: AssigneeFilterHeaderProps) {
  const [open, setOpen] = useState(false)
  // Use local state to prevent popover re-render issues
  const [localSearch, setLocalSearch] = useState("")
  const [localFilterType, setLocalFilterType] = useState<AssigneeFilterType>("all")
  const [localSelections, setLocalSelections] = useState<AssigneeFilterSelection[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  const { setAssigneeFilterType, setAssigneeSelections, setAssigneeSearchQuery } =
    useDashboardStore()

  // All options combined
  const allOptions = useMemo(
    () => [...availableUsers, ...availableTeams],
    [availableUsers, availableTeams]
  )

  // Initialize local state from store when popover opens
  useEffect(() => {
    if (open) {
      setLocalSearch(filter.searchQuery)
      setLocalFilterType(filter.filterType)
      setLocalSelections(filter.selections)
    }
  }, [open, filter.searchQuery, filter.filterType, filter.selections])

  // Check if local state differs from store (has pending changes)
  const hasLocalChanges = useMemo(() => {
    if (localFilterType !== filter.filterType) {
      return true
    }
    if (localSearch !== filter.searchQuery) {
      return true
    }
    if (localSelections.length !== filter.selections.length) {
      return true
    }
    const storeIds = new Set(filter.selections.map((s) => s.id))
    return localSelections.some((s) => !storeIds.has(s.id))
  }, [localFilterType, localSearch, localSelections, filter])

  const hasLocalFilters = localSelections.length > 0 || localFilterType !== "all"
  const hasStoreFilters = filter.selections.length > 0 || filter.filterType !== "all"

  // Filter options based on search and type filter
  const filteredOptions = useMemo(() => {
    let options = allOptions

    // Filter by type
    if (localFilterType === "users") {
      options = options.filter((o) => o.type === "user")
    } else if (localFilterType === "teams") {
      options = options.filter((o) => o.type === "team")
    }

    // Filter by search query
    if (localSearch) {
      const query = localSearch.toLowerCase()
      options = options.filter((o) => o.label.toLowerCase().includes(query))
    }

    // Exclude already selected
    const selectedIds = new Set(localSelections.map((s) => s.id))
    options = options.filter((o) => !selectedIds.has(o.id))

    return options
  }, [allOptions, localFilterType, localSearch, localSelections])

  // Reset local form to defaults (not store state)
  const handleClear = () => {
    setLocalSearch("")
    setLocalFilterType("all")
    setLocalSelections([])
  }

  const handleTypeChange = (value: string) => {
    if (value) {
      setLocalFilterType(value as AssigneeFilterType)
    }
  }

  const handleSelect = (option: AssigneeFilterSelection) => {
    if (!localSelections.some((s) => s.id === option.id)) {
      setLocalSelections([...localSelections, option])
    }
  }

  const handleRemove = (id: string) => {
    setLocalSelections(localSelections.filter((s) => s.id !== id))
  }

  // Apply local state to store
  const handleApply = () => {
    setAssigneeFilterType(column, localFilterType)
    setAssigneeSearchQuery(column, localSearch)
    setAssigneeSelections(column, localSelections)
    setOpen(false)
  }

  // Cancel and close without applying
  const handleCancel = () => {
    setOpen(false)
  }

  // Display count based on actual store state for the badge
  const displayCount = filter.selections.length

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
            className={`h-3 w-3 ${hasStoreFilters ? "text-primary" : "text-muted-foreground/60"}`}
          />
          {displayCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0"
        onClick={(e) => e.stopPropagation()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onKeyDown={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
      >
        {/* Header */}
        <div className="border-b px-3 py-2">
          <span className="font-medium text-sm">Filter {label}</span>
        </div>

        {/* Type Filter Chips */}
        <div className="border-b px-3 py-2">
          <ToggleGroup
            className="justify-start"
            onValueChange={handleTypeChange}
            size="sm"
            type="single"
            value={localFilterType}
          >
            <ToggleGroupItem className="h-7 px-2 text-xs" value="all">
              All
            </ToggleGroupItem>
            <ToggleGroupItem className="h-7 gap-1 px-2 text-xs" value="users">
              <User className="h-3 w-3" />
              Users ({availableUsers.length})
            </ToggleGroupItem>
            <ToggleGroupItem className="h-7 gap-1 px-2 text-xs" value="teams">
              <Network className="h-3 w-3" />
              Teams ({availableTeams.length})
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Search */}
        <div className="border-b px-3 py-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-7 text-sm"
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search..."
              ref={inputRef}
              value={localSearch}
            />
          </div>
        </div>

        {/* Selected Items */}
        {localSelections.length > 0 && (
          <div className="border-b px-3 py-2">
            <div className="mb-1 text-muted-foreground text-xs">
              Selected ({localSelections.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {localSelections.map((selection) => (
                <Badge
                  className="gap-1 pr-1"
                  key={selection.id}
                  variant={selection.type === "team" ? "secondary" : "outline"}
                >
                  {selection.type === "team" ? (
                    <Network className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="max-w-[120px] truncate text-xs">{selection.label}</span>
                  <button
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                    onClick={() => handleRemove(selection.id)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Options */}
        <div className="max-h-48 overflow-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground text-sm">
              {localSearch ? "No matches found" : "No options available"}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
                key={option.id}
                onClick={() => handleSelect(option)}
                type="button"
              >
                {option.type === "team" ? (
                  <Network className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1 truncate text-sm">{option.label}</span>
                {option.type === "team" && <Users className="h-3 w-3 text-muted-foreground" />}
              </button>
            ))
          )}
        </div>

        {/* Footer with Clear/Cancel/Apply */}
        <div className="flex items-center justify-between border-t px-3 py-2">
          <Button
            className="h-7 text-xs"
            disabled={!hasLocalFilters}
            onClick={handleClear}
            size="sm"
            variant="ghost"
          >
            Clear
          </Button>
          <div className="flex items-center gap-2">
            <Button className="h-7 text-xs" onClick={handleCancel} size="sm" variant="ghost">
              Cancel
            </Button>
            <Button
              className="h-7 text-xs"
              disabled={!(hasLocalChanges || hasLocalFilters)}
              onClick={handleApply}
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
