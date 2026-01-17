import { ActivitySection } from "@/components/journal/sections/activity-section"
import { DetailsSection } from "@/components/journal/sections/details-section"
import { OverviewSection } from "@/components/journal/sections/overview-section"
import { SummarySection } from "@/components/journal/sections/summary-section"
import { StatusActions } from "@/components/journal/status-actions"
import { StatusFlow } from "@/components/journal/status-flow"
import type { AssetDetail } from "@/types/journal"

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
