
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter, usePathname } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { cn } from '@repo/ui/cn';
import { CrmAuthInitializer } from '@/components/CrmAuthInitializer';

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
    if (isLoading) {
      return; // Do nothing while auth state is loading
    }
    
    if (!isCrmAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, isCrmAuthenticated, router, pathname]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // The CrmAuthInitializer is now part of the layout, ensuring it runs only for CRM pages
  if (isLoading) {
    return (
      <CrmAuthInitializer>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 rounded-full animate-spin border-t-primary"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin-slow border-t-primary/50"></div>
          </div>
        </div>
      </CrmAuthInitializer>
    )
  }

  // Only render the full layout if authenticated
  if (!isCrmAuthenticated) {
    return null; // or you can return a more specific unauthorized component
  }
     
  return (
    <CrmAuthInitializer>
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
    </CrmAuthInitializer>
  );
}
