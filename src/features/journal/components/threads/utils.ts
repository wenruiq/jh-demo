export const MOCK_FILES = [
  { filename: "supporting_documentation.pdf", size: "1.4 MB" },
  { filename: "variance_analysis.xlsx", size: "856 KB" },
  { filename: "approval_memo.pdf", size: "234 KB" },
  { filename: "reconciliation_report.xlsx", size: "2.1 MB" },
]

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return "just now"
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString()
}

export function generateAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
