import { FileText } from "lucide-react"
import { RichTextContent } from "@/components/ui/rich-text-content"
import { formatTimeAgo } from "@/features/journal/components/threads/utils"
import type { ThreadReply } from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ReplyItemProps {
  reply: ThreadReply
}

export function RichReplyItem({ reply }: ReplyItemProps) {
  return (
    <div className="rounded-lg border p-3">
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{reply.author.name}</span>
            <span className="text-muted-foreground text-xs">
              · {formatTimeAgo(reply.createdAt)}
            </span>
          </div>
          <div className="mt-1.5">
            <RichTextContent content={reply.content} />
          </div>
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
