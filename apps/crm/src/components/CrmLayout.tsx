
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter, usePathname } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { cn } from '@repo/ui/cn';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isCrmAuthenticated, isLoading } = useCrmAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    // This effect runs whenever the auth state changes.
    // It's the central point for protecting routes.
    if (!isLoading) {
      if (!isCrmAuthenticated) {
        // If loading is finished and user is not authenticated,
        // redirect to login.
        router.push('/login');
      }
    }
  }, [isLoading, isCrmAuthenticated, router, pathname]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // While the auth state is being determined, show a loading screen.
  // This prevents the "flash" of the login page on a refresh when logged in.
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-t-primary"></div>
          </div>
        </div>
    )
  }

  // If loading is done and we're still not authenticated, the redirect effect will
  // have already fired. Rendering null here prevents a flash of the protected layout.
  if (!isCrmAuthenticated) {
    return null; 
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
