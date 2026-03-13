
"use client";

import { Button } from "@repo/ui/button";
import Link from 'next/link';
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Menu, LogOut, User, CheckCircle, XCircle } from "lucide-react";
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
import RegionSelector from "./RegionSelector";
import { NotificationDropdown } from "./NotificationDropdown";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call the server-side logout API to clear HttpOnly cookies
      await fetch('/api/admin/auth/logout', { method: 'POST' });

      // Fallback: Remove all possible auth tokens from cookies (only works if not HttpOnly)
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
        <RegionSelector />
        <ThemeToggle />

        {/* Notification Bell with Dropdown */}
        <NotificationDropdown apiEndpoint="/api/admin/notifications" />

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
