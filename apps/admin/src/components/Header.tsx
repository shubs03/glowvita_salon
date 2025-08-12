"use client";

import { FaBars, FaBell } from "react-icons/fa";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ toggleSidebar }: { toggleSidebar: () => void; }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={toggleSidebar}
      >
        <FaBars className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="flex w-full items-center justify-end gap-4">
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
