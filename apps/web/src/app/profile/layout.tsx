
"use client";

import { useState, Suspense } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  MessageSquare
} from "lucide-react";
import { cn } from '@repo/ui/cn';

// Mock Data
const userProfile = {
  name: "Sophia Davis",
  email: "sophia.davis@example.com",
  avatarUrl: "https://picsum.photos/seed/user_avatar/200/200",
};

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/profile' },
  { id: 'appointments', label: 'My Appointments', icon: Calendar, href: '/profile/appointments' },
  { id: 'orders', label: 'My Orders', icon: ShoppingCart, href: '/profile/orders' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile/reviews' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/profile/wallet' },
  { id: 'settings', label: 'Account Settings', icon: Settings, href: '/profile/settings' },
];

function ProfileLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageContainer>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-2 mb-8 lg:mb-0 lg:sticky top-24 self-start">
          <Card className="bg-gradient-to-b from-card to-card/90 backdrop-blur-lg border-border/30">
            <CardHeader className="text-center p-6 border-b border-border/20">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20 shadow-xl">
                <AvatarImage
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  data-ai-hint="woman portrait smiling"
                />
                <AvatarFallback className="text-3xl">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl font-bold">
                {userProfile.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {userProfile.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={(pathname === item.href || (item.href !== '/profile' && pathname.startsWith(item.href))) ? "secondary" : "ghost"}
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
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </nav>
            </CardContent>
          </Card>
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
        <Suspense fallback={<div>Loading...</div>}>
            <ProfileLayoutContent>
                {children}
            </ProfileLayoutContent>
        </Suspense>
    )
}
