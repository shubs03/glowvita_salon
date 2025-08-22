
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAppSelector } from '@repo/store/hooks';
import { useRouter } from 'next/navigation';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isAdminAuthenticated: isAuthenticated, isLoading } = useAppSelector(state => state.auth);
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
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Loading...</div>
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
