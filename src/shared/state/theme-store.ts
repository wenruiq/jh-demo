import { create } from "zustand"

type Theme = "light" | "dark"

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light"
  }
  const stored = localStorage.getItem("theme") as Theme | null
  if (stored === "light" || stored === "dark") {
    return stored
  }
  return "light"
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return
  }
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(theme)
  localStorage.setItem("theme", theme)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light"
    applyTheme(newTheme)
    set({ theme: newTheme })
  },
}))

if (typeof window !== "undefined") {
  applyTheme(getInitialTheme())
}
