
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isCrmAuthenticated, isLoading } = useCrmAuth();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if(mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // This logic now runs only after the initial loading is complete.
    if (!isLoading && !isCrmAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isCrmAuthenticated, router]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // While the auth state is being determined, show a full-page loader.
  // This prevents the flicker and the premature redirect.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Once loading is done, if the user is not authenticated, they will be redirected.
  // If they are authenticated, render the layout. This check prevents rendering
  // the layout for a split second before the redirect happens.
  if (!isCrmAuthenticated) {
    // Return null or a minimal loader while the redirect initiated in the useEffect occurs.
    return null;
  }
     
  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />
             
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
                 
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-none overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
