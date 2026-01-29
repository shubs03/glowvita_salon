
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

export function Sidebar({ isOpen, toggleSidebar, isMobile, isSubExpired, className }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean, isSubExpired: boolean, className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, permissions, role, isLoading } = useCrmAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove('crm_access_token', { path: '/' });
      Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('token', { path: '/' });
      Cookies.remove('token', { path: '/', domain: window.location.hostname });
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('crmAuthState');
      localStorage.removeItem('userAuthState');
      localStorage.removeItem('adminAuthState');
      
      // Clear any other possible tokens
      Object.keys(localStorage).forEach(key => {
        if (key.includes('token') || key.includes('auth')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove localStorage item: ${key}`, e);
          }
        }
      });

      // This action will now trigger the root reducer to reset the entire state
      dispatch(clearCrmAuth());
      
      // Redirect to login page after state is cleared
      router.push('/login');
      // Force a page refresh to ensure all state is cleared
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there was an error
      router.push('/login');
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
        "bg-background border-r border-border flex flex-col h-full overflow-hidden relative transition-all duration-300",
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
                  <span className="font-bold tracking-tight text-foreground text-4 transition-all duration-300">
                    GlowVita
                  </span>
                )}
            </Link>
            {/* Toggle Button - Always Visible */}
            <Button
                variant="ghost"
                size="icon"
                className="group relative rounded-lg transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-accent flex-shrink-0"
                onClick={toggleSidebar}
            >

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
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary font-medium">
                      {(user?.businessName || user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg shadow-green-500/50"></div> */}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate transition-transform duration-300">
                      {user?.businessName || user?.name}
                    </p>
                    {/* <div className="px-2 py-0.5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full border border-primary/20">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {role === 'vendor' ? 'PRO' : role?.charAt(0).toUpperCase() + role?.slice(1)}
                      </span>
                    </div> */}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {role?.charAt(0).toUpperCase() + role?.slice(1)} Account
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center group">
                <div className="relative">
                  <Avatar className="h-12 w-12 border border-border transition-all duration-300">
                    <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary font-bold">
                      {(user?.businessName || user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-background animate-pulse"></div>
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary rounded-full border border-primary">
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
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Menu</p>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {visibleNavItems.map((item, index) => {
            const isActive = (pathname.startsWith(item.href) && item.href !== '/') || (pathname === '/' && item.href === '/');
            const isDisabled = isSubExpired && item.href !== '/salon-profile';
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                  if (isMobile && !isDisabled) toggleSidebar();
                }}
                className={cn(
                  "group flex items-center text-sm rounded-xl transition-all duration-300 min-w-0 relative overflow-hidden",
                  isOpen ? "gap-3 px-3 py-3 mx-0" : "justify-center px-2 py-3 mx-0",
                  isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  isActive && !isDisabled && "bg-primary text-primary-foreground font-semibold"
                )}
                title={!isOpen ? item.title : undefined}
              >
                {/* Icon Container - Enhanced */}
                <div className={cn(
                  "relative z-10 rounded-lg transition-all duration-300 flex-shrink-0",
                  "bg-muted border border-border",
                  isActive && "bg-primary text-primary-foreground",
                  isOpen ? "p-2" : "p-2.5"
                )}>
                  <item.Icon className={cn(
                    "transition-all duration-300",
                    isOpen ? "h-4 w-4" : "h-5 w-5",
                    isActive && "text-primary-foreground"
                  )} />
                </div>
                
                {/* Text with smooth transitions */}
                <div className={cn(
                  "relative z-10 transition-all duration-300 overflow-hidden",
                  isOpen ? "opacity-100 flex-1" : "opacity-0 w-0"
                )}>
                  <span className={cn(
                    "font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap",
                    isActive && "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-primary-foreground"
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
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Section - Enhanced for Both States */}
        <div className={cn(
          "flex-shrink-0 border-t border-border transition-all duration-300",
          isOpen ? "p-4" : "py-4 px-3"
        )}>
          <Button 
            variant="ghost" 
            className={cn(
              "group w-full rounded-md text-foreground hover:bg-accent font-medium",
              isOpen ? "gap-3 justify-start py-3" : "justify-center py-3 px-2"
            )} 
            onClick={() => setShowLogoutModal(true)}
            title={!isOpen ? "Sign Out" : undefined}
          >
            <LogOut className={cn(
              "transition-all duration-300 mr-2",
              isOpen ? "h-4 w-4" : "h-5 w-5"
            )} />
            
            {/* Text with smooth transition */}
            <div className={cn(
              "relative z-10 transition-all duration-300 overflow-hidden",
              isOpen ? "opacity-100 flex-1" : "opacity-0 w-0"
            )}>
              <span className="font-medium transition-all duration-300 whitespace-nowrap">
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
    <div className={cn("hidden lg:block h-full flex-shrink-0 fixed top-0 left-0 z-40", className)}>
      <SidebarContent />
    </div>
  );
}
