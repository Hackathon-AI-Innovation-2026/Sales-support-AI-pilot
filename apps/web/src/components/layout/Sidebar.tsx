"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CheckSquare, Briefcase, LogOut, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Briefcase,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
]

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] w-64 select-none",
        className
      )}
    >
      {/* SHB Logo Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--sidebar-border)]">
        {/* SHB Logo Diamond Graphic */}
        <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 shadow-md">
          <span className="text-white font-bold text-lg tracking-wider">S</span>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--primary)] rounded-full border-2 border-[var(--sidebar)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-white">SHB Copilot</span>
          <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
            AI Sales Assistant
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-white"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-400" />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-amber-400" : "text-zinc-400 group-hover:text-white"
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Area with AI Pulse Card + Profile */}
      <div className="p-4 border-t border-[var(--sidebar-border)] space-y-4">
        {/* Signature AI Pulse Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-blue-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              AI Copilot Core
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="text-[9px] text-green-400 font-medium uppercase">Ready</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">Engine:</span>
              <span className="text-white font-medium">Gemini 3.5 Flash</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">API Status:</span>
              <span className="text-zinc-400">99.8%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">Latency:</span>
              <span className="text-green-400">24ms</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-1 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2.5 pl-1.5 py-1">
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                NA
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                Nguyễn Văn A
              </span>
              <span className="text-[9px] text-zinc-400 truncate max-w-[100px]">
                Sales Agent
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-white/10 w-8 h-8 rounded-md"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
