import { SectionContainer } from "@/components/journal/shared/section-container"

export function DetailsSection() {
  return (
    <SectionContainer title="Details">
      <div className="flex h-48 items-center justify-center rounded-lg border-2 border-muted border-dashed">
        <p className="text-muted-foreground text-sm">
          Journal entries data grid will be added here
        </p>
      </div>
    </SectionContainer>
  )
}
