import { Moon, Sun, TrendingUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/shared/state/theme-store"

export function Header() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="font-semibold text-lg">One Finance</span>
      </div>
      <div className="flex items-center gap-2">
        <Button className="h-9 w-9" onClick={toggleTheme} size="icon" variant="ghost">
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
