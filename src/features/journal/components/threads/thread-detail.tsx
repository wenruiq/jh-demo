import { ArrowLeft, CheckCircle2, CircleDot, Loader2, MessageSquare, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReplyInput } from "@/features/journal/components/threads/reply-input"
import { ReplyItem } from "@/features/journal/components/threads/reply-item"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import type { Thread, ThreadReply } from "@/features/journal/state/threads-store"
import { useThreadsStore } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ThreadDetailProps {
  thread: Thread
}

export function ThreadDetail({ thread }: ThreadDetailProps) {
  const { resolveThread, reopenThread, setSelectedThreadId, loading } = useThreadsStore()
  const isResolving = loading.resolveThread === thread.id
  const isReopening = loading.reopenThread === thread.id

  const handleStatusToggle = async () => {
    if (thread.status === "open") {
      await resolveThread(thread.id)
      toast.success("Thread resolved", {
        description: "Discussion marked as complete",
      })
    } else {
      await reopenThread(thread.id)
      toast.success("Thread reopened", {
        description: "Discussion is now active again",
      })
    }
  }

  const sortedReplies = [...thread.replies].sort((a: ThreadReply, b: ThreadReply) => {
    if (a.isAccepted) {
      return -1
    }
    if (b.isAccepted) {
      return 1
    }
    return 0
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          className="h-7 w-7 p-0"
          onClick={() => setSelectedThreadId(null)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm">Thread</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight">{thread.title}</h3>
            <Badge className="shrink-0" variant={thread.status === "open" ? "blue" : "success"}>
              {thread.status === "open" ? (
                <>
                  <CircleDot className="mr-1 h-3 w-3" />
                  Open
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Resolved
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-medium text-[10px] text-white",
                thread.author.avatarColor
              )}
            >
              {thread.author.avatar}
            </div>
            <span>{thread.author.name}</span>
            <span>·</span>
            <span>{formatTimeAgo(thread.createdAt)}</span>
          </div>
          <p className="mt-3 text-sm">{thread.description}</p>
          <div className="mt-3">
            <Button
              className="h-8 gap-1.5 text-xs"
              disabled={isResolving || isReopening}
              onClick={handleStatusToggle}
              size="sm"
              variant="outline"
            >
              {(isResolving || isReopening) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {!(isResolving || isReopening) && thread.status === "open" && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Resolved
                </>
              )}
              {!(isResolving || isReopening) && thread.status === "resolved" && (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reopen
                </>
              )}
            </Button>
          </div>
        </div>

        {sortedReplies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
              </span>
            </div>
            {sortedReplies.map((reply) => (
              <ReplyItem
                canAccept={thread.status === "open"}
                key={reply.id}
                reply={reply}
                threadId={thread.id}
              />
            ))}
          </div>
        )}
      </div>

      <ReplyInput threadId={thread.id} />
    </div>
  )
}
