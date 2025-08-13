
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { sidebarNavItems } from '@/lib/routes';

export function AdminLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const pathname = usePathname();
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
    if (!isLoading && !admin) {
        router.push('/login');
    }

    if (!isLoading && admin) {
      const requiredPermission = sidebarNavItems.find(item => item.href === pathname)?.permission;
      
      if (requiredPermission && admin.roleName !== 'superadmin' && !admin.permissions?.includes(requiredPermission)) {
        router.push('/');
      }
    }
  }, [admin, isLoading, router, pathname])

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  if (isLoading || !admin) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div>Loading...</div>
        </div>
    )
  }

  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
