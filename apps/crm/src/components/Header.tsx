"use client";

import { Button } from "@repo/ui/button";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAppDispatch } from "@repo/store/hooks";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import Cookies from 'js-cookie';
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { LogOut, User, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

export function Header({ toggleSidebar, isSidebarOpen }: { toggleSidebar: () => void, isSidebarOpen: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, role } = useCrmAuth();

  const handleLogout = async () => {
    dispatch(clearCrmAuth());
    Cookies.remove('crm_access_token', { path: '/' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex-shrink-0 sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profileImage} alt={user?.businessName || user?.name} />
            <AvatarFallback>{(user?.businessName || user?.name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold">{user?.businessName || user?.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{role}</span>
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="flex-shrink-0 min-w-0" size="icon">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
