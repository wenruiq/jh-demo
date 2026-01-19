import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { AppShell } from "@/app/app"
import { AppProviders, initializeMocks } from "@/app/providers"

initializeMocks().then(() => {
  const rootElement = document.getElementById("root")
  if (!rootElement) {
    throw new Error("Root element not found")
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </StrictMode>
  )
})
