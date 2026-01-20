import type { SortingState } from "@tanstack/react-table"
import { useEffect, useRef } from "react"
import { useDashboardStore, VIEW_MODES, type ViewMode } from "../state/dashboard-store"
import type { AssetStatus, AssetType } from "../types"
import type {
  ColumnFilters,
  DashboardFilters,
  Frequency,
  ProgressStatus,
  TeamProject,
} from "../types/dashboard"

// URL parameter keys
const PARAM = {
  VIEW: "view",
  SEARCH: "q",
  PERIOD: "period",
  TEAMS: "teams",
  SORT: "sort",
  PAGE: "page",
  PAGE_SIZE: "pageSize",
  ENTITY: "entity",
  TYPE: "type",
  STATUS: "status",
  PROGRESS: "progress",
  FREQUENCY: "frequency",
  PREPARER: "preparer",
  PREPARER_TYPE: "preparerType",
  REVIEWER: "reviewer",
  REVIEWER_TYPE: "reviewerType",
  COVER_SHEET: "coverSheet",
  SYSTEM: "system",
  MANUAL: "manual",
  ADJUSTMENT: "adjustment",
  REVERSE: "reverse",
} as const

// Parse view mode from URL
function parseViewMode(params: URLSearchParams): ViewMode | undefined {
  const view = params.get(PARAM.VIEW)
  if (view && VIEW_MODES.includes(view as ViewMode)) {
    return view as ViewMode
  }
  return undefined
}

// Parse sorting from URL
function parseSorting(params: URLSearchParams): SortingState | undefined {
  const sort = params.get(PARAM.SORT)
  if (sort) {
    return sort.split(",").map((s) => {
      const [id, direction] = s.split(":")
      return { id, desc: direction === "desc" }
    })
  }
  return undefined
}

// Parse pagination from URL
function parsePagination(params: URLSearchParams): { page?: number; pageSize?: number } {
  const page = params.get(PARAM.PAGE)
  const pageSize = params.get(PARAM.PAGE_SIZE)
  return {
    page: page ? Number.parseInt(page, 10) : undefined,
    pageSize: pageSize ? Number.parseInt(pageSize, 10) : undefined,
  }
}

// Parse assignee filter from URL
// Format: "u:Wei Chen,t:Singapore/EC-Logistic" where u: is user, t: is team
function parseAssigneeFilter(
  selectionsParam: string | null,
  typeParam: string | null
): Partial<{
  filterType: "all" | "users" | "teams"
  selections: Array<{ type: "user" | "team"; id: string; label: string }>
  searchQuery: string
}> {
  const result: Partial<{
    filterType: "all" | "users" | "teams"
    selections: Array<{ type: "user" | "team"; id: string; label: string }>
    searchQuery: string
  }> = {}

  if (typeParam && ["all", "users", "teams"].includes(typeParam)) {
    result.filterType = typeParam as "all" | "users" | "teams"
  }

  if (selectionsParam) {
    const selections: Array<{ type: "user" | "team"; id: string; label: string }> = []
    for (const part of selectionsParam.split(",")) {
      if (part.startsWith("u:")) {
        const label = part.slice(2)
        selections.push({ type: "user", id: `user-${label}`, label })
      } else if (part.startsWith("t:")) {
        const label = part.slice(2)
        // For teams, the id is the team/project key
        selections.push({ type: "team", id: label, label: label.replace("/", " / ") })
      }
    }
    if (selections.length > 0) {
      result.selections = selections
    }
  }

  return result
}

// Serialize assignee filter selections for URL
function serializeAssigneeSelections(
  selections: Array<{ type: "user" | "team"; id: string; label: string }>
): string {
  return selections
    .map((s) => {
      if (s.type === "user") {
        return `u:${s.label}`
      }
      // For teams, use the id (team/project key)
      return `t:${s.id}`
    })
    .join(",")
}

