import type { QualityCheck } from "@/features/journal/state/data-quality-store"

export function isQualityCheckDone(check: QualityCheck): boolean {
  if (check.type === "Manual Check") {
    return check.userResult === "Pass"
  }
  if (check.systemResult === "Pass") {
    return check.acknowledged
  }
  return check.userResult === "Pass"
}

export function getAvailableMentions(uploadNames: string[]): string[] {
  return ["JournalEntry", ...uploadNames]
}
