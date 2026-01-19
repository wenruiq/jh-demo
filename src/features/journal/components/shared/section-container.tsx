import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/shared/lib/utils"

interface SectionContainerProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  contentClassName?: string
  collapsible?: boolean
  headerAction?: React.ReactNode
}

export function SectionContainer({
  title,
  children,
  defaultOpen = true,
  className,
  contentClassName,
  collapsible = true,
  headerAction,
}: SectionContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <div className={cn("mt-5", className)}>
        <div className="flex h-9 items-center justify-between gap-2 border-border/60 border-t bg-muted/40 px-6">
          <h3 className="font-medium text-foreground/80 text-sm">{title}</h3>
          {headerAction && <div className="flex items-center">{headerAction}</div>}
        </div>
        <div className={cn("px-6 py-4", contentClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <Collapsible className={cn("mt-3", className)} onOpenChange={setIsOpen} open={isOpen}>
      <div className="flex items-center justify-between border-border/60 border-t bg-muted/40 px-6">
        <CollapsibleTrigger className="group -ml-6 flex h-9 flex-1 items-center gap-2 pl-6 transition-colors hover:bg-muted/70">
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <h3 className="font-medium text-foreground/80 text-sm">{title}</h3>
        </CollapsibleTrigger>
        {headerAction && <div className="flex items-center">{headerAction}</div>}
      </div>
      <CollapsibleContent>
        <div className={cn("px-6 py-4", contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
