"use client"

import * as React from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Mobile Sidebar (Slide-out drawer using shadcn Sheet) */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] focus:outline-none">
          {/* Add Screen Reader accessible titles */}
          <SheetTitle className="sr-only">SHB Copilot Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Access Dashboard, Leads, Customers, and Tasks pages.
          </SheetDescription>
          <Sidebar onClose={() => setMobileSidebarOpen(false)} className="w-full" />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar (Static on md+ screens) */}
      <Sidebar className="hidden md:flex flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Sticky Header */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-background relative focus:outline-none">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
