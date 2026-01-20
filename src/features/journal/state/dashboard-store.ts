import type { SortingState, Updater } from "@tanstack/react-table"
import { create } from "zustand"
import type { AssetStatus, AssetType } from "../types"
import type {
  ColumnFilters,
  DashboardFilters,
  Frequency,
  ProgressStatus,
  TeamProject,
} from "../types/dashboard"

export const VIEW_MODES = ["list", "dashboard"] as const
export type ViewMode = (typeof VIEW_MODES)[number]

const DEFAULT_COLUMN_FILTERS: ColumnFilters = {
  entity: [],
  type: [],
  status: [],
  progress: [],
  frequency: [],
  coverSheetCompleted: null,
  isSystem: null,
  isManual: null,
  adjustment: null,
  reverse: null,
}

interface DashboardStore {
  viewMode: ViewMode
  filters: DashboardFilters
  sorting: SortingState
  pagination: {
    page: number
    pageSize: number
  }
  setViewMode: (mode: ViewMode) => void
  setFilters: (filters: Partial<DashboardFilters>) => void
  setTeamProjects: (teamProjects: TeamProject[]) => void
  setPeriod: (period: string) => void
  setSearchQuery: (query: string) => void
  setColumnFilter: <K extends keyof ColumnFilters>(key: K, value: ColumnFilters[K]) => void
  setEntityFilter: (entities: string[]) => void
  setTypeFilter: (types: AssetType[]) => void
  setStatusFilter: (statuses: AssetStatus[]) => void
  setProgressFilter: (progress: ProgressStatus[]) => void
  setFrequencyFilter: (frequencies: Frequency[]) => void
  setBooleanFilter: (
    key: "coverSheetCompleted" | "isSystem" | "isManual" | "adjustment" | "reverse",
    value: boolean | null
  ) => void
  clearColumnFilters: () => void
  setSorting: (updater: Updater<SortingState>) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: DashboardFilters = {
  teamProjects: [],
  period: "2025-12",
  searchQuery: "",
  columnFilters: { ...DEFAULT_COLUMN_FILTERS },
}

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  viewMode: "list",
  filters: { ...DEFAULT_FILTERS },
  sorting: [],
  pagination: { ...DEFAULT_PAGINATION },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),

  setTeamProjects: (teamProjects) =>
    set((state) => ({
      filters: { ...state.filters, teamProjects },
      pagination: { ...state.pagination, page: 1 },
    })),

  setPeriod: (period) =>
    set((state) => ({
      filters: { ...state.filters, period },
      pagination: { ...state.pagination, page: 1 },
    })),

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery },
      pagination: { ...state.pagination, page: 1 },
    })),

  setColumnFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, [key]: value },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setEntityFilter: (entities) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, entity: entities },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setTypeFilter: (types) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, type: types },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setStatusFilter: (statuses) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, status: statuses },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setProgressFilter: (progress) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, progress },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setFrequencyFilter: (frequencies) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, frequency: frequencies },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setBooleanFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...state.filters.columnFilters, [key]: value },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  clearColumnFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        columnFilters: { ...DEFAULT_COLUMN_FILTERS },
      },
      pagination: { ...state.pagination, page: 1 },
    })),

  setSorting: (updater) =>
    set((state) => {
      const newSorting = typeof updater === "function" ? updater(state.sorting) : updater
      return { sorting: newSorting }
    }),

  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, pageSize, page: 1 },
    })),

  resetFilters: () =>
    set({
      filters: { ...DEFAULT_FILTERS, columnFilters: { ...DEFAULT_COLUMN_FILTERS } },
      sorting: [],
      pagination: { ...DEFAULT_PAGINATION },
    }),
}))
