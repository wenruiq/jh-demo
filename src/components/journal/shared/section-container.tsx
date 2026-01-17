import { ChevronDown } from "lucide-react"
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
      <div className={cn("border-b", className)}>
        <div className="flex h-10 items-center px-6">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <div className={cn("px-6 pb-4", contentClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <Collapsible className={cn("border-b", className)} onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger className="flex h-10 w-full items-center justify-between px-6 hover:bg-muted/50">
        <h3 className="font-medium text-sm">{title}</h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("px-6 pb-4", contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
