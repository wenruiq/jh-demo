import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App.tsx"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

async function enableMocking() {
  // Only enable MSW in development
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser")
    return worker.start({
      onUnhandledRequest: "bypass",
    })
  }
}

enableMocking().then(() => {
  const rootElement = document.getElementById("root")
  if (!rootElement) throw new Error("Root element not found")

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
