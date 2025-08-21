
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
  const { admin, isLoading, isAdminAuthenticated } = useAuth();
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
    if (!isLoading && !isAdminAuthenticated) {
        router.push('/login');
        return; // Early return to prevent further checks
    }

    if (!isLoading && admin) {
      // Find the required permission for the current route
      const requiredPermission = sidebarNavItems.find(item => item.href === pathname)?.permission;
             
      // Allow access if no specific permission is required for the route (e.g., dashboard)
      if (!requiredPermission) {
        return;
      }
             
      // Check if the user has permission
      const isSuperAdmin = admin.roleName === 'superadmin';
      const hasPermission = admin.permissions?.includes(requiredPermission);

      // If user is not superadmin and does not have the required permission, redirect
      if (!isSuperAdmin && !hasPermission) {
        router.push('/');
      }
    }
  }, [admin, isLoading, isAdminAuthenticated, router, pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
     
  if (isLoading || !isAdminAuthenticated) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-foreground">Unauthorized Access</div>
        </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />
             
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
                 
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-none overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
