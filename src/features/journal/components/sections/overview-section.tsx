import { MarkdownDisplay } from "@/features/journal/components/shared/markdown-display"
import { SectionContainer } from "@/features/journal/components/shared/section-container"
import type { AssetDetail } from "@/features/journal/types"

interface OverviewSectionProps {
  asset: AssetDetail
}

const MOCK_DESCRIPTION = `
## Purpose
This journal entry records month-end accruals for January 2025, including prepaid expenses amortization and accrued liabilities adjustments.

## Key Items
- **Prepaid Insurance**: Monthly amortization of $12,500
- **Accrued Wages**: End of period wage accrual
- **Deferred Revenue**: Recognition of subscription revenue
`

export function OverviewSection({ asset }: OverviewSectionProps) {
  const description = asset.description ?? MOCK_DESCRIPTION

  return (
    <SectionContainer title="Overview">
      <div className="max-h-[200px] overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3">
        <MarkdownDisplay content={description} />
      </div>
    </SectionContainer>
  )
}
