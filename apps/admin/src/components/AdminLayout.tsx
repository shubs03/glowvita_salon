
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

export function AdminLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const { admin, isLoading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    // Intentionally bypassed login for development
    // if (!isLoading && !admin) {
    //     router.push('/login');
    // }
  }, [admin, isLoading, router])

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  // if (isLoading || !admin) {
  //   return (
  //       <div className="flex items-center justify-center h-screen">
  //           <div>Loading...</div>
  //       </div>
  //   )
  // }

  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile}/>
      <div className="flex-1 flex flex-col h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
