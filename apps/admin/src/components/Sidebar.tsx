"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { LayoutDashboard, Users, UserCog, FileText, LogOut, Package } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: <UserCog className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FileText className="h-4 w-4" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 bg-background border-r">
      <div className="flex-grow">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline text-primary">Admin Panel</h1>
          </Link>
        </div>
        <nav className="px-2">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-secondary text-primary"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
