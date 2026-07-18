"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ChartNoAxesCombinedIcon,
  CheckSquare2Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  UsersRoundIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Array<"SALES" | "MANAGER" | "ADMIN">;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/leads",
    label: "Leads",
    icon: ChartNoAxesCombinedIcon,
    roles: ["SALES", "MANAGER", "ADMIN"],
  },
  {
    href: "/customers",
    label: "Customers",
    icon: UsersRoundIcon,
    roles: ["SALES", "MANAGER", "ADMIN"],
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: CheckSquare2Icon,
    roles: ["SALES", "MANAGER", "ADMIN"],
  },
];

type SidebarProps = {
  onNavigate?: () => void;
  onLogout?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm">
          S
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-white">SHB</p>
          <p className="truncate text-xs text-sidebar-foreground/70">Sales Copilot</p>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium tracking-[0.12em] text-sidebar-foreground/55 uppercase">
          Workspace
        </p>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground",
              )}
            >
              {active ? <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-primary" /> : null}
              <Icon aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <Avatar>
            <AvatarFallback>SV</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Sales Advisor</p>
            <p className="truncate text-xs text-sidebar-foreground/65">Sales team</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={onLogout}
          disabled={!onLogout}
        >
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
