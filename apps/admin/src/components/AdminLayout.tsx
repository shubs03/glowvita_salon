
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/login';

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className="flex-grow">{children}</main>
    </div>
  );
}
