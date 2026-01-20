import { Network } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Assignee } from "../../types/dashboard"

interface AssigneeCellProps {
  assignee: Assignee
}

export function AssigneeCell({ assignee }: AssigneeCellProps) {
  // Team assignment case
  if (assignee.teamAssignment) {
    return (
      <div className="flex items-center gap-1.5">
        <Network className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[120px] truncate text-sm">
          {assignee.teamAssignment.team} / {assignee.teamAssignment.project}
        </span>
      </div>
    )
  }

  const users = assignee.users
  if (!users || users.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  // Single user case
  if (users.length === 1) {
    const person = users[0]
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <img
                alt={person.fullname}
                className="h-6 w-6 rounded-full object-cover"
                height={24}
                src={person.avatar}
                width={24}
              />
              <span className="max-w-[100px] truncate text-sm">{person.fullname}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{person.fullname}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Multiple users case - same size avatars
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {users.slice(0, 3).map((person) => (
                <img
                  alt={person.fullname}
                  className="h-6 w-6 rounded-full border-2 border-background object-cover"
                  height={24}
                  key={person.id}
                  src={person.avatar}
                  width={24}
                />
              ))}
            </div>
            <span className="ml-1.5 text-muted-foreground text-xs">+{users.length}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-0.5">
            {users.map((person) => (
              <span key={person.id}>{person.fullname}</span>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
