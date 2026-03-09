import { Check, FileText, Loader2, Paperclip, Search, X } from "lucide-react"
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
import { generateAttachmentId, MOCK_FILES } from "@/features/journal/components/threads/utils"
import {
  DEMO_USERS,
  type ThreadAttachment,
  type ThreadAuthor,
  useThreadsStore,
} from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Default assignee (journal preparer)
const DEFAULT_ASSIGNEE = DEMO_USERS[0] // Sarah Mitchell

export function NewThreadDialog({ open, onOpenChange }: NewThreadDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [attachments, setAttachments] = useState<ThreadAttachment[]>([])
  const [assignee, setAssignee] = useState<ThreadAuthor>(DEFAULT_ASSIGNEE)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const { createThread, loading } = useThreadsStore()
  const isSubmitting = loading.createThread

  const filteredUsers = DEMO_USERS.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  )

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
    if (!(title.trim() && description.trim()) || isSubmitting) {
      return
    }

    await createThread(title.trim(), description.trim(), attachments, assignee)
    setTitle("")
    setDescription("")
    setAttachments([])
    setAssignee(DEFAULT_ASSIGNEE)
    setShowUserSearch(false)
    setUserSearch("")
    onOpenChange(false)
    toast.success("Thread created", {
      description: `Assigned to ${assignee.name}`,
    })
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("")
      setDescription("")
      setAttachments([])
      setAssignee(DEFAULT_ASSIGNEE)
      setShowUserSearch(false)
      setUserSearch("")
      onOpenChange(false)
    }
  }

  const handleSelectAssignee = (user: ThreadAuthor) => {
    setAssignee(user)
    setShowUserSearch(false)
    setUserSearch("")
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
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
              id="thread-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your concern or question..."
              value={description}
            />
          </div>

          {/* Assignee selector */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">Assignee</span>
            <div className="relative">
              <button
                className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                disabled={isSubmitting}
                onClick={() => setShowUserSearch(!showUserSearch)}
                type="button"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium text-[10px] text-white",
                    assignee.avatarColor
                  )}
                >
                  {assignee.avatar}
                </div>
                <span>{assignee.name}</span>
              </button>

              {showUserSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  <div className="relative p-2">
                    <Search className="absolute top-4.5 left-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="h-8 pl-8 text-sm"
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      value={userSearch}
                    />
                  </div>
                  <div className="max-h-[160px] overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-3 text-center text-muted-foreground text-xs">
                        No users found
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = user.name === assignee.name
                        return (
                          <button
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                              isSelected && "bg-muted/30"
                            )}
                            key={user.name}
                            onClick={() => handleSelectAssignee(user)}
                            type="button"
                          >
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium text-[10px] text-white",
                                user.avatarColor
                              )}
                            >
                              {user.avatar}
                            </div>
                            <span className="flex-1">{user.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Attachments</span>
              <Button
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={isSubmitting}
                onClick={handleAddMockAttachment}
                size="sm"
                variant="ghost"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
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
