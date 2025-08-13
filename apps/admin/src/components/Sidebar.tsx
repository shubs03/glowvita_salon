
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { sidebarNavItems, NavItem } from "@/lib/routes";
import { useAppSelector } from "@repo/store/hooks";
import { useEffect, useState } from "react";


// Mock hook to get user permissions. In a real app, this would come from your auth context/store.
const useUserPermissions = () => {
    // const user = useAppSelector(state => state.auth.user)
    // For demonstration, we'll mock the user and their permissions.
    // A 'superadmin' has all permissions.
    const mockUser = {
        role: "superadmin", // or 'admin', 'editor', etc.
        // permissions: ["dashboard", "customers", "vendors"] // for a non-superadmin
    };

    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (mockUser.role === 'superadmin') {
            setPermissions(sidebarNavItems.map(item => item.permission));
        } 
        // else {
        //     // In a real app, you'd fetch this from your user object
        //     setPermissions(mockUser.permissions);
        // }
    }, [mockUser.role]);

    return permissions;
};


export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const permissions = useUserPermissions();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  
  const visibleNavItems = sidebarNavItems.filter(item => permissions.includes(item.permission));

  const SidebarContent = () => (
    <div className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 ease-in-out h-full",
        isOpen ? "w-64" : "w-20",
        isMobile && "w-64"
    )}>
      <div className="flex-grow flex flex-col overflow-y-hidden">
        <div className="p-4 h-16 border-b flex items-center shrink-0 justify-between">
           <Link href="/" className="flex items-center gap-2">
            <h1 className={cn("text-xl font-bold font-headline text-primary", !isOpen && !isMobile && "lg:hidden")}>Admin</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
            >
            {isMobile ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
        <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? toggleSidebar : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-secondary text-primary",
                !isOpen && !isMobile && "justify-center"
              )}
            >
              <item.Icon className="h-4 w-4" />
              <span className={cn(!isOpen && !isMobile && "lg:hidden")}>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t mt-auto shrink-0">
        <Button variant="ghost" className={cn("w-full gap-3", isOpen || isMobile ? "justify-start" : "justify-center")} onClick={handleLogout}>
          <FaSignOutAlt className="h-4 w-4" />
          <span className={cn(!isOpen && !isMobile && "lg:hidden")}>Logout</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={toggleSidebar}></div>}
            <div className={cn(
                "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out lg:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </div>
        </>
    )
  }

  return (
    <div className="hidden lg:block">
        <SidebarContent />
    </div>
  );
}
