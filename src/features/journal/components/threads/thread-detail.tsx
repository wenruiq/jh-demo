import {
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  UserCog,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChangeAssigneeDialog } from "@/features/journal/components/threads/change-assignee-dialog"
import { ReplyInput } from "@/features/journal/components/threads/reply-input"
import { ReplyItem } from "@/features/journal/components/threads/reply-item"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import type { Thread, ThreadStatus } from "@/features/journal/state/threads-store"
import { useThreadsStore } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ThreadDetailProps {
  thread: Thread
}

const STATUS_CONFIG: Record<
  ThreadStatus,
  { label: string; variant: "warning" | "blue" | "success" }
> = {
  pending: { label: "Pending", variant: "warning" },
  review: { label: "Review", variant: "blue" },
  resolved: { label: "Resolved", variant: "success" },
}

const NEXT_STATUS_LABEL: Record<ThreadStatus, string> = {
  pending: "Ready for Review",
  review: "Mark Resolved",
  resolved: "Resolved",
}

export function ThreadDetail({ thread }: ThreadDetailProps) {
  const [showAssigneeDialog, setShowAssigneeDialog] = useState(false)
  const { advanceStatus, revertToPending, setSelectedThreadId, loading } = useThreadsStore()
  const isAdvancing = loading.resolveThread === thread.id
  const isReverting = loading.reopenThread === thread.id
  const isBusy = isAdvancing || isReverting

  const statusConfig = STATUS_CONFIG[thread.status]
  const canAdvance = thread.status !== "resolved"
  const canRevert = thread.status !== "pending"

  const handleAdvance = async () => {
    await advanceStatus(thread.id)
    const nextLabel = thread.status === "pending" ? "Review" : "Resolved"
    toast.success(`Status updated to ${nextLabel}`, {
      description: "Thread status has been advanced",
    })
  }

  const handleRevert = async () => {
    await revertToPending(thread.id)
    toast.success("Status reverted to Pending", {
      description: "Thread has been moved back to pending",
    })
  }

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
        {/* Header: status + assignee row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">Assigned to</span>
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-medium text-[10px] text-white",
                thread.assignee.avatarColor
              )}
            >
              {thread.assignee.avatar}
            </div>
            <span className="font-medium text-xs">{thread.assignee.name}</span>
            <Button
              className="h-5 w-5 p-0"
              onClick={() => setShowAssigneeDialog(true)}
              size="sm"
              variant="ghost"
            >
              <UserCog className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Thread content */}
        <div className="mb-4">
          <h3 className="mb-1.5 font-semibold text-base leading-tight">{thread.title}</h3>
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

          {/* Thread attachments */}
          {thread.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {thread.attachments.map((att) => (
                <div
                  className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs"
                  key={att.id}
                >
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-[150px] truncate">{att.filename}</span>
                  <span className="text-muted-foreground">({att.size})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status actions — visually separated */}
        {(canAdvance || canRevert) && (
          <div className="mb-4 flex items-center gap-2 border-t pt-3">
            {canAdvance && (
              <Button
                className="h-8 gap-1.5 text-xs"
                disabled={isBusy}
                onClick={handleAdvance}
                size="sm"
                variant="outline"
              >
                {isAdvancing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {NEXT_STATUS_LABEL[thread.status]}
                  </>
                )}
              </Button>
            )}
            {canRevert && (
              <Button
                className="h-8 gap-1.5 text-xs"
                disabled={isBusy}
                onClick={handleRevert}
                size="sm"
                variant="ghost"
              >
                {isReverting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revert to Pending
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {thread.replies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
              </span>
            </div>
            {thread.replies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>

      <ReplyInput threadId={thread.id} />

      <ChangeAssigneeDialog
        currentAssignee={thread.assignee}
        onOpenChange={setShowAssigneeDialog}
        open={showAssigneeDialog}
        threadId={thread.id}
      />
    </div>
  )
}
