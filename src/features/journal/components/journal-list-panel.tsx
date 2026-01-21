import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JournalCard } from "@/features/journal/components/journal-card"
import type { Asset } from "@/features/journal/types"

interface JournalListPanelProps {
  assets: Asset[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
}

const SKELETON_ITEMS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
  "skeleton-7",
  "skeleton-8",
  "skeleton-9",
  "skeleton-10",
  "skeleton-11",
  "skeleton-12",
]

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {SKELETON_ITEMS.map((id) => (
        <div className="rounded-lg border p-3" key={id}>
          <Skeleton className="mb-2 h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function JournalListPanel({
  assets,
  selectedId,
  onSelect,
  isLoading,
}: JournalListPanelProps) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r">
      <div className="space-y-2 border-b p-2">
        <Tabs className="w-full" defaultValue="all">
          <TabsList className="h-9 w-full">
            <TabsTrigger className="h-8 flex-1 text-sm" value="pending">
              Pending
            </TabsTrigger>
            <TabsTrigger className="h-8 flex-1 text-sm" value="involved">
              Involved
            </TabsTrigger>
            <TabsTrigger className="h-8 flex-1 text-sm" value="all">
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="h-9 pl-9 text-sm" placeholder="Search journals..." />
          </div>
          <Button className="h-9 w-9" size="icon" variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-2">
            {assets.map((asset) => (
              <JournalCard
                asset={asset}
                isSelected={selectedId === asset.id}
                key={asset.id}
                onClick={() => onSelect(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="text-muted-foreground text-xs">
          {isLoading ? "Loading..." : `Showing ${assets.length} entries`}
        </span>
        <div className="flex items-center gap-1">
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground text-xs">1 / 1</span>
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
