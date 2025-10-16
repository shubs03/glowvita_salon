
"use client";

import { Button } from "@repo/ui/button";
import Link from 'next/link';
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Menu, LogOut, User, Settings, CheckCircle, XCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@repo/store/hooks";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { LogoutConfirmationModal } from "@repo/ui/logout-confirmation-modal";
import { useState } from "react";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove('admin_access_token', { path: '/' });
      Cookies.remove('admin_access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('crm_access_token', { path: '/' });
      Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('token', { path: '/' });
      Cookies.remove('token', { path: '/', domain: window.location.hostname });
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('adminAuthState');
      localStorage.removeItem('crmAuthState');
      localStorage.removeItem('userAuthState');
      
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
      dispatch(clearAdminAuth());
      
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
    <header className="flex-shrink-0 sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between lg:justify-end">
      {/* Mobile Menu Button - shows on the left */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <ThemeToggle />
        
        {/* Notification Bell with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 rounded-full relative"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span> */}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle className="h-4 w-4"/></div>
                <div>
                    <p className="text-sm font-medium">New Appointment</p>
                    <p className="text-xs text-muted-foreground">Booking with John Doe at 2:00 PM.</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-600 p-2 rounded-full"><XCircle className="h-4 w-4"/></div>
                <div>
                    <p className="text-sm font-medium">Cancellation</p>
                    <p className="text-xs text-muted-foreground">Appointment with Jane Smith cancelled.</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-muted-foreground hover:text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={admin?.profileImage} alt={admin?.fullName || "User"} />
                <AvatarFallback>{(admin?.fullName || "A").charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/admin-roles">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutModal(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <LogoutConfirmationModal
          open={showLogoutModal}
          onOpenChange={setShowLogoutModal}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
        />
      </div>
    </header>
  );
}
