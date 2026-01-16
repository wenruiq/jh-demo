import { ChevronDown, ChevronRight, Database, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [isDataExpanded, setIsDataExpanded] = useState(true)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <nav className="flex-1 p-2">
        <div>
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-medium text-muted-foreground text-sm hover:bg-muted"
            onClick={() => setIsDataExpanded(!isDataExpanded)}
            type="button"
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
            <div className="mt-1 ml-4">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  "bg-primary/10 font-medium text-primary"
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
