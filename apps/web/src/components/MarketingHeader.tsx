
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ArrowRight, Menu, X, User, LayoutDashboard, Calendar, ShoppingCart, Star, Wallet, Settings, LogOut, ChevronDown, Gift } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from '@repo/ui/cn';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth } from '@repo/store/slices/userAuthSlice';
import { resetToGuest } from "@repo/store/slices/cartSlice";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import Cookies from 'js-cookie';

interface User {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  avatarUrl?: string;
  profilePicture?: string;
}

interface MenuItemProps {
  label: string;
  href: string;
}

interface MarketingHeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isHomePage?: boolean;
  hideMenuItems?: boolean;
  customMenuItems?: MenuItemProps[];
}

const profileNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/profile' },
  { id: 'appointments', label: 'My Appointments', icon: Calendar, href: '/profile/appointments' },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart, href: '/profile/orders' },
  { id: 'cart', label: 'My Cart', icon: ShoppingCart, href: '/profile/cart' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile/reviews' },
  { id: 'referrals', label: 'Refer & Earn', icon: Gift, href: '/profile/referrals' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/profile/wallet' },
  { id: 'settings', label: 'Account Settings', icon: Settings, href: '/profile/settings' },
];

export function MarketingHeader({ isMobileMenuOpen, toggleMobileMenu, isHomePage = false, hideMenuItems = false, customMenuItems }: MarketingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isAuthenticated, user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove('token', { path: '/' });
      Cookies.remove('token', { path: '/', domain: window.location.hostname });
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('crm_access_token', { path: '/' });
      Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('userAuthState');
      localStorage.removeItem('crmAuthState');
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

      // Dispatch the client-side action to clear all auth state
      dispatch(clearUserAuth());
      // Reset cart to guest mode
      dispatch(resetToGuest());
      toast.success("You have been logged out.");
      // Redirect to login page
      router.push('/client-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error during logout. Please try again.");
      // Still redirect to login even if there was an error
      router.push('/client-login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isHomePage && !isScrolled
            ? "bg-transparent"
            : "bg-background/80 backdrop-blur-lg border-b border-border/20"
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
            {!hideMenuItems && (
              <>
                {customMenuItems ? (
                  customMenuItems.map((item, index) => (
                    <Button key={index} variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))
                ) : (
                  <>
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
                  </>
                )}
              </>
            )}
            <div className="mx-2">
              <ThemeToggle />
            </div>
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="group flex items-center gap-2 h-10 rounded-full hover:bg-primary/10 transition-all duration-300"
                        aria-label="User menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profilePicture || user?.avatarUrl} alt={`${user?.firstName || 'User'} avatar`} />
                          <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border border-border/30 shadow-lg rounded-lg">
                      <DropdownMenuLabel className="p-4 border-b border-border/20">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profilePicture || user?.avatarUrl} alt={`${user?.firstName || 'User'} avatar`} />
                            <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.firstName || user.lastName || 'User'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.emailAddress}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuGroup className="p-2">
                        {profileNavItems.map(item => (
                          <DropdownMenuItem key={item.id} asChild className="rounded-md">
                            <Link href={item.href} className="flex items-center gap-3">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowLogoutModal(true)} 
                        className="text-destructive m-2 rounded-md cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
                    <Link href="/client-login">Login</Link>
                  </Button>
                )}
              </>
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
              {!hideMenuItems && (
                <>
                  <div className="space-y-1">
                    {customMenuItems ? (
                      customMenuItems.map((item, index) => (
                        <Button key={index} variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ))
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href="/apps">Features</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href="/pricing">Pricing</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href="/about">About Us</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href="/contact">Contact</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                          <Link href="/support">Support</Link>
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-border/30 my-4"></div>
                </>
              )}
              
              <div className="space-y-2">
                {!isLoading && (
                  isAuthenticated && user ? (
                    <>
                      <Button variant="outline" className="w-full h-12 justify-center" asChild>
                        <Link href="/profile">My Profile</Link>
                      </Button>
                      <Button 
                        onClick={() => setShowLogoutModal(true)} 
                        className="w-full h-12 justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full h-12 justify-center" asChild>
                        <Link href="/client-login">Login</Link>
                      </Button>
                      <Button className="w-full h-12 justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" asChild>
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
      </header>
      
      <LogoutConfirmationModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
