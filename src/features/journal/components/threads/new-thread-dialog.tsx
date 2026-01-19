import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import { useThreadsStore } from "@/features/journal/state/threads-store"

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewThreadDialog({ open, onOpenChange }: NewThreadDialogProps) {
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
