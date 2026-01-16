import { useState } from "react"
import { ChevronDown, ChevronRight, Database, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [isDataExpanded, setIsDataExpanded] = useState(true)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <nav className="flex-1 p-2">
        <div>
          <button
            type="button"
            onClick={() => setIsDataExpanded(!isDataExpanded)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            {isDataExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Database className="h-4 w-4" />
            <span>Data</span>
          </button>
          {isDataExpanded && (
            <div className="ml-4 mt-1">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  "bg-primary/10 text-primary font-medium",
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Journal Entry</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
