import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type DetailView, useJournalStore } from "@/store/journal-store"

interface ViewNavButtonProps {
  targetView: DetailView
  label: string
  variant?: "back" | "link"
}

export function ViewNavButton({ targetView, label, variant = "back" }: ViewNavButtonProps) {
  const setDetailView = useJournalStore((state) => state.setDetailView)

  const handleClick = () => {
    setDetailView(targetView)
  }

  if (variant === "link") {
    return (
      <Button className="h-8 gap-1.5 px-3 text-xs" onClick={handleClick} size="sm" variant="ghost">
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <Button className="h-8 gap-1.5 px-3 text-xs" onClick={handleClick} size="sm" variant="ghost">
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

interface ViewNavHeaderProps {
  children: React.ReactNode
}

export function ViewNavHeader({ children }: ViewNavHeaderProps) {
  return <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">{children}</div>
}
