import type { AssetStatus, AssetType, Identity } from "../types"

// Progress status (derived from dueDate)
export const PROGRESS_STATUSES = ["overdue", "completed", "in_progress", "due_soon"] as const
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number]

// Frequency options
export const FREQUENCIES = ["one-time", "quarterly", "monthly"] as const
export type Frequency = (typeof FREQUENCIES)[number]

// Team/Project structure
export interface TeamProject {
  team: string
  project: string
}

// Assignee - can be a list of users OR a team assignment
export interface Assignee {
  users?: Identity[]
  teamAssignment?: TeamProject
}

// Extended asset for dashboard
export interface DashboardAsset {
  id: string
  name: string
  entity: string
  type: AssetType
  status: AssetStatus
  dueDate: string
  progress: ProgressStatus
  frequency: Frequency
  businessOwner: TeamProject
  preparer: Assignee
  reviewer: Assignee
  isSystem: boolean
  isManual: boolean
  coverSheetCompleted: boolean
  adjustment: boolean
  reverse: boolean
}

// Assignee filter types
export type AssigneeFilterType = "all" | "users" | "teams"

// Selected assignee for filtering
export interface AssigneeFilterSelection {
  type: "user" | "team"
  id: string // For users: unique ID, for teams: "team/project" key
  label: string // Display name
}

// Assignee filter state
export interface AssigneeFilter {
  filterType: AssigneeFilterType
  selections: AssigneeFilterSelection[]
  searchQuery: string
}

// Column filter state for individual table columns
export interface ColumnFilters {
  entity: string[]
  type: AssetType[]
  status: AssetStatus[]
  progress: ProgressStatus[]
  frequency: Frequency[]
  preparer: AssigneeFilter
  reviewer: AssigneeFilter
  coverSheetCompleted: boolean | null
  isSystem: boolean | null
  isManual: boolean | null
  adjustment: boolean | null
  reverse: boolean | null
}

// Dashboard filter state
export interface DashboardFilters {
  teamProjects: TeamProject[]
  period: string
  searchQuery: string
  columnFilters: ColumnFilters
}

// Dashboard metrics
export interface DashboardMetrics {
  total: number
  completed: number
  inProgress: number
  dueSoon: number
  overdue: number
  completionPercent: number
  onTimePercent: number
  automationPercent: number
  coverSheetPercent: number
}
