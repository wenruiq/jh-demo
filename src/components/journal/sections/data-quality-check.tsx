import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useState } from "react"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { cn } from "@/lib/utils"

interface QualityCheck {
  id: string
  name: string
  status: "passed" | "failed" | "pending"
  details: string
  recommendation?: string
}

const MOCK_CHECKS: QualityCheck[] = [
  {
    id: "1",
    name: "Debit/Credit Balance",
    status: "passed",
    details: "Total debits equal total credits. Difference: $0.00",
  },
  {
    id: "2",
    name: "Duplicate Entry Check",
    status: "passed",
    details: "No duplicate journal entries detected in this period.",
  },
  {
    id: "3",
    name: "Account Code Validation",
    status: "passed",
    details: "All account codes are valid and active in the chart of accounts.",
  },
  {
    id: "4",
    name: "Variance Threshold",
    status: "failed",
    details: "Account 4500-01 exceeded the 5% variance threshold (actual: 7.2%)",
    recommendation: "Review the variance and attach supporting documentation if valid.",
  },
  {
    id: "5",
    name: "Required Attachments",
    status: "passed",
    details: "All required supporting documents have been uploaded.",
  },
  {
    id: "6",
    name: "Approval Workflow",
    status: "pending",
    details: "Pending reviewer approval.",
  },
]

function getStatusIcon(status: QualityCheck["status"]) {
  switch (status) {
    case "passed":
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case "failed":
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case "pending":
      return <Clock className="h-4 w-4 text-warning" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

interface DataQualityCheckProps {
  readonly?: boolean
}

export function DataQualityCheck({ readonly = false }: DataQualityCheckProps) {
  const [selectedCheckId, setSelectedCheckId] = useState<string>(MOCK_CHECKS[0].id)
  const selectedCheck = MOCK_CHECKS.find((c) => c.id === selectedCheckId)

  return (
    <SectionContainer title="Data Quality Check">
      <div className={cn("flex gap-4", readonly && "opacity-80")} style={{ minHeight: "160px" }}>
        <div className="w-[240px] shrink-0 space-y-1">
          {MOCK_CHECKS.map((check) => (
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                selectedCheckId === check.id ? "bg-muted" : "hover:bg-muted/50"
              )}
              key={check.id}
              onClick={() => setSelectedCheckId(check.id)}
              type="button"
            >
              {getStatusIcon(check.status)}
              <span className="truncate">{check.name}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 rounded-lg border bg-muted/20 p-4">
          {selectedCheck && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedCheck.status)}
                <h4 className="font-medium">{selectedCheck.name}</h4>
              </div>
              <p className="text-muted-foreground text-sm">{selectedCheck.details}</p>
              {selectedCheck.recommendation && (
                <div className="rounded-md bg-warning-muted p-3">
                  <p className="font-medium text-sm text-warning">Recommendation</p>
                  <p className="mt-1 text-sm">{selectedCheck.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
