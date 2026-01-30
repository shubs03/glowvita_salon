
"use client";

import { Button } from "@repo/ui/button";
import Link from 'next/link';
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Menu, LogOut, User, Settings, CheckCircle, XCircle, Search, ChevronRight, Calendar, Clock, TrendingUp, ShoppingCart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@repo/store/hooks";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import Cookies from "js-cookie";
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@repo/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { LogoutConfirmationModal } from "@repo/ui/logout-confirmation-modal";
import { useState } from "react";
import { Cart } from "./cart/Cart";
import { useGetCartQuery } from "@repo/store/api";

export function Header({ toggleSidebar, subscription, isSubExpired }: { toggleSidebar: () => void, subscription: any, isSubExpired: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, role, isCrmAuthenticated } = useCrmAuth();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: cartData } = useGetCartQuery(user?._id, {
    skip: !isCrmAuthenticated || !user?._id,
  });

  const cartItemCount = cartData?.data?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  const getNavItemsForRole = () => {
    switch (role) {
      case 'vendor':
      case 'staff':
        return vendorNavItems;
      case 'doctor':
        return doctorNavItems;
      case 'supplier':
        return supplierNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItemsForRole();
  const currentPage = navItems.find(item => pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'))?.title || 'Dashboard';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove('crm_access_token', { path: '/' });
      Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });

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

  return (
    <header className="flex-shrink-0 sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-xl px-4 md:px-6 justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 lg:hidden hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg hover:scale-105"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        {/* Breadcrumb */}
        <div className="hidden lg:flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <span className="font-semibold text-primary">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 flex items-center justify-center lg:justify-start lg:ml-8">
        <div className="flex items-center gap-6">

          {/* --- DEBUG INFO --- */}
          {/* <div className="fixed top-20 right-4 bg-yellow-200 text-black p-2 rounded-lg shadow-lg z-50 text-xs">
            <p className="font-bold">Subscription Debug:</p>
            <p>isSubExpired: <span className="font-bold">{isSubExpired ? 'TRUE' : 'FALSE'}</span></p>
            <p>Status: {subscription?.status ?? 'N/A'}</p>
            <p>End Date: {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</p>
          </div> */}
          {/* --- END DEBUG INFO --- */}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex flex-shrink-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        <ThemeToggle />

        {/* Cart for Vendors */}
        {role === 'vendor' && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 rounded-lg relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {cartItemCount}
              </span>
            )}
            <span className="sr-only">Open Cart</span>
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 rounded-lg relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">3</span>
                </span>
              </div>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-xl border border-border/30 shadow-lg rounded-lg">
            <DropdownMenuLabel className="text-base font-bold border-b border-border/20 pb-3">
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">3 New</span>
              </div>
            </DropdownMenuLabel>
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="p-4 border-b border-border/10 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">New Appointment Confirmed</p>
                    <p className="text-xs text-muted-foreground mt-1">Booking with Sarah Johnson at 2:00 PM today.</p>
                    <p className="text-xs text-primary font-medium mt-2">5 minutes ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuItem className="justify-center text-sm text-primary hover:text-primary/80 font-semibold p-4 border-t border-border/20 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>View all notifications</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105">
              <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(user?.businessName || user?.name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border border-border/30 shadow-lg rounded-lg">
            <DropdownMenuLabel className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {(user?.businessName || user?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground truncate">{user?.businessName || user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="p-2">
              <DropdownMenuItem asChild className="rounded-md">
                <Link href="/salon-profile" className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/50 p-3 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="font-semibold group-hover:text-primary transition-colors duration-300">Preferences</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-100/50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 p-3 text-red-600 dark:text-red-400 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-500/20">
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="font-semibold group-hover:font-bold transition-all duration-300">Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <LogoutConfirmationModal
          open={showLogoutModal}
          onOpenChange={setShowLogoutModal}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
        />
        <Cart isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
      </div>
    </header>
  );
}
