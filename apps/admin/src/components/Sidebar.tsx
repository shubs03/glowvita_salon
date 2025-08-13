
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaSignOutAlt, FaBox, FaUserMd, FaCheckCircle, FaMoneyBillWave, FaBullhorn, FaUserShield, FaTags, FaQuestionCircle, FaUserFriends, FaTruck, FaMoneyCheckAlt, FaBars, FaTimes, FaRedo } from "react-icons/fa";

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
    title: "Subscription Management",
    href: "/subscription-management",
    icon: <FaRedo className="h-4 w-4" />,
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

export function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 ease-in-out h-full",
        isOpen ? "w-64" : "w-20",
        isMobile && "w-64"
    )}>
      <div className="flex-grow flex flex-col overflow-y-hidden">
        <div className="p-4 h-16 border-b flex items-center shrink-0 justify-between">
           <Link href="/" className="flex items-center gap-2">
            <h1 className={cn("text-xl font-bold font-headline text-primary", !isOpen && !isMobile && "lg:hidden")}>Admin</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
            >
            {isMobile ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
        <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? toggleSidebar : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-secondary text-primary",
                !isOpen && !isMobile && "justify-center"
              )}
            >
              {item.icon}
              <span className={cn(!isOpen && !isMobile && "lg:hidden")}>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t mt-auto shrink-0">
        <Button variant="ghost" className={cn("w-full gap-3", isOpen || isMobile ? "justify-start" : "justify-center")} onClick={handleLogout}>
          <FaSignOutAlt className="h-4 w-4" />
          <span className={cn(!isOpen && !isMobile && "lg:hidden")}>Logout</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={toggleSidebar}></div>}
            <div className={cn(
                "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out lg:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </div>
        </>
    )
  }

  return (
    <div className="hidden lg:block">
        <SidebarContent />
    </div>
  );
}
