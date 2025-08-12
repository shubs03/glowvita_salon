"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaSignOutAlt, FaBox, FaUserMd, FaCheckCircle, FaMoneyBillWave, FaBullhorn, FaUserShield, FaTags, FaQuestionCircle, FaUserFriends, FaTruck, FaMoneyCheckAlt, FaBars } from "react-icons/fa";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <FaTachometerAlt className="h-4 w-4" />,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: <FaUsers className="h-4 w-4" />,
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: <FaUserCog className="h-4 w-4" />,
  },
  {
    title: "Doctors & Dermats",
    href: "/doctors-dermats",
    icon: <FaUserMd className="h-4 w-4" />,
  },
  {
    title: "Vendor Approval",
    href: "/vendor-approval",
    icon: <FaCheckCircle className="h-4 w-4" />,
  },
  {
    title: "Supplier Management",
    href: "/supplier-management",
    icon: <FaTruck className="h-4 w-4" />,
  },
  {
    title: "Admin Roles",
    href: "/admin-roles",
    icon: <FaUserShield className="h-4 w-4" />,
  },
  {
    title: "Offers & Coupons",
    href: "/offers-coupons",
    icon: <FaTags className="h-4 w-4" />,
  },
  {
    title: "Referral Management",
    href: "/referral-management",
    icon: <FaUserFriends className="h-4 w-4" />,
  },
  {
    title: "Tax & Fees",
    href: "/tax-fees",
    icon: <FaMoneyBillWave className="h-4 w-4" />,
  },
  {
    title: "Payout",
    href: "/payout",
    icon: <FaMoneyCheckAlt className="h-4 w-4" />,
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: <FaBullhorn className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FaFileAlt className="h-4 w-4" />,
  },
  {
    title: "FAQ Management",
    href: "/faq-management",
    icon: <FaQuestionCircle className="h-4 w-4" />,
  },
];

export function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className={cn(
        "hidden bg-background border-r lg:flex lg:flex-col transition-all duration-300 ease-in-out",
        isOpen ? "lg:w-64" : "lg:w-20"
      )}>
      <div className="flex-grow flex flex-col overflow-y-auto">
        <div className="p-4 h-16 border-b flex items-center shrink-0 justify-between">
           <Link href="/" className="flex items-center gap-2">
            <h1 className={cn("text-xl font-bold font-headline text-primary", !isOpen && "lg:hidden")}>Admin</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
            >
            <FaBars className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
        <nav className="flex-grow px-2 py-4 space-y-1">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-secondary text-primary",
                !isOpen && "justify-center"
              )}
            >
              {item.icon}
              <span className={cn(!isOpen && "lg:hidden")}>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t mt-auto shrink-0">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
          <FaSignOutAlt className="h-4 w-4" />
          <span className={cn(!isOpen && "lg:hidden")}>Logout</span>
        </Button>
      </div>
    </div>
  );
}
