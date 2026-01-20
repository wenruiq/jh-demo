import { faker } from "@faker-js/faker"
import type { AssetStatus, AssetType, Identity } from "../types"
import type {
  Assignee,
  ColumnFilters,
  DashboardAsset,
  DashboardMetrics,
  Frequency,
  ProgressStatus,
} from "../types/dashboard"
import { type Project, TEAM_PROJECT_MAP, TEAMS, type Team } from "./team-project-data"

// Entity shortform mapping
export const ENTITY_SHORTFORMS: Record<string, string> = {
  "Shopee SG": "SPXSG",
  "Shopee ID": "SPXID",
  "Shopee TH": "SPXTH",
  "Shopee BR": "SPXBR",
  "SeaMoney SG": "SMSG",
  "SeaMoney ID": "SMID",
  "SeaMoney TH": "SMTH",
  "Garena SG": "GRSG",
  "Garena ID": "GRID",
  "Sea Group HQ": "SEAHQ",
}

export const ENTITIES = Object.values(ENTITY_SHORTFORMS)

// Journal name templates
const JOURNAL_NAMES = [
  "Monthly Revenue Accrual",
  "Inventory Adjustment",
  "Intercompany Settlement",
  "Fixed Asset Depreciation",
  "Payroll Accrual",
  "Tax Provision",
  "Lease Payment",
  "Bad Debt Provision",
  "Foreign Exchange Revaluation",
  "Prepaid Expense Amortization",
  "Deferred Revenue Recognition",
  "Cost Allocation",
  "Bank Reconciliation",
  "Commission Accrual",
  "Bonus Accrual",
  "Insurance Premium",
  "Marketing Expense Accrual",
  "IT Infrastructure Charge",
  "Management Fee Allocation",
  "Consolidation Elimination",
]

export const ASSET_TYPES: AssetType[] = ["GL", "AR", "AP", "GRP"]
export const ASSET_STATUSES: AssetStatus[] = [
  "GENERATION",
  "PREPARATION",
  "SUBMISSION",
  "REVIEW",
  "EBS_UPLOAD",
]
export const FREQUENCY_OPTIONS: Frequency[] = ["one-time", "quarterly", "monthly"]

// Generate a random identity
function generateIdentity(): Identity {
  return {
    id: faker.string.uuid(),
    username: faker.internet.username().toLowerCase(),
    fullname: faker.person.fullName(),
    avatar: faker.image.avatar(),
  }
}

// Generate random team-project pair
function generateTeamProject(): { team: Team; project: Project } {
  const team = faker.helpers.arrayElement(TEAMS)
  const projects = TEAM_PROJECT_MAP[team]
  const project = faker.helpers.arrayElement(projects)
  return { team, project }
}

// Generate a due date within the specified period (YYYY-MM format)
function generateDueDate(period: string): string {
  const [year, month] = period.split("-").map(Number)
  // Generate dates from day 1 to end of month
  const daysInMonth = new Date(year, month, 0).getDate()
  const day = faker.number.int({ min: 1, max: daysInMonth })
  // Add time component for more realistic due dates
  const hour = faker.number.int({ min: 9, max: 18 })
  const minute = faker.helpers.arrayElement([0, 15, 30, 45])
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
}

// Determine progress status based on due date and completion
function determineProgress(dueDate: string, status: AssetStatus, period: string): ProgressStatus {
  // Use a reference date based on the period (simulate viewing at the end of the month)
  const [year, month] = period.split("-").map(Number)
  // Simulate we're viewing this on day 15 of the period month
  const referenceDate = new Date(year, month - 1, 15)
  const due = new Date(dueDate)
  const daysUntilDue = Math.ceil((due.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))

  if (status === "EBS_UPLOAD") {
    return "completed"
  }
  if (daysUntilDue < 0) {
    return "overdue"
  }
  if (daysUntilDue <= 5) {
    return "due_soon"
  }
  return "in_progress"
}

// Generate an assignee (either users or team assignment)
function generateAssignee(teamProbability = 0.2): Assignee {
  const isTeamAssignment = faker.datatype.boolean({ probability: teamProbability })
  if (isTeamAssignment) {
    return { teamAssignment: generateTeamProject() }
  }
  return {
    users: faker.helpers.multiple(generateIdentity, {
      count: faker.number.int({ min: 1, max: 3 }),
    }),
  }
}

