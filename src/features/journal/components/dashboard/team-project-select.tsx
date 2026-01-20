import { ChevronDown, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TEAM_PROJECT_MAP, TEAMS } from "../../data/team-project-data"
import type { TeamProject } from "../../types/dashboard"

interface TeamProjectSelectProps {
  value: TeamProject[]
  onChange: (value: TeamProject[]) => void
}

export function TeamProjectSelect({ value, onChange }: TeamProjectSelectProps) {
  const [open, setOpen] = useState(false)

  // Check if a team-project pair is selected
  const isSelected = (team: string, project: string): boolean => {
    return value.some((tp) => tp.team === team && tp.project === project)
  }

  // Toggle a team-project pair
  const toggleSelection = (team: string, project: string): void => {
    if (isSelected(team, project)) {
      onChange(value.filter((tp) => !(tp.team === team && tp.project === project)))
    } else {
      onChange([...value, { team, project }])
    }
  }

  // Clear all selections
  const clearAll = (): void => {
    onChange([])
  }

  // Display text for the trigger
  const displayText = useMemo(() => {
    if (value.length === 0) {
      return "Filter by Team / Project"
    }
    if (value.length === 1) {
      return `${value[0].team} / ${value[0].project}`
    }
    return `${value[0].team} / ${value[0].project} +${value.length - 1}`
  }, [value])

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-full justify-between gap-2 font-normal"
          size="sm"
          variant="outline"
        >
          <span className="truncate text-left">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{displayText}</span>
            ) : (
              displayText
            )}
          </span>
          <div className="flex items-center gap-1">
            {value.length > 0 && (
              <button
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearAll()
                }}
                tabIndex={-1}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {TEAMS.map((team, teamIndex) => (
          <div key={team}>
            {teamIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider">
              {team}
            </DropdownMenuLabel>
            {TEAM_PROJECT_MAP[team].map((project) => (
              <DropdownMenuCheckboxItem
                checked={isSelected(team, project)}
                key={`${team}:${project}`}
                onCheckedChange={() => toggleSelection(team, project)}
                onSelect={(e) => e.preventDefault()}
              >
                {project}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
