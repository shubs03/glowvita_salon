
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { 
  FaSignOutAlt, 
  FaBars, FaTimes
} from 'react-icons/fa';
import { useAppDispatch } from "@repo/store/hooks";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import Cookies from "js-cookie";
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';

export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, permissions, role, isLoading } = useCrmAuth();

  const handleLogout = async () => {
    dispatch(clearCrmAuth());
    Cookies.remove('crm_access_token', { path: '/' });
    router.push('/login');
    router.refresh();
  };
  
  if (isLoading) {
    return null; // Or a loading skeleton
  }

  const getNavItemsForRole = () => {
    const userPermissions = permissions || [];
    
    switch (role) {
      case 'vendor':
        return vendorNavItems;
      case 'staff':
        return vendorNavItems.filter(item => userPermissions.includes(item.permission));
      case 'doctor':
        return doctorNavItems;
      case 'supplier':
        return supplierNavItems;
      default:
        return [];
    }
  };

  const visibleNavItems = getNavItemsForRole();

  const SidebarContent = () => (
    <div className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 ease-in-out h-full overflow-hidden",
        isOpen ? "w-64" : "w-20",
        isMobile && "w-64"
    )}>
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
        <div className="flex-shrink-0 p-4 h-16 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <h1 className={cn(
              "text-xl font-bold font-headline text-primary truncate", 
              !isOpen && !isMobile && "lg:hidden"
            )}>
              Vendor CRM
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

        <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden min-h-0 no-scrollbar">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? toggleSidebar : undefined}
              className={cn(
                "flex items-center text-sm gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-secondary hover:text-primary min-w-0",
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
    <div className="hidden lg:block h-full flex-shrink-0 overflow-hidden">
      <SidebarContent />
    </div>
  );
}
