import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface SectionContainerProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  contentClassName?: string
  collapsible?: boolean
}

export function SectionContainer({
  title,
  children,
  defaultOpen = true,
  className,
  contentClassName,
  collapsible = true,
}: SectionContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <div className={cn("mt-2", className)}>
        <div className="flex h-9 items-center gap-2 border-border/60 border-b bg-muted/40 px-6">
          <h3 className="font-medium text-foreground/80 text-sm">{title}</h3>
        </div>
        <div className={cn("px-6 py-4", contentClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <Collapsible className={cn("mt-2", className)} onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger className="group flex h-9 w-full items-center gap-2 border-border/60 border-b bg-muted/40 px-6 transition-colors hover:bg-muted/70">
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        <h3 className="font-medium text-foreground/80 text-sm">{title}</h3>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("px-6 py-4", contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
