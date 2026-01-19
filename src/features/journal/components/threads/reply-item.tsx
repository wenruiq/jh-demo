import { Check, FileText, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import { type ThreadReply, useThreadsStore } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ReplyItemProps {
  reply: ThreadReply
  threadId: string
  canAccept: boolean
}

export function ReplyItem({ reply, threadId, canAccept }: ReplyItemProps) {
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
