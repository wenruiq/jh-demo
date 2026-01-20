import { cn } from "@/shared/lib/utils"

interface ShimmerProps {
  className?: string
}

function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/10 before:to-transparent",
        className
      )}
    />
  )
}

export function ViewLoading() {
  return (
    <div className="fade-in flex flex-1 animate-in flex-col overflow-hidden duration-200">
      {/* Filter row skeleton */}
      <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-8 w-28" />
          <Shimmer className="h-8 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-8 w-24" />
          <Shimmer className="h-8 w-8" />
          <Shimmer className="h-8 w-8" />
        </div>
      </div>

      {/* Metrics row skeleton */}
      <div className="flex items-center justify-between gap-6 border-b bg-card/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4 py-3">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-7 w-20" />
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4 py-3">
            <Shimmer className="h-3 w-14" />
            <Shimmer className="h-7 w-10" />
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4 py-3">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-7 w-10" />
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4 py-3">
            <Shimmer className="h-3 w-14" />
            <Shimmer className="h-7 w-10" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Shimmer className="h-[72px] w-[72px] rounded-full" />
            <div className="flex flex-col gap-1">
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-5 w-10" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-[72px] w-[72px] rounded-full" />
            <div className="flex flex-col gap-1">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-5 w-10" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-[72px] w-[72px] rounded-full" />
            <div className="flex flex-col gap-1">
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-5 w-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="flex-1 overflow-hidden p-4">
        {/* Header */}
        <div className="mb-2 flex gap-3 border-b pb-2">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-14" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-24" />
        </div>
        {/* Rows */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-16" />
            <Shimmer className="h-5 w-40" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-12" />
            <Shimmer className="h-5 w-16" />
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-5 w-28" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-14" />
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-18" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-10" />
            <Shimmer className="h-5 w-18" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-12" />
            <Shimmer className="h-5 w-36" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-22" />
            <Shimmer className="h-5 w-18" />
            <Shimmer className="h-5 w-14" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-30" />
            <Shimmer className="h-5 w-26" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-16" />
            <Shimmer className="h-5 w-44" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-5 w-16" />
            <Shimmer className="h-5 w-12" />
            <Shimmer className="h-5 w-18" />
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-14" />
            <Shimmer className="h-5 w-38" />
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-5 w-18" />
            <Shimmer className="h-5 w-22" />
            <Shimmer className="h-5 w-10" />
            <Shimmer className="h-5 w-16" />
            <Shimmer className="h-5 w-32" />
            <Shimmer className="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ListViewLoading() {
  return (
    <div className="fade-in flex flex-1 animate-in overflow-hidden duration-200">
      {/* List panel skeleton */}
      <div className="flex w-80 flex-col border-r bg-card">
        <div className="border-b px-3 py-2">
          <Shimmer className="h-8 w-full" />
        </div>
        <div className="flex-1 space-y-1 p-2">
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-16 w-full rounded-md" />
        </div>
      </div>

      {/* Detail panel skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex flex-col gap-2">
            <Shimmer className="h-6 w-48" />
            <Shimmer className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Shimmer className="h-9 w-24" />
            <Shimmer className="h-9 w-20" />
          </div>
        </div>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex gap-4">
            <Shimmer className="h-20 w-32 rounded-lg" />
            <Shimmer className="h-20 w-32 rounded-lg" />
            <Shimmer className="h-20 w-32 rounded-lg" />
            <Shimmer className="h-20 w-32 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
