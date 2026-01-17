import { MarkdownDisplay } from "@/components/journal/shared/markdown-display"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { MonthlyTrendChart } from "./monthly-trend-chart"

const MOCK_AI_SUMMARY = `
**Key Observations:**
- Total journal entries increased by **8.2%** compared to last month
- All account reconciliations are balanced within tolerance
- 3 entries flagged for higher-than-usual variance

**Risk Indicators:**
- Low risk profile - within expected parameters
- No unusual transaction patterns detected
`

export function SummarySection() {
  return (
    <SectionContainer title="Summary">
      <div className="flex gap-6" style={{ height: "220px" }}>
        <div className="flex flex-1 flex-col">
          <h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Key Findings
          </h4>
          <div className="flex-1 overflow-y-auto pr-2">
            <MarkdownDisplay content={MOCK_AI_SUMMARY} />
          </div>
        </div>
        <div className="flex w-[300px] shrink-0 flex-col">
          <h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Monthly Trends
          </h4>
          <div className="flex-1">
            <MonthlyTrendChart />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
