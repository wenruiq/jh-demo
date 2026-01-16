import { Landmark, User } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          <Landmark className="h-5 w-5" />
        </div>
        <span className="font-semibold text-lg">One Finance</span>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
    </header>
  )
}
