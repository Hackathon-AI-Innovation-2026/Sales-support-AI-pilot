"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BellIcon,
  ChevronRightIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  customers: "Customers",
  tasks: "Tasks",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = routeLabels[segment] ?? (segments[index - 1] === "leads" ? "Lead details" : segment);
    return { href, label };
  });
}

type HeaderProps = {
  onOpenNavigation: () => void;
};

export function Header({ onOpenNavigation }: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const breadcrumbs = getBreadcrumbs(pathname);
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenNavigation}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </Button>
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? <ChevronRightIcon aria-hidden className="shrink-0 text-muted-foreground" /> : null}
                  {last ? (
                    <span className="truncate font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <Link className="truncate text-muted-foreground hover:text-foreground" href={crumb.href}>
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Toggle theme" />} onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </TooltipTrigger>
          <TooltipContent>{isDark ? "Use light theme" : "Use dark theme"}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Notifications" />} />}>
              <BellIcon />
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
