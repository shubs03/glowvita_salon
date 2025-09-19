
'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter, usePathname } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { cn } from '@repo/ui/cn';
import { Button } from '@repo/ui/button';
import { Sparkles, Zap, CheckCircle2, Clock } from 'lucide-react';
import { vendorNavItems, doctorNavItems, supplierNavItems } from '@/lib/routes';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isCrmAuthenticated, isLoading, role } = useCrmAuth();
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isCrmAuthenticated) {
        router.push('/login');
        return;
      }

      let allowedNavItems = [];
      switch (role) {
        case 'vendor':
        case 'staff':
          allowedNavItems = vendorNavItems;
          break;
        case 'doctor':
          allowedNavItems = doctorNavItems;
          break;
        case 'supplier':
          allowedNavItems = supplierNavItems;
          break;
      }

      const alwaysAllowedPaths = ['/dashboard', '/salon-profile', '/not-found'];
      const allowedPaths = [...allowedNavItems.map(item => item.href), ...alwaysAllowedPaths];

      const isPathAllowed = allowedPaths.some(allowedPath => {
        if (pathname === allowedPath) return true;
        if (allowedPath !== '/' && pathname.startsWith(allowedPath + '/')) return true;
        return false;
      });

      if (!isPathAllowed) {
        // Instead of redirecting, push the user back to their previous valid page.
        // This prevents the URL from changing to the unauthorized route.
        router.push(previousPathname.current);
      } else {
        // If the path is allowed, update the previous valid path.
        previousPathname.current = pathname;
      }
    }
  }, [isLoading, isCrmAuthenticated, router, pathname, role]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (isLoading || !isCrmAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/10 rounded-full animate-spin border-t-primary"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin-slow border-t-primary/50"></div>
        </div>
      </div>
    );
  }
     
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />
             
      <div className={cn(
        "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
        !isMobile && (isSidebarOpen ? "lg:ml-64" : "lg:ml-20")
      )}>
        <Header toggleSidebar={toggleSidebar} />
                 
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
          <div className="w-full max-w-none overflow-hidden min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
