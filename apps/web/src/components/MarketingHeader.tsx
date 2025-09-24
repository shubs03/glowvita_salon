
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ArrowRight, Menu, X, User, LayoutDashboard, Calendar, ShoppingCart, Star, Wallet, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from '@repo/ui/cn';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth } from '@repo/store/slices/userAuthSlice';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { LogoutConfirmationModal } from '@repo/ui/logout-confirmation-modal';


interface MarketingHeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isHomePage?: boolean;
}

const profileNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/profile?tab=overview' },
  { id: 'appointments', label: 'My Appointments', icon: Calendar, href: '/profile?tab=appointments' },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart, href: '/profile?tab=orders' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile?tab=reviews' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/profile?tab=wallet' },
  { id: 'settings', label: 'Account Settings', icon: Settings, href: '/profile?tab=settings' },
];

export function MarketingHeader({ isMobileMenuOpen, toggleMobileMenu, isHomePage = false }: MarketingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    dispatch(clearUserAuth());
    Cookies.remove('token');
    router.push('/client-login');
    setShowLogoutModal(false);
    toast.success("You have been logged out.");
    setIsLoggingOut(false);
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    const first = firstName ? firstName[0] : '';
    const last = lastName ? lastName[0] : '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        (isScrolled || !isHomePage)
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50" 
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        <Link
          href="/"
          className="font-bold text-xl sm:text-2xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline">GlowVita Salon</span>
          <span className="sm:hidden">GlowVita</span>
        </Link>
        
        {/* Desktop & Tablet Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/apps">Features</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/support">Support</Link>
          </Button>
          <div className="mx-2">
            <ThemeToggle />
          </div>
          {!isLoading && (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name || ''} />
                      <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.firstName} {user.lastName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profileNavItems.map(item => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
                <Link href="/client-login">Login</Link>
              </Button>
            )
          )}
        </nav>
        
        {/* Mobile Nav Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="h-8 w-8 sm:h-10 sm:w-10">
            {isMobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border/50 absolute top-16 sm:top-20 left-0 w-full z-30 shadow-lg">
          <nav className="flex flex-col gap-1 p-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild><Link href="/apps">Features</Link></Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild><Link href="/pricing">Pricing</Link></Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild><Link href="/about">About Us</Link></Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild><Link href="/contact">Contact</Link></Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild><Link href="/support">Support</Link></Button>
            </div>
            
            <div className="border-t border-border/30 my-4"></div>
            
            <div className="space-y-2">
              {!isLoading && (
                isAuthenticated && user ? (
                  <>
                    <Button variant="outline" className="w-full h-12 justify-center" asChild>
                      <Link href="/profile">My Profile</Link>
                    </Button>
                    <Button onClick={() => setShowLogoutModal(true)} className="w-full h-12 justify-center bg-destructive text-destructive-foreground">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full h-12 justify-center" asChild>
                      <Link href="/client-login">Login</Link>
                    </Button>
                    <Button className="w-full h-12 justify-center bg-gradient-to-r from-primary to-secondary" asChild>
                      <Link href="/client-register">
                        <span className="flex items-center gap-2">
                          Sign Up
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </>
                )
              )}
            </div>
          </nav>
        </div>
      )}
       <LogoutConfirmationModal
          open={showLogoutModal}
          onOpenChange={setShowLogoutModal}
          onConfirm={handleLogout}
          isLoading={isLoading}
        />
    </header>
  );
};
