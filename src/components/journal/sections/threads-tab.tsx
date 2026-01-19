import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  RotateCcw,
  Send,
  X,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  type Thread,
  type ThreadAttachment,
  type ThreadReply,
  useThreadsStore,
} from "@/store/threads-store"

// Mock file names for attachment demo
const MOCK_FILES = [
  { filename: "supporting_documentation.pdf", size: "1.4 MB" },
  { filename: "variance_analysis.xlsx", size: "856 KB" },
  { filename: "approval_memo.pdf", size: "234 KB" },
  { filename: "reconciliation_report.xlsx", size: "2.1 MB" },
]

// Format time ago string from a date (co-located with threads feature)
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return "just now"
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString()
}

// Generate a unique ID with prefix (co-located with threads feature)
function generateAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Empty state component
function EmptyState({ onNewThread }: { onNewThread: () => void }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed">
      <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm">No threads yet</p>
      <p className="mb-3 text-muted-foreground/70 text-xs">
        Start a discussion about this journal entry
      </p>
      <Button onClick={onNewThread} size="sm" variant="outline">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        New Thread
      </Button>
    </div>
  )
}

// Thread list item component
function ThreadListItem({
  thread,
  isSelected,
  onClick,
}: {
  thread: Thread
  isSelected: boolean
  onClick: () => void
}) {
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

// Reply component
function ReplyItem({
  reply,
  threadId,
  canAccept,
}: {
  reply: ThreadReply
  threadId: string
  canAccept: boolean
}) {
  const { acceptReply, unacceptReply, loading } = useThreadsStore()
  const isAccepting = loading.acceptReply === reply.id

  const handleAccept = async () => {
    if (reply.isAccepted) {
      await unacceptReply(threadId, reply.id)
      toast.success("Answer unaccepted", {
        description: "Reply is no longer marked as accepted",
      })
    } else {
      await acceptReply(threadId, reply.id)
      toast.success("Answer accepted", {
        description: "Reply marked as the accepted answer",
      })
    }
  }

  return (
    <div
      className={cn("rounded-lg border p-3", reply.isAccepted && "border-success/30 bg-success/5")}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-medium text-white text-xs",
            reply.author.avatarColor
          )}
        >
          {reply.author.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{reply.author.name}</span>
              <span className="text-muted-foreground text-xs">
                · {formatTimeAgo(reply.createdAt)}
              </span>
              {reply.isAccepted && (
                <Badge className="h-5 gap-1 px-1.5 text-[10px]" variant="success">
                  <Check className="h-3 w-3" />
                  Accepted
                </Badge>
              )}
            </div>
            {canAccept && (
              <Button
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={isAccepting}
                onClick={handleAccept}
                size="sm"
                variant={reply.isAccepted ? "ghost" : "outline"}
              >
                {isAccepting && <Loader2 className="h-3 w-3 animate-spin" />}
                {!isAccepting && reply.isAccepted && (
                  <>
                    <X className="h-3 w-3" />
                    Unaccept
                  </>
                )}
                {!(isAccepting || reply.isAccepted) && (
                  <>
                    <Check className="h-3 w-3" />
                    Accept
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-sm">{reply.content}</p>
          {reply.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {reply.attachments.map((att) => (
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
      </div>
    </div>
  )
}

// Reply input component
function ReplyInput({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<ThreadAttachment[]>([])
  const { addReply, loading } = useThreadsStore()
  const isSubmitting = loading.addReply === threadId

  const handleAddMockAttachment = () => {
    const randomFile = MOCK_FILES[Math.floor(Math.random() * MOCK_FILES.length)]
    const newAttachment: ThreadAttachment = {
      id: generateAttachmentId(),
      ...randomFile,
    }
    setAttachments((prev) => [...prev, newAttachment])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) {
      return
    }

    await addReply(threadId, content.trim(), attachments)
    setContent("")
    setAttachments([])
    toast.success("Reply sent", {
      description: "Your reply has been added to the thread",
    })
  }

  return (
    <div className="space-y-2 border-t pt-3 pb-16">
      <Textarea
        className="min-h-[80px] resize-none text-sm"
        disabled={isSubmitting}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        value={content}
      />
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs"
              key={att.id}
            >
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="max-w-[120px] truncate">{att.filename}</span>
              <button
                className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                onClick={() => handleRemoveAttachment(att.id)}
                type="button"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Button
          className="h-8 gap-1.5 px-2.5 text-xs"
          disabled={isSubmitting}
          onClick={handleAddMockAttachment}
          size="sm"
          variant="ghost"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach
        </Button>
        <Button
          className="h-8 gap-1.5"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Reply
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Thread detail view
function ThreadDetail({ thread }: { thread: Thread }) {
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

  // Sort replies with accepted answer first
  const sortedReplies = [...thread.replies].sort((a, b) => {
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
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Thread header */}
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

        {/* Replies */}
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

      {/* Reply input */}
      <ReplyInput threadId={thread.id} />
    </div>
  )
}

// New thread dialog
function NewThreadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const { createThread, loading } = useThreadsStore()
  const isSubmitting = loading.createThread

  const handleSubmit = async () => {
    if (!(title.trim() && description.trim()) || isSubmitting) {
      return
    }

    await createThread(title.trim(), description.trim())
    setTitle("")
    setDescription("")
    onOpenChange(false)
    toast.success("Thread created", {
      description: "New discussion started",
    })
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("")
      setDescription("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">New Thread</DialogTitle>
          <DialogDescription>
            Start a discussion about a concern or question regarding this journal entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" htmlFor="thread-title">
              Title
            </label>
            <Input
              disabled={isSubmitting}
              id="thread-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your concern..."
              value={title}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" htmlFor="thread-description">
              Description
            </label>
            <Textarea
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
              id="thread-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your concern or question..."
              value={description}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={isSubmitting} onClick={handleClose} size="sm" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={!(title.trim() && description.trim()) || isSubmitting}
            onClick={handleSubmit}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Thread</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main threads tab component
export function ThreadsTab() {
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { threads, selectedThreadId, setSelectedThreadId } = useThreadsStore()

  const selectedThread = threads.find((t) => t.id === selectedThreadId)

  // If a thread is selected, show detail view
  if (selectedThread) {
    return <ThreadDetail thread={selectedThread} />
  }

  // Otherwise show list view
  return (
    <div className="space-y-3">
      {threads.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              {threads.length} {threads.length === 1 ? "thread" : "threads"}
            </div>
            <Button
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={() => setShowNewDialog(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-3.5 w-3.5" />
              New Thread
            </Button>
          </div>
          <div className="space-y-2">
            {threads.map((thread) => (
              <ThreadListItem
                isSelected={false}
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                thread={thread}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState onNewThread={() => setShowNewDialog(true)} />
      )}

      <NewThreadDialog onOpenChange={setShowNewDialog} open={showNewDialog} />
    </div>
  )
}
