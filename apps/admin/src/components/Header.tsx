"use client";

import { FaBell, FaBars } from "react-icons/fa";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // This assumes the API endpoint is available on this domain
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login on error
      router.push('/login');
    }
  };

  return (
    <header className="flex-shrink-0 sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between lg:justify-end overflow-hidden">
      {/* Mobile menu button - only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 lg:hidden"
        onClick={toggleSidebar}
      >
        <FaBars className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      
      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {/* Theme toggle */}
        <ThemeToggle />
        
        {/* Notifications button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0 rounded-full"
        >
          <FaBell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        
        {/* Logout button */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex-shrink-0 min-w-0"
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
        </Button>
      </div>
    </header>
  );
}