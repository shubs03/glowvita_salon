
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { sidebarNavItems } from '@/lib/routes';
import { cn } from '@repo/ui/cn';

export function AdminLayout({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isLoading, isAdminAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  // Enable global API error handling
  useApiErrorHandler();

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
        return;
    }

    if (!isLoading && admin) {
      // Find the most specific (longest) matching sidebar item for the current path
      const matchedItem = [...sidebarNavItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find(item => 
          item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href)
        );

      const requiredPermission = matchedItem?.permission;
             
      if (!requiredPermission || pathname === '/') {
        setHasAccess(true);
        return;
      }
             
      const isSuperAdmin = admin.roleName === 'SUPER_ADMIN';
      const userHasAccess = isSuperAdmin || 
        admin.permissions?.includes(`${requiredPermission}:all`) ||
        admin.permissions?.includes(`${requiredPermission}:view`) ||
        admin.permissions?.includes(`${requiredPermission}:edit`) ||
        admin.permissions?.includes(`${requiredPermission}:delete`) ||
        admin.permissions?.includes(requiredPermission);

      if (!userHasAccess) {
        setHasAccess(false);
        router.push('/');
      } else {
        setHasAccess(true);
      }
    }
  }, [admin, isLoading, isAdminAuthenticated, router, pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
     
  if (isLoading || !isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
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
                 
        <main className="flex-1 overflow-y-auto bg-secondary/50">
          <div className="w-full max-w-none min-h-full">
            {hasAccess === true ? (
              children
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-muted-foreground font-medium">Verifying Access...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
