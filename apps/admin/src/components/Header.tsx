
"use client";

import { FaBell, FaBars } from "react-icons/fa";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    // This assumes the API endpoint is available on this domain
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between lg:justify-end">
       <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={toggleSidebar}
      >
        <FaBars className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <FaBell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
