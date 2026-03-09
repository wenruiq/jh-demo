import { ChevronRight, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import type { Thread, ThreadStatus } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ThreadListItemProps {
  thread: Thread
  isSelected: boolean
  onClick: () => void
}

const STATUS_CONFIG: Record<
  ThreadStatus,
  { label: string; variant: "warning" | "blue" | "success" }
> = {
  pending: { label: "Pending", variant: "warning" },
  review: { label: "Review", variant: "blue" },
  resolved: { label: "Resolved", variant: "success" },
}

export function ThreadListItem({ thread, isSelected, onClick }: ThreadListItemProps) {
  const status = STATUS_CONFIG[thread.status]

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "border-primary/30 bg-muted/50"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Row 1: title + status badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-sm leading-tight">{thread.title}</span>
          <Badge className="shrink-0" variant={status.variant}>
            {status.label}
          </Badge>
        </div>

        {/* Row 2: creator, time, reply count */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span className="truncate">
            <span className="text-muted-foreground/70">By</span> {thread.author.name}
          </span>
          <span>·</span>
          <span>{formatTimeAgo(thread.createdAt)}</span>
          {thread.replies.length > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.replies.length}
              </span>
            </>
          )}
        </div>

        {/* Row 3: assignee + chevron */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground/70">Assigned to</span>
            <div
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-medium text-[8px] text-white",
                thread.assignee.avatarColor
              )}
            >
              {thread.assignee.avatar}
            </div>
            <span className="truncate text-muted-foreground">{thread.assignee.name}</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </button>
  )
}
