
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Menu
} from 'lucide-react';
import { useAppDispatch } from "@repo/store/hooks";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import Cookies from "js-cookie";
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { LogoutConfirmationModal } from "@repo/ui/logout-confirmation-modal";
import { useState } from "react";

export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, permissions, role, isLoading } = useCrmAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      dispatch(clearCrmAuth());
      Cookies.remove('crm_access_token');
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
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
        "bg-background/90 backdrop-blur-xl border-r border-border/40 flex flex-col h-full overflow-hidden shadow-2xl shadow-black/10 relative transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:via-transparent before:to-primary/3 before:opacity-80 before:pointer-events-none",
        isOpen ? "w-64" : "w-20",
    )}>
      <div className="flex flex-col flex-grow min-h-0">
        <div className={cn(
          "flex-shrink-0 h-16 border-b border-border/20 bg-gradient-to-r from-primary/8 to-primary/3 flex items-center relative overflow-hidden",
          isOpen ? "px-4 justify-between" : "px-4 justify-center"
        )}>
            <Link href="/dashboard" className={cn(
              "group flex items-center font-bold text-lg font-headline text-foreground hover:text-primary transition-all duration-300 relative z-10",
              isOpen ? "gap-3" : "justify-center"
            )}>
                {/* <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-110 group-hover:rotate-3 flex-shrink-0">
                    <LayoutGrid className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                </div> */}
                {isOpen && (
                  <span className="font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent text-4 transition-all duration-300 group-hover:scale-105">
                    GlowVita
                  </span>
                )}
            </Link>
            {/* Toggle Button - Always Visible */}
            <Button
                variant="ghost"
                size="icon"
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm border border-border/30 shadow-md hover:shadow-lg text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 flex-shrink-0"
                onClick={toggleSidebar}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isOpen ? (
                  <ChevronLeft className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5" />
                ) : (
                  <ChevronRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
                <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'} sidebar</span>
            </Button>
        </div>

        {/* User Profile Section - Enhanced for Collapsed State */}
        {user && (
          <div className={cn(
            "flex-shrink-0 border-b border-border/20 transition-all duration-300",
            isOpen ? "p-4" : "py-4 px-3"
          )}>
            {isOpen ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                    <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold">
                      {(user?.businessName || user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg shadow-green-500/50"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent truncate group-hover:scale-105 transition-transform duration-300">
                      {user?.businessName || user?.name}
                    </p>
                    <div className="px-2 py-0.5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full border border-primary/20">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {role === 'vendor' ? 'PRO' : role?.charAt(0).toUpperCase() + role?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {role?.charAt(0).toUpperCase() + role?.slice(1)} Account
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center group">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                    <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold">
                      {(user?.businessName || user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg shadow-green-500/50"></div>
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full border border-primary/20 shadow-lg">
                    <span className="text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                      {role === 'vendor' ? 'P' : role?.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <nav className={cn(
          "flex-grow py-4 space-y-2 min-h-0 transition-all duration-300",
          "no-scrollbar overflow-y-auto overflow-x-hidden", // Remove scrollbar
          isOpen ? "px-4" : "px-3"
        )}>
          {/* Navigation Label - Enhanced */}
          <div className={cn(
            "transition-all duration-300 mb-4",
            isOpen ? "px-3 pb-3" : "px-1 pb-3"
          )}>
            {isOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full shadow-lg shadow-primary/30"></div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Menu</p>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent"></div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {visibleNavItems.map((item, index) => {
            const isActive = (pathname.startsWith(item.href) && item.href !== '/') || (pathname === '/' && item.href === '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? toggleSidebar : undefined}
                className={cn(
                  "group flex items-center text-sm rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary min-w-0 relative overflow-hidden",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-primary/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
                  isActive && "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border-r-2 border-primary shadow-lg shadow-primary/10",
                  isOpen ? "gap-3 px-3 py-3 mx-0" : "justify-center px-2 py-3 mx-0"
                )}
                title={!isOpen ? item.title : undefined}
              >
                {/* Icon Container - Enhanced */}
                <div className={cn(
                  "relative z-10 rounded-xl transition-all duration-300 flex-shrink-0 group-hover:scale-110",
                  "bg-background/80 backdrop-blur-sm border border-border/30 shadow-md group-hover:shadow-lg",
                  "group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:rotate-3",
                  isActive && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/40 shadow-lg shadow-primary/20",
                  isOpen ? "p-2" : "p-2.5"
                )}>
                  <item.Icon className={cn(
                    "transition-all duration-300 group-hover:rotate-12",
                    isOpen ? "h-4 w-4" : "h-5 w-5",
                    isActive && "text-primary"
                  )} />
                </div>
                
                {/* Text with smooth transitions */}
                <div className={cn(
                  "relative z-10 transition-all duration-300 overflow-hidden",
                  isOpen ? "opacity-100 flex-1" : "opacity-0 w-0"
                )}>
                  <span className={cn(
                    "font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap",
                    isActive && "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                  )}>
                    {item.title}
                  </span>
                </div>
                
                {/* Notification Badge - Enhanced */}
                {(item.title === 'Appointments' || item.title === 'Notifications') && (
                  <div className={cn(
                    "relative z-10 transition-all duration-300",
                    isOpen ? "ml-auto opacity-100" : "absolute top-2 right-2 opacity-100"
                  )}>
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Section - Enhanced for Both States */}
        <div className={cn(
          "flex-shrink-0 border-t border-border/20 bg-gradient-to-r from-muted/20 to-transparent transition-all duration-300",
          isOpen ? "p-4" : "py-4 px-3"
        )}>
          <Button 
            variant="ghost" 
            className={cn(
              "group w-full rounded-xl text-muted-foreground hover:text-destructive transition-all duration-300 hover:bg-destructive/10 font-medium relative overflow-hidden",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-destructive/10 before:to-destructive/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
              isOpen ? "gap-3 justify-start py-3" : "justify-center py-3 px-2"
            )} 
            onClick={() => setShowLogoutModal(true)}
            title={!isOpen ? "Sign Out" : undefined}
          >
            {/* Icon Container - Enhanced */}
            <div className={cn(
              "relative z-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/30 transition-all duration-300 flex-shrink-0",
              "group-hover:border-destructive/30 group-hover:bg-destructive/5 group-hover:scale-110 group-hover:rotate-3 shadow-md group-hover:shadow-lg",
              isOpen ? "p-2.5" : "p-3"
            )}>
              <LogOut className={cn(
                "transition-all duration-300 group-hover:rotate-12",
                isOpen ? "h-4 w-4" : "h-5 w-5"
              )} />
            </div>
            
            {/* Text with smooth transition */}
            <div className={cn(
              "relative z-10 transition-all duration-300 overflow-hidden",
              isOpen ? "opacity-100 flex-1" : "opacity-0 w-0"
            )}>
              <span className="font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap">
                Sign Out
              </span>
            </div>
          </Button>
        </div>
      </div>
      
      <LogoutConfirmationModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300" 
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
