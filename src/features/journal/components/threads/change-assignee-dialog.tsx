import { Check, Loader2, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DEMO_USERS,
  type ThreadAuthor,
  useThreadsStore,
} from "@/features/journal/state/threads-store"
import { cn } from "@/shared/lib/utils"

interface ChangeAssigneeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  threadId: string
  currentAssignee: ThreadAuthor
}

export function ChangeAssigneeDialog({
  open,
  onOpenChange,
  threadId,
  currentAssignee,
}: ChangeAssigneeDialogProps) {
  const [search, setSearch] = useState("")
  const { changeAssignee, loading } = useThreadsStore()
  const isChanging = loading.changeAssignee === threadId

  const filteredUsers = DEMO_USERS.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = async (user: ThreadAuthor) => {
    if (user.name === currentAssignee.name || isChanging) {
      return
    }
    await changeAssignee(threadId, user)
    toast.success("Assignee updated", {
      description: `Thread assigned to ${user.name}`,
    })
    setSearch("")
    onOpenChange(false)
  }

  const handleClose = () => {
    if (!isChanging) {
      setSearch("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Assignee</DialogTitle>
          <DialogDescription>Select a user to assign this thread to.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              disabled={isChanging}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              value={search}
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto rounded-md border">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = user.name === currentAssignee.name
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                      isSelected && "bg-muted/30",
                      isChanging && "pointer-events-none opacity-50"
                    )}
                    key={user.name}
                    onClick={() => handleSelect(user)}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-medium text-white text-xs",
                        user.avatarColor
                      )}
                    >
                      {user.avatar}
                    </div>
                    <span className="flex-1 text-sm">{user.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                    {isChanging && user.name !== currentAssignee.name && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
