import { MarkdownDisplay } from "@/components/journal/shared/markdown-display"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { useAiFindingsStore } from "@/store/ai-findings-store"
import { MonthlyTrendChart } from "./monthly-trend-chart"

const FALLBACK_CONTENT = "*Key findings have not been generated.*"

export function SummarySection() {
  const { adoptedFindings } = useAiFindingsStore()

  const hasAdoptedContent = adoptedFindings !== null

  return (
    <SectionContainer title="Summary">
      <div className="flex gap-6" style={{ height: "280px" }}>
        <div className="flex flex-[65] flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Key Findings
            </h4>
            {hasAdoptedContent && adoptedFindings && (
              <span className="text-muted-foreground text-xs">
                Generated {adoptedFindings.generatedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3">
            {hasAdoptedContent && adoptedFindings ? (
              <MarkdownDisplay content={adoptedFindings.content} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MarkdownDisplay content={FALLBACK_CONTENT} />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-[35] flex-col">
          <h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Monthly Trends
          </h4>
          <div className="flex-1 rounded-md border border-border/60 bg-muted/20 p-3">
            <MonthlyTrendChart />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
