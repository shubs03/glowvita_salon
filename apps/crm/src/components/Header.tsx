
"use client";

import { Button } from "@repo/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';

export function Header({ toggleSidebar }: { toggleSidebar: () => void, isSidebarOpen: boolean }) {
  const pathname = usePathname();
  const allNavItems = [...vendorNavItems, ...doctorNavItems, ...supplierNavItems];
  const currentPage = allNavItems.find(item => pathname.startsWith(item.href) && item.href !== '/');
  const pageTitle = currentPage ? currentPage.title : (pathname.startsWith('/calendar/') ? 'Daily Schedule' : 'Dashboard');

  return (
    <header className="flex-shrink-0 sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between overflow-hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
