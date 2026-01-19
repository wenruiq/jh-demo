import { CheckCircle2, ChevronRight, CircleDot, MessageSquare } from "lucide-react"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import type { Thread } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ThreadListItemProps {
  thread: Thread
  isSelected: boolean
  onClick: () => void
}

export function ThreadListItem({ thread, isSelected, onClick }: ThreadListItemProps) {
  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "border-primary/30 bg-muted/50"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="mt-0.5">
        {thread.status === "open" ? (
          <CircleDot className="h-4 w-4 text-info" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-success" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-sm">{thread.title}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
          <span className="truncate">{thread.author.name}</span>
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
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