// Generate mock dashboard assets for a specific period
export function generateMockAssets(count: number, period: string): DashboardAsset[] {
  // Seed faker based on period for consistent data per period
  const periodSeed = period.split("-").reduce((acc, val) => acc + Number(val), 0) * 100
  faker.seed(periodSeed)

  const assets: DashboardAsset[] = []

  for (let i = 0; i < count; i++) {
    const entity = faker.helpers.arrayElement(ENTITIES)
    // Weight status towards EBS_UPLOAD for higher completion rate (>50%)
    const status = faker.helpers.weightedArrayElement([
      { value: "GENERATION" as const, weight: 1 },
      { value: "PREPARATION" as const, weight: 1 },
      { value: "SUBMISSION" as const, weight: 1 },
      { value: "REVIEW" as const, weight: 1 },
      { value: "EBS_UPLOAD" as const, weight: 6 },
    ])
    const dueDate = generateDueDate(period)
    const isSystem = faker.datatype.boolean()
    const isCompleted = status === "EBS_UPLOAD"

    assets.push({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(JOURNAL_NAMES),
      entity,
      type: faker.helpers.arrayElement(ASSET_TYPES),
      status,
      dueDate,
      progress: determineProgress(dueDate, status, period),
      frequency: faker.helpers.arrayElement(FREQUENCY_OPTIONS),
      businessOwner: generateTeamProject(),
      preparer: generateAssignee(0.25),
      reviewer: generateAssignee(0.2),
      isSystem,
      isManual: !isSystem,
      coverSheetCompleted: isCompleted ? true : faker.datatype.boolean({ probability: 0.7 }),
      adjustment: faker.datatype.boolean({ probability: 0.3 }),
      reverse: faker.datatype.boolean({ probability: 0.15 }),
    })
  }

  return assets
}

// Default mock assets for initial period
export const MOCK_DASHBOARD_ASSETS: DashboardAsset[] = generateMockAssets(28, "2025-12")

// Calculate metrics from assets
export function calculateMetrics(assets: DashboardAsset[]): DashboardMetrics {
  const total = assets.length
  const completed = assets.filter((a) => a.progress === "completed").length
  const inProgress = assets.filter((a) => a.progress === "in_progress").length
  const dueSoon = assets.filter((a) => a.progress === "due_soon").length
  const overdue = assets.filter((a) => a.progress === "overdue").length

  // On-time: completed journals that were uploaded before due date
  const onTimeCount = assets.filter((a) => a.progress === "completed").length
  const onTimePercent = total > 0 ? Math.round((onTimeCount / total) * 100) : 0

  // Automation: system entries vs total
  const systemCount = assets.filter((a) => a.isSystem).length
  const automationPercent = total > 0 ? Math.round((systemCount / total) * 100) : 0

  // Cover sheet: journals with cover sheet completed
  const coverSheetCount = assets.filter((a) => a.coverSheetCompleted).length
  const coverSheetPercent = total > 0 ? Math.round((coverSheetCount / total) * 100) : 0

  return {
    total,
    completed,
    inProgress,
    dueSoon,
    overdue,
    completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    onTimePercent,
    automationPercent,
    coverSheetPercent,
  }
}

// Apply array-based column filter
function applyArrayFilter<T>(
  assets: DashboardAsset[],
  filterValues: T[] | undefined,
  accessor: (asset: DashboardAsset) => T
): DashboardAsset[] {
  if (!filterValues || filterValues.length === 0) {
    return assets
  }
  return assets.filter((asset) => filterValues.includes(accessor(asset)))
}

// Apply boolean column filter
function applyBooleanFilter(
  assets: DashboardAsset[],
  filterValue: boolean | null | undefined,
  accessor: (asset: DashboardAsset) => boolean
): DashboardAsset[] {
  if (filterValue === null || filterValue === undefined) {
    return assets
  }
  return assets.filter((asset) => accessor(asset) === filterValue)
}

// Apply column filters to assets
function applyColumnFilters(
  assets: DashboardAsset[],
  cf: Partial<ColumnFilters>
): DashboardAsset[] {
  let result = assets
  result = applyArrayFilter(result, cf.entity, (a) => a.entity)
  result = applyArrayFilter(result, cf.type, (a) => a.type)
  result = applyArrayFilter(result, cf.status, (a) => a.status)
  result = applyArrayFilter(result, cf.progress, (a) => a.progress)
  result = applyArrayFilter(result, cf.frequency, (a) => a.frequency)
  result = applyBooleanFilter(result, cf.coverSheetCompleted, (a) => a.coverSheetCompleted)
  result = applyBooleanFilter(result, cf.isSystem, (a) => a.isSystem)
  result = applyBooleanFilter(result, cf.isManual, (a) => a.isManual)
  result = applyBooleanFilter(result, cf.adjustment, (a) => a.adjustment)
  result = applyBooleanFilter(result, cf.reverse, (a) => a.reverse)
  return result
}

// Filter assets based on criteria
export function filterAssets(
  assets: DashboardAsset[],
  filters: {
    teamProjects?: Array<{ team: string; project: string }>
    searchQuery?: string
    columnFilters?: Partial<ColumnFilters>
  }
): DashboardAsset[] {
  let filtered = [...assets]

  // Team/Project filter
  if (filters.teamProjects && filters.teamProjects.length > 0) {
    filtered = filtered.filter((asset) =>
      filters.teamProjects?.some(
        (tp) => asset.businessOwner.team === tp.team && asset.businessOwner.project === tp.project
      )
    )
  }

  // Search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) || asset.entity.toLowerCase().includes(query)
    )
  }

  // Column filters
  if (filters.columnFilters) {
    filtered = applyColumnFilters(filtered, filters.columnFilters)
  }

  return filtered
}
