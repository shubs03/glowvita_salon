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
    <div className="flex min-h-screen bg-secondary">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