// Parse column filters from URL
function parseColumnFilters(params: URLSearchParams): Partial<ColumnFilters> {
  const filters: Partial<ColumnFilters> = {}

  const entity = params.get(PARAM.ENTITY)
  if (entity) {
    filters.entity = entity.split(",")
  }

  const type = params.get(PARAM.TYPE)
  if (type) {
    filters.type = type.split(",") as AssetType[]
  }

  const status = params.get(PARAM.STATUS)
  if (status) {
    filters.status = status.split(",") as AssetStatus[]
  }

  const progress = params.get(PARAM.PROGRESS)
  if (progress) {
    filters.progress = progress.split(",") as ProgressStatus[]
  }

  const frequency = params.get(PARAM.FREQUENCY)
  if (frequency) {
    filters.frequency = frequency.split(",") as Frequency[]
  }

  // Assignee filters
  const preparerFilter = parseAssigneeFilter(
    params.get(PARAM.PREPARER),
    params.get(PARAM.PREPARER_TYPE)
  )
  if (Object.keys(preparerFilter).length > 0) {
    filters.preparer = {
      filterType: preparerFilter.filterType ?? "all",
      selections: preparerFilter.selections ?? [],
      searchQuery: "",
    }
  }

  const reviewerFilter = parseAssigneeFilter(
    params.get(PARAM.REVIEWER),
    params.get(PARAM.REVIEWER_TYPE)
  )
  if (Object.keys(reviewerFilter).length > 0) {
    filters.reviewer = {
      filterType: reviewerFilter.filterType ?? "all",
      selections: reviewerFilter.selections ?? [],
      searchQuery: "",
    }
  }

  // Boolean filters
  const coverSheet = params.get(PARAM.COVER_SHEET)
  if (coverSheet !== null) {
    filters.coverSheetCompleted = coverSheet === "true"
  }

  const system = params.get(PARAM.SYSTEM)
  if (system !== null) {
    filters.isSystem = system === "true"
  }

  const manual = params.get(PARAM.MANUAL)
  if (manual !== null) {
    filters.isManual = manual === "true"
  }

  const adjustment = params.get(PARAM.ADJUSTMENT)
  if (adjustment !== null) {
    filters.adjustment = adjustment === "true"
  }

  const reverse = params.get(PARAM.REVERSE)
  if (reverse !== null) {
    filters.reverse = reverse === "true"
  }

  return filters
}

// Parse filters from URL
function parseFilters(params: URLSearchParams): Partial<DashboardFilters> {
  const filters: Partial<DashboardFilters> = {}

  const search = params.get(PARAM.SEARCH)
  if (search) {
    filters.searchQuery = search
  }

  const period = params.get(PARAM.PERIOD)
  if (period) {
    filters.period = period
  }

  const teams = params.get(PARAM.TEAMS)
  if (teams) {
    filters.teamProjects = teams.split(",").map((pair) => {
      const [team, project] = pair.split(":")
      return { team, project } as TeamProject
    })
  }

  const columnFilters = parseColumnFilters(params)
  if (Object.keys(columnFilters).length > 0) {
    filters.columnFilters = columnFilters as ColumnFilters
  }

  return filters
}

// Serialize column filters to URL params
function serializeColumnFilters(cf: ColumnFilters, params: URLSearchParams): void {
  if (cf.entity.length > 0) {
    params.set(PARAM.ENTITY, cf.entity.join(","))
  }
  if (cf.type.length > 0) {
    params.set(PARAM.TYPE, cf.type.join(","))
  }
  if (cf.status.length > 0) {
    params.set(PARAM.STATUS, cf.status.join(","))
  }
  if (cf.progress.length > 0) {
    params.set(PARAM.PROGRESS, cf.progress.join(","))
  }
  if (cf.frequency.length > 0) {
    params.set(PARAM.FREQUENCY, cf.frequency.join(","))
  }
  // Preparer filter
  if (cf.preparer.filterType !== "all") {
    params.set(PARAM.PREPARER_TYPE, cf.preparer.filterType)
  }
  if (cf.preparer.selections.length > 0) {
    params.set(PARAM.PREPARER, serializeAssigneeSelections(cf.preparer.selections))
  }
  // Reviewer filter
  if (cf.reviewer.filterType !== "all") {
    params.set(PARAM.REVIEWER_TYPE, cf.reviewer.filterType)
  }
  if (cf.reviewer.selections.length > 0) {
    params.set(PARAM.REVIEWER, serializeAssigneeSelections(cf.reviewer.selections))
  }
  // Boolean filters
  if (cf.coverSheetCompleted !== null) {
    params.set(PARAM.COVER_SHEET, String(cf.coverSheetCompleted))
  }
  if (cf.isSystem !== null) {
    params.set(PARAM.SYSTEM, String(cf.isSystem))
  }
  if (cf.isManual !== null) {
    params.set(PARAM.MANUAL, String(cf.isManual))
  }
  if (cf.adjustment !== null) {
    params.set(PARAM.ADJUSTMENT, String(cf.adjustment))
  }
  if (cf.reverse !== null) {
    params.set(PARAM.REVERSE, String(cf.reverse))
  }
}

