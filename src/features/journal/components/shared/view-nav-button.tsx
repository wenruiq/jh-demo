import { ArrowLeft, FileSearch, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type DetailView, useJournalStore } from "@/features/journal/state/journal-store"

interface ViewNavButtonProps {
  targetView: DetailView
  label: string
  variant?: "back" | "view" | "return"
}

export function ViewNavButton({ targetView, label, variant = "back" }: ViewNavButtonProps) {
  const setDetailView = useJournalStore((state) => state.setDetailView)

  const handleClick = () => {
    setDetailView(targetView)
  }

  if (variant === "view") {
    return (
      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        onClick={handleClick}
        size="sm"
        variant="outline"
      >
        <FileSearch className="h-3.5 w-3.5" />
        {label}
      </Button>
    )
  }

  if (variant === "return") {
    return (
      <Button
        className="h-8 gap-1.5 px-3 text-xs"
        onClick={handleClick}
        size="sm"
        variant="outline"
      >
        <Undo2 className="h-3.5 w-3.5" />
        {label}
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
