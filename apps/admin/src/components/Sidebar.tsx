
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { 
  LogOut,
  ChevronLeft,
  LayoutGrid
} from 'lucide-react';
import { sidebarNavItems } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@repo/store/hooks";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import Cookies from "js-cookie";


export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, isLoading } = useAuth();

  const handleLogout = async () => {
    dispatch(clearAdminAuth());
    Cookies.remove('admin_access_token');
    router.push('/login');
    router.refresh();
  };
  
  if (isLoading) {
    return null; // Or a loading skeleton
  }

  const permissions = admin?.permissions || [];
  const isSuperAdmin = admin?.roleName === 'superadmin';
  
  const visibleNavItems = isSuperAdmin 
    ? sidebarNavItems 
    : sidebarNavItems.filter(item => permissions.includes(item.permission));

  const SidebarContent = () => (
    <div className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 ease-in-out h-full overflow-hidden",
        isOpen ? "w-64" : "w-20",
    )}>
      <div className="flex flex-col flex-grow min-h-0">
        <div className={cn("flex-shrink-0 p-4 h-16 border-b flex items-center gap-3", isOpen ? "justify-between" : "justify-center")}>
            <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <LayoutGrid className="h-5 w-5" />
                </div>
                <span className={cn(!isOpen && "hidden")}>GlowVita</span>
            </Link>
          
            <Button
                variant="ghost"
                size="icon"
                className={cn("hidden lg:flex flex-shrink-0 text-muted-foreground", !isOpen && "rotate-180")}
                onClick={toggleSidebar}
            >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </div>

        <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden min-h-0 no-scrollbar">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? toggleSidebar : undefined}
              title={item.title}
              className={cn(
                "flex items-center text-sm gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-primary min-w-0 relative",
                pathname.startsWith(item.href) && item.href !== '/' && "bg-primary/10 text-primary font-semibold",
                pathname === '/' && item.href === '/' && "bg-primary/10 text-primary font-semibold",
                !isOpen && "justify-center"
              )}
            >
              <item.Icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "truncate",
                !isOpen && "hidden"
              )}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="flex-shrink-0 p-3 border-t">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full gap-3 min-w-0 text-muted-foreground hover:text-destructive", 
              isOpen || isMobile ? "justify-start" : "justify-center"
            )} 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={cn(
              "truncate",
              !isOpen && "hidden"
            )}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden" 
            onClick={toggleSidebar}
          />
        )}
        <div className={cn(
          "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <div className="hidden lg:block h-full flex-shrink-0 fixed top-0 left-0 z-40">
      <SidebarContent />
    </div>
  );
}
