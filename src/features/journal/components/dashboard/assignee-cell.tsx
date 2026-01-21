import { Network, Users } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getTeamMembers, type TeamMember } from "../../data/team-project-data"
import type { Assignee } from "../../types/dashboard"

interface AssigneeCellProps {
  assignee: Assignee
}

// Role badge variant mapping
const ROLE_VARIANTS: Record<TeamMember["role"], "default" | "secondary" | "outline"> = {
  Admin: "default",
  Ops: "secondary",
  Member: "outline",
}

// Fallback avatar for users without one
const FALLBACK_AVATAR = "https://i.pravatar.cc/150?u=default"

// User list item for popovers
function UserListItem({
  user,
  showRole = false,
  role,
}: {
  user: { fullname: string; avatar?: string; username?: string }
  showRole?: boolean
  role?: TeamMember["role"]
}) {
  const avatarSrc = user.avatar ?? FALLBACK_AVATAR

  return (
    <div className="flex items-center gap-2 py-1.5">
      <img
        alt={user.fullname}
        className="h-7 w-7 rounded-full object-cover"
        height={28}
        src={avatarSrc}
        width={28}
      />
      <div className="flex flex-1 flex-col">
        <span className="font-medium text-sm leading-tight">{user.fullname}</span>
        {user.username && <span className="text-muted-foreground text-xs">@{user.username}</span>}
      </div>
      {showRole && role && (
        <Badge className="text-[10px]" variant={ROLE_VARIANTS[role]}>
          {role}
        </Badge>
      )}
    </div>
  )
}

// Single user display with hover tooltip
function SingleUserCell({ user }: { user: { fullname: string; avatar?: string } }) {
  const avatarSrc = user.avatar ?? FALLBACK_AVATAR

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-default items-center gap-1.5">
            <img
              alt={user.fullname}
              className="h-6 w-6 rounded-full object-cover"
              height={24}
              src={avatarSrc}
              width={24}
            />
            <span className="max-w-[100px] truncate text-sm">{user.fullname}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex items-center gap-2">
            <img
              alt={user.fullname}
              className="h-8 w-8 rounded-full object-cover"
              height={32}
              src={avatarSrc}
              width={32}
            />
            <span className="font-medium">{user.fullname}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Multiple users display with clickable popover
function MultipleUsersCell({
  users,
}: {
  users: Array<{ id: string; fullname: string; avatar?: string; username?: string }>
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button
                className="flex cursor-pointer items-center rounded-md px-1 py-0.5 transition-colors hover:bg-muted"
                type="button"
              >
                <div className="flex -space-x-2">
                  {users.slice(0, 3).map((person) => (
                    <img
                      alt={person.fullname}
                      className="h-6 w-6 rounded-full border-2 border-background object-cover"
                      height={24}
                      key={person.id}
                      src={person.avatar ?? FALLBACK_AVATAR}
                      width={24}
                    />
                  ))}
                </div>
                <span className="ml-1.5 text-muted-foreground text-xs">{users.length}</span>
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="top">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{users.length} assignees - click to view</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex items-center gap-2 border-b pb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{users.length} Assignees</span>
        </div>
        <div className="max-h-64 space-y-0.5 overflow-auto">
          {users.map((person) => (
            <UserListItem key={person.id} user={person} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Team/Project display with clickable popover showing members
function TeamProjectCell({ team, project }: { team: string; project: string }) {
  const [open, setOpen] = useState(false)
  const members = getTeamMembers(team, project)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-muted"
                type="button"
              >
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[120px] truncate text-sm">
                  {team} / {project}
                </span>
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="top">
            <div className="flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5" />
              <span>
                {team} / {project} - {members.length} members
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="mb-2 flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{project}</span>
              <span className="text-muted-foreground text-xs">{team}</span>
            </div>
          </div>
          <Badge variant="secondary">{members.length} members</Badge>
        </div>
        {members.length > 0 ? (
          <div className="max-h-64 space-y-0.5 overflow-auto">
            {members.map((member) => (
              <UserListItem
                key={member.id}
                role={member.role}
                showRole
                user={{ ...member, avatar: member.avatar ?? FALLBACK_AVATAR }}
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-muted-foreground text-sm">No members found</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function AssigneeCell({ assignee }: AssigneeCellProps) {
  // Team assignment case
  if (assignee.teamAssignment) {
    return (
      <TeamProjectCell
        project={assignee.teamAssignment.project}
        team={assignee.teamAssignment.team}
      />
    )
  }

  const users = assignee.users
  if (!users || users.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  // Single user case
  if (users.length === 1) {
    return <SingleUserCell user={users[0]} />
  }

  // Multiple users case
  return <MultipleUsersCell users={users} />
}
