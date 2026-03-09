import { FileText, Loader2, Paperclip, Send, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { generateAttachmentId, MOCK_FILES } from "@/features/journal/components/threads/utils"
import { useRichThreadsStore } from "@/features/journal/state/rich-threads-store"
import type { ThreadAttachment } from "@/features/journal/state/threads-store"

interface ReplyInputProps {
  threadId: string
}

const EMPTY_HTML = "<p></p>"

export function RichReplyInput({ threadId }: ReplyInputProps) {
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<ThreadAttachment[]>([])
  const { addReply, loading } = useRichThreadsStore()
  const isSubmitting = loading.addReply === threadId

  const hasContent = content.length > 0 && content !== EMPTY_HTML

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
    if (!hasContent || isSubmitting) {
      return
    }

    await addReply(threadId, content, attachments)
    setContent("")
    setAttachments([])
    toast.success("Reply sent", {
      description: "Your reply has been added to the thread",
    })
  }

  return (
    <div className="space-y-2 border-t pt-3 pb-16">
      <RichTextEditor
        content={content}
        disabled={isSubmitting}
        onChange={setContent}
        placeholder="Write a reply..."
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
          disabled={!hasContent || isSubmitting}
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
