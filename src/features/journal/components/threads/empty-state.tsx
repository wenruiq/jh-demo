import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onNewThread: () => void
}

export function EmptyState({ onNewThread }: EmptyStateProps) {
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
