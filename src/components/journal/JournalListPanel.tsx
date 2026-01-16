import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { JournalCard } from "./JournalCard"
import type { Asset } from "@/types/journal"

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
]

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {SKELETON_ITEMS.map((id) => (
        <div key={id} className="rounded-lg border p-3">
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
      <div className="border-b p-3">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">
              Pending
            </TabsTrigger>
            <TabsTrigger value="involved" className="flex-1">
              Involved
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search journals..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
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
                key={asset.id}
                asset={asset}
                isSelected={selectedId === asset.id}
                onClick={() => onSelect(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {isLoading ? "Loading..." : `Showing ${assets.length} entries`}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">1 / 1</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
