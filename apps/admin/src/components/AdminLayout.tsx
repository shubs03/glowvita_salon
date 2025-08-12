'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export function AdminLayout({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const showLayout = pathname !== '/login';

  if (!showLayout) {
    return <>{children}</>;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
