import { CheckCircle, Download, Filter, RefreshCw, Settings } from "lucide-react"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Demo data for the journal entries table
const DEMO_ENTRIES = [
  {
    id: 1,
    validation: "passed",
    source: "upload",
    enteredDebit: 21_289_371,
    enteredCredit: 0,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 1,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
  {
    id: 2,
    validation: "passed",
    source: "upload",
    enteredDebit: 0,
    enteredCredit: 21_289_371,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 2,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
  {
    id: 3,
    validation: "passed",
    source: "upload",
    enteredDebit: 37_400,
    enteredCredit: 0,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 3,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
  {
    id: 4,
    validation: "passed",
    source: "upload",
    enteredDebit: 0,
    enteredCredit: 37_400,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 4,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
  {
    id: 5,
    validation: "passed",
    source: "upload",
    enteredDebit: 2_028_673,
    enteredCredit: 0,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 5,
    lineDescription: "2025/10 進銷項稅額",
    accountingDate: "29-Nov-25",
  },
  {
    id: 6,
    validation: "passed",
    source: "upload",
    enteredDebit: 0,
    enteredCredit: 2_028_673,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 6,
    lineDescription: "2025/10 進銷項稅額",
    accountingDate: "29-Nov-25",
  },
  {
    id: 7,
    validation: "passed",
    source: "upload",
    enteredDebit: 2_624_400,
    enteredCredit: 0,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 7,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
  {
    id: 8,
    validation: "passed",
    source: "upload",
    enteredDebit: 0,
    enteredCredit: 646_400,
    refName: "JH-945_ma",
    journalName: "MOBTW-Lynn-2",
    journalDescription: "2025/11 Reclassify&Ne",
    lineId: 8,
    lineDescription: "2025/11 Reclassify",
    accountingDate: "29-Nov-25",
  },
]

function formatNumber(num: number): string {
  if (num === 0) {
    return "0"
  }
  return num.toLocaleString()
}

export function DetailsSection() {
  return (
    <SectionContainer
      headerAction={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span>System:</span>
            <Select defaultValue="v1">
              <SelectTrigger className="h-6 w-[90px] border-0 bg-transparent px-1 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1</SelectItem>
                <SelectItem value="v2">Version 2</SelectItem>
                <SelectItem value="v3">Version 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span>Upload:</span>
            <Button className="h-auto p-0 text-primary text-xs" variant="link">
              gl_template.xlsx
            </Button>
            <Download className="h-3 w-3" />
          </div>
          <span className="ml-2 text-muted-foreground text-xs">Updated at 2026-01-14 14:29</span>
          <Button className="h-6 w-6" size="icon" variant="ghost">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button className="h-6 w-6" size="icon" variant="ghost">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button className="h-6 w-6" size="icon" variant="ghost">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
      title="Details"
    >
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Validation
                  <Filter className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">source</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                entered_debit
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                entered_credit
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">ref_name</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                journal_name
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                journal_description
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">line_id</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                line_description
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                accounting_date
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ENTRIES.map((entry) => (
              <tr className="border-b last:border-0 hover:bg-muted/30" key={entry.id}>
                <td className="px-3 py-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                </td>
                <td className="px-3 py-2 text-foreground">{entry.source}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(entry.enteredDebit)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(entry.enteredCredit)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{entry.refName}</td>
                <td className="px-3 py-2 text-muted-foreground">{entry.journalName}</td>
                <td className="max-w-[160px] truncate px-3 py-2 text-muted-foreground">
                  {entry.journalDescription}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{entry.lineId}</td>
                <td className="px-3 py-2 text-muted-foreground">{entry.lineDescription}</td>
                <td className="px-3 py-2 text-muted-foreground">{entry.accountingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionContainer>
  )
}
