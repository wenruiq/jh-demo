import type { ReactNode } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
