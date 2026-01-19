import { ActivitySection } from "@/features/journal/components/sections/activity-section"
import { DetailsSection } from "@/features/journal/components/sections/details-section"
import { OverviewSection } from "@/features/journal/components/sections/overview-section"
import { SummarySection } from "@/features/journal/components/sections/summary-section"
import { StatusActions } from "@/features/journal/components/status-actions/status-actions"
import { StatusFlow } from "@/features/journal/components/status-flow"
import type { AssetDetail } from "@/features/journal/types"

interface JournalViewProps {
  asset: AssetDetail
}

export function JournalView({ asset }: JournalViewProps) {
  return (
    <div className="flex flex-col">
      <div className="space-y-3 px-6 pt-5 pb-3">
        <StatusFlow asset={asset} />
        <StatusActions asset={asset} />
      </div>
      <OverviewSection asset={asset} />
      <SummarySection />
      <DetailsSection />
      <ActivitySection />
    </div>
  )
}
