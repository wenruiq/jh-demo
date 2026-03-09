import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/features/journal/components/threads/empty-state"
import { ThreadListItem } from "@/features/journal/components/threads/thread-list-item"
import { RichNewThreadDialog } from "@/features/journal/components/threads-rich/new-thread-dialog"
import { RichThreadDetail } from "@/features/journal/components/threads-rich/thread-detail"
import { useRichThreadsStore } from "@/features/journal/state/rich-threads-store"

export function RichThreadsTab() {
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { threads, selectedThreadId, setSelectedThreadId } = useRichThreadsStore()

  const selectedThread = threads.find((t) => t.id === selectedThreadId)

  if (selectedThread) {
    return <RichThreadDetail thread={selectedThread} />
  }

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
          <div className="space-y-2 pb-20">
            {threads.map((thread) => (
              <ThreadListItem
                isSelected={selectedThreadId === thread.id}
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

      <RichNewThreadDialog onOpenChange={setShowNewDialog} open={showNewDialog} />
    </div>
  )
}
