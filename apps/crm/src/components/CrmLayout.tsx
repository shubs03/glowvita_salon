
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { cn } from '@repo/ui/cn';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isCrmAuthenticated, isLoading } = useCrmAuth();
  const router = useRouter();

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
    if (!isLoading && !isCrmAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isCrmAuthenticated, router]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (isLoading || !isCrmAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }
     
  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
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
                 
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background no-scrollbar">
          <div className="w-full max-w-none overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
