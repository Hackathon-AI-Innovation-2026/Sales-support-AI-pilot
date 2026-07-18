"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, Bell, Sun, Moon, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuClick?: () => void
}

const mockNotifications = [
  {
    id: 1,
    title: "High Lead Score Detected",
    description: "Nguyễn Văn B scored 87/100 for Visa Platinum card.",
    time: "10 mins ago",
    type: "score",
  },
  {
    id: 2,
    title: "Next Best Action Pending",
    description: "Call customer Trần Thị C to discuss Auto Loan program.",
    time: "1 hr ago",
    type: "action",
  },
  {
    id: 3,
    title: "Task Assigned",
    description: "Manager assigned task: 'Send email follow-up'.",
    time: "2 hrs ago",
    type: "task",
  },
]

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Parse path to generate breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) return [{ label: "Dashboard", href: "/", isLast: true }]

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      // Capitalize first letter and handle custom label names
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (segment.toLowerCase() === "leads") label = "Leads"
      if (segment.toLowerCase() === "customers") label = "Customers"
      if (segment.toLowerCase() === "tasks") label = "Tasks"
      if (segment.toLowerCase() === "dashboard") label = "Dashboard"

      return { label, href, isLast: index === segments.length - 1 }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-card border-b border-border transition-colors duration-200">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground hover:text-foreground h-9 w-9"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
              {crumb.isLast ? (
                <span className="text-foreground font-semibold">{crumb.label}</span>
              ) : (
                <span className="hover:text-foreground transition-colors cursor-default">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Actions (Theme switcher, Notifications) */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full"
            title="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </Button>
        )}

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground h-9 w-9 rounded-full relative hover:bg-muted transition-colors cursor-pointer outline-none"
            title="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] p-2 bg-card border border-border">
            <DropdownMenuLabel className="flex justify-between items-center py-2 px-3 text-sm font-semibold">
              <span>Notifications</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                3 New
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            
            <div className="space-y-1 my-1 max-h-[300px] overflow-y-auto">
              {mockNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex gap-3 items-start p-3 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notif.type === "score" && (
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    {notif.type === "action" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    {notif.type === "task" && (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-none">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                    <span className="text-[9px] text-zinc-400 block font-medium">
                      {notif.time}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
