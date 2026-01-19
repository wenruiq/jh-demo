// Quality Check Utilities
// Co-located with quality check components

import type { QualityCheck } from "@/store/data-quality-store"

/**
 * Check if a quality check is completed
 * Manual checks: done when user marks as verified (userResult = Pass)
 * System/AI checks: if system passed, need acknowledgment; if failed, need user pass
 */
export function isQualityCheckDone(check: QualityCheck): boolean {
  // Manual checks are done when user marks them as verified
  if (check.type === "Manual Check") {
    return check.userResult === "Pass"
  }
  // System/AI checks: if system passed, need acknowledgment; if failed, need user pass
  if (check.systemResult === "Pass") {
    return check.acknowledged
  }
  return check.userResult === "Pass"
}

/**
 * Get available mentions from data uploads + always include JournalEntry
 */
export function getAvailableMentions(uploadNames: string[]): string[] {
  return ["JournalEntry", ...uploadNames]
}
