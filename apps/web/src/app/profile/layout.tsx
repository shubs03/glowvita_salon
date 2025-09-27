"use client";

import { Suspense, useEffect } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import { PageContainer } from '@repo/ui/page-container';
import {
  User,
  Settings,
  Wallet,
  ShoppingCart,
  Calendar,
  LogOut,
  LayoutDashboard,
  Star,
  Heart,
  MessageSquare,
  Gift
} from "lucide-react";
import { cn } from '@repo/ui/cn';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from "@repo/store/hooks";
import { clearUserAuth } from "@repo/store/slices/Web/userAuthSlice";
import { toast } from 'sonner';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/profile' },
  { id: 'appointments', label: 'My Appointments', icon: Calendar, href: '/profile/appointments' },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart, href: '/profile/orders' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile/reviews' },
  { id: 'referrals', label: 'Refer & Earn', icon: Gift, href: '/profile/referrals' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/profile/wallet' },
  { id: 'settings', label: 'Account Settings', icon: Settings, href: '/profile/settings' },
];

function ProfileLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // This effect handles route protection.
    // It waits until the initial auth check is done (isLoading is false).
    if (!isLoading && !isAuthenticated) {
      router.push('/client-login');
    }
  }, [isLoading, isAuthenticated, router]);


  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      dispatch(clearUserAuth());
      toast.success("You have been logged out.");
      router.push('/client-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // While isLoading, show a full-page loading spinner.
  // This prevents any "flicker" of content or incorrect redirects.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-background">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // If loading is done and user is not authenticated, render nothing.
  // The useEffect above will handle the redirection.
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <PageContainer>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-2 mb-8 lg:mb-0">
           <div className="lg:sticky lg:top-24">
            <Card className="bg-gradient-to-b from-card to-card/90 backdrop-blur-lg border">
              <CardHeader className="text-center p-6 border-b border-border/20">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20 shadow-xl">
                  <AvatarImage
                    src={user?.profilePicture}
                    alt={user?.firstName}
                  />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                    {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-bold">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <CardDescription className="text-sm">
                  {user?.emailAddress}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={(pathname === item.href) ? "secondary" : "ghost"}
                      className="justify-start gap-3 h-12 text-sm rounded-lg"
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                  <div className="pt-2 border-t border-border/20 mx-2 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
           </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 xl:col-span-10">
          {children}
        </main>
      </div>
    </PageContainer>
  );
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileLayoutContent>
                {children}
            </ProfileLayoutContent>
        </Suspense>
    )
}
