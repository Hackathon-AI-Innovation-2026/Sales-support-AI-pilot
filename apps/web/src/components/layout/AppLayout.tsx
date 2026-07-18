"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = React.useState(false);

  return (
    <div className="min-h-dvh bg-background lg:pl-72">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>
      <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setMobileNavigationOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-dvh flex-col">
        <Header onOpenNavigation={() => setMobileNavigationOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
