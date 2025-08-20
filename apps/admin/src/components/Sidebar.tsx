
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { sidebarNavItems } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@repo/store/hooks";
import { clearAdminAuth } from "@repo/store/slices/auth";
import Cookies from "js-cookie";

export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, isLoading } = useAuth();

  const handleLogout = async () => {
    // Clear client-side state
    dispatch(clearAdminAuth());
    
    // Remove the cookie
    Cookies.remove('admin_access_token');
    
    // Redirect to login page
    router.push('/login');
    router.refresh(); // Important to ensure middleware re-validates
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
        isMobile && "w-64"
    )}>
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
        {/* Header Section - Fixed height */}
        <div className="flex-shrink-0 p-4 h-16 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <h1 className={cn(
              "text-xl font-bold font-headline text-primary truncate", 
              !isOpen && !isMobile && "lg:hidden"
            )}>
              Admin
            </h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={toggleSidebar}
          >
            {isMobile ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>

        {/* Navigation Section - Scrollable */}
        <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden min-h-0 no-scrollbar">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? toggleSidebar : undefined}
              className={cn(
                "flex items-center text-sm gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary min-w-0",
                pathname === item.href && "bg-secondary text-primary",
                !isOpen && !isMobile && "justify-center"
              )}
            >
              <item.Icon className="h-4 w-4 flex-shrink-0" />
              <span className={cn(
                "truncate",
                !isOpen && !isMobile && "lg:hidden"
              )}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer Section - Fixed */}
        <div className="flex-shrink-0 p-4 border-t">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full gap-3 min-w-0", 
              isOpen || isMobile ? "justify-start" : "justify-center"
            )} 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="h-4 w-4 flex-shrink-0" />
            <span className={cn(
              "truncate",
              !isOpen && !isMobile && "lg:hidden"
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
        {/* Backdrop overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden" 
            onClick={toggleSidebar}
          />
        )}
        {/* Mobile sidebar */}
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
    <div className="hidden lg:block h-full flex-shrink-0 overflow-hidden">
      <SidebarContent />
    </div>
  );
}