// Build URL params from state
function buildUrlParams(state: {
  viewMode: ViewMode
  filters: DashboardFilters
  sorting: SortingState
  pagination: { page: number; pageSize: number }
}): URLSearchParams {
  const params = new URLSearchParams()

  // View mode - only add if not default
  if (state.viewMode !== "list") {
    params.set(PARAM.VIEW, state.viewMode)
  }

  // Filters
  if (state.filters.searchQuery) {
    params.set(PARAM.SEARCH, state.filters.searchQuery)
  }

  if (state.filters.period && state.filters.period !== "2025-12") {
    params.set(PARAM.PERIOD, state.filters.period)
  }

  if (state.filters.teamProjects.length > 0) {
    params.set(
      PARAM.TEAMS,
      state.filters.teamProjects.map((tp) => `${tp.team}:${tp.project}`).join(",")
    )
  }

  // Column filters
  serializeColumnFilters(state.filters.columnFilters, params)

  // Sorting
  if (state.sorting.length > 0) {
    params.set(PARAM.SORT, state.sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(","))
  }

  // Pagination - only non-default values
  if (state.pagination.page > 1) {
    params.set(PARAM.PAGE, String(state.pagination.page))
  }
  if (state.pagination.pageSize !== 10) {
    params.set(PARAM.PAGE_SIZE, String(state.pagination.pageSize))
  }

  return params
}

// Update URL without navigation
function updateUrl(params: URLSearchParams): void {
  const search = params.toString()
  const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname
  window.history.replaceState(null, "", newUrl)
}

// Apply parsed filters to store
function applyFiltersToStore(
  filters: Partial<DashboardFilters>,
  actions: ReturnType<typeof useDashboardStore.getState>
): void {
  if (filters.searchQuery !== undefined) {
    actions.setSearchQuery(filters.searchQuery)
  }
  if (filters.period !== undefined) {
    actions.setPeriod(filters.period)
  }
  if (filters.teamProjects !== undefined) {
    actions.setTeamProjects(filters.teamProjects)
  }
}

// Apply parsed column filters to store
function applyColumnFiltersToStore(
  cf: Partial<ColumnFilters>,
  actions: ReturnType<typeof useDashboardStore.getState>
): void {
  if (cf.entity) {
    actions.setEntityFilter(cf.entity)
  }
  if (cf.type) {
    actions.setTypeFilter(cf.type)
  }
  if (cf.status) {
    actions.setStatusFilter(cf.status)
  }
  if (cf.progress) {
    actions.setProgressFilter(cf.progress)
  }
  if (cf.frequency) {
    actions.setFrequencyFilter(cf.frequency)
  }
  if (cf.preparer) {
    if (cf.preparer.filterType) {
      actions.setAssigneeFilterType("preparer", cf.preparer.filterType)
    }
    if (cf.preparer.selections) {
      actions.setAssigneeSelections("preparer", cf.preparer.selections)
    }
  }
  if (cf.reviewer) {
    if (cf.reviewer.filterType) {
      actions.setAssigneeFilterType("reviewer", cf.reviewer.filterType)
    }
    if (cf.reviewer.selections) {
      actions.setAssigneeSelections("reviewer", cf.reviewer.selections)
    }
  }
  if (cf.coverSheetCompleted !== undefined) {
    actions.setBooleanFilter("coverSheetCompleted", cf.coverSheetCompleted)
  }
  if (cf.isSystem !== undefined) {
    actions.setBooleanFilter("isSystem", cf.isSystem)
  }
  if (cf.isManual !== undefined) {
    actions.setBooleanFilter("isManual", cf.isManual)
  }
  if (cf.adjustment !== undefined) {
    actions.setBooleanFilter("adjustment", cf.adjustment)
  }
  if (cf.reverse !== undefined) {
    actions.setBooleanFilter("reverse", cf.reverse)
  }
}

// Hook to sync URL with store
export function useUrlSync(): void {
  const initialized = useRef(false)

  // Initialize state from URL on mount
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true

    const params = new URLSearchParams(window.location.search)
    const state = useDashboardStore.getState()

    // View mode
    const viewMode = parseViewMode(params)
    if (viewMode) {
      state.setViewMode(viewMode)
    }

    // Filters
    const filters = parseFilters(params)
    applyFiltersToStore(filters, state)

    if (filters.columnFilters) {
      applyColumnFiltersToStore(filters.columnFilters, state)
    }

    // Sorting
    const sorting = parseSorting(params)
    if (sorting) {
      state.setSorting(sorting)
    }

    // Pagination
    const pagination = parsePagination(params)
    if (pagination.page) {
      state.setPage(pagination.page)
    }
    if (pagination.pageSize) {
      state.setPageSize(pagination.pageSize)
    }
  }, [])

  // Sync state changes to URL
  useEffect(() => {
    const unsubscribe = useDashboardStore.subscribe((state) => {
      const params = buildUrlParams({
        viewMode: state.viewMode,
        filters: state.filters,
        sorting: state.sorting,
        pagination: state.pagination,
      })
      updateUrl(params)
    })

    return unsubscribe
  }, [])
}
