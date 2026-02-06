"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/button";
import { ArrowRight, Menu, X, User, LayoutDashboard, Calendar, ShoppingCart, Star, Wallet, Settings, LogOut, ChevronDown, Gift, Users, FileText, Stethoscope, Box, Heart, Receipt, DollarSign, Bell, Truck, Store, HelpCircle, PlusSquare, Clock, Scissors, Megaphone } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@repo/ui/cn";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { useAppDispatch } from "@repo/store/hooks";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@repo/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { LogoutConfirmationModal } from "@repo/ui/logout-confirmation-modal";
import Cookies from "js-cookie";

interface User {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  avatarUrl?: string;
  profilePicture?: string;
}

interface MenuItemProps {
  label: string;
  href: string;
}

interface MarketingHeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isHomePage?: boolean;
  hideMenuItems?: boolean;
  customMenuItems?: MenuItemProps[];
}

// Role-specific navigation items mapped to Lucide icons
const getRoleSpecificNavItems = (role: string, permissions: string[] = []) => {
  const baseItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: Settings,
      href: "/profile",
    },
  ];

  const roleItemsMap: Record<string, any[]> = {
    vendor: [
      {
        id: "calendar",
        label: "Calendar",
        icon: Calendar,
        href: "/calendar",
      },
      {
        id: "appointments",
        label: "Appointments",
        icon: Calendar,
        href: "/appointments",
      },
      {
        id: "staff",
        label: "Staff Management",
        icon: Users,
        href: "/staff",
      },
      {
        id: "clients",
        label: "Clients",
        icon: Users,
        href: "/clients",
      },
      // {
      //   id: "customer-summary",
      //   label: "Customer Summary",
      //   icon: Users,
      //   href: "/customers/summary",
      // },
      {
        id: "services",
        label: "Services",
        icon: Scissors,
        href: "/services",
      },
      {
        id: "addons",
        label: "Add-ons",
        icon: PlusSquare,
        href: "/add-ons",
      },
      {
        id: "wedding-packages",
        label: "Wedding Packages",
        icon: Heart,
        href: "/wedding-packages",
      },
      {
        id: "products",
        label: "Products",
        icon: Box,
        href: "/products",
      },
      {
        id: "product-questions",
        label: "Product Questions",
        icon: HelpCircle,
        href: "/product-questions",
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: Star,
        href: "/reviews",
      },
      {
        id: "marketplace",
        label: "Marketplace",
        icon: Store,
        href: "/marketplace",
      },
      {
        id: "sales",
        label: "Sales",
        icon: DollarSign,
        href: "/sales",
      },
      {
        id: "invoice-management",
        label: "Invoice Management",
        icon: Receipt,
        href: "/invoice-management",
      },
      {
        id: "orders",
        label: "Orders",
        icon: ShoppingCart,
        href: "/orders",
      },
      {
        id: "shipping",
        label: "Shipping",
        icon: Truck,
        href: "/shipping",
      },
      {
        id: "settlements",
        label: "Settlements",
        icon: DollarSign,
        href: "/settlements",
      },
      {
        id: "expenses",
        label: "Expenses",
        icon: Receipt,
        href: "/expenses",
      },
      {
        id: "offers-coupons",
        label: "Offers & Coupons",
        icon: Gift,
        href: "/offers-coupons",
      },
      {
        id: "referrals",
        label: "Referrals",
        icon: Users,
        href: "/referrals",
      },
      {
        id: "marketing",
        label: "Marketing",
        icon: Megaphone,
        href: "/marketing",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        href: "/push-notifications",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        href: "/reports",
      },
    ],
    doctor: [
      {
        id: "calendar",
        label: "Calendar",
        icon: Calendar,
        href: "/calendar",
      },
      {
        id: "appointments",
        label: "Appointments",
        icon: Calendar,
        href: "/appointments",
      },
      {
        id: "patients",
        label: "Patients",
        icon: Users,
        href: "/patients",
      },
      {
        id: "consultations",
        label: "Consultations",
        icon: Stethoscope,
        href: "/consultations",
      },
      {
        id: "timetable",
        label: "Timetable",
        icon: Clock,
        href: "/timetable",
      },
      {
        id: "doctor-staff",
        label: "Staff Management",
        icon: Users,
        href: "/doctor-staff",
      },
      {
        id: "earnings",
        label: "Earnings",
        icon: DollarSign,
        href: "/earnings",
      },
      {
        id: "expenses",
        label: "Expenses",
        icon: Receipt,
        href: "/expenses",
      },
      {
        id: "doctor-reviews",
        label: "Patient Reviews",
        icon: Star,
        href: "/doctor-reviews",
      },
      {
        id: "doctor-offers",
        label: "Offers & Coupons",
        icon: Gift,
        href: "/offers-coupons",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        href: "/push-notifications",
      },
      {
        id: "doctor-referrals",
        label: "Referrals",
        icon: Users,
        href: "/doctor-referrals",
      },
      {
        id: "doctor-reports",
        label: "Reports",
        icon: FileText,
        href: "/doctor-reports",
      },
    ],
    supplier: [
      {
        id: "supplier-products",
        label: "Products",
        icon: Box,
        href: "/supplier-products",
      },
      {
        id: "product-questions",
        label: "Product Questions",
        icon: HelpCircle,
        href: "/product-questions",
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: Star,
        href: "/reviews",
      },
      {
        id: "orders",
        label: "Orders",
        icon: ShoppingCart,
        href: "/orders",
      },
      {
        id: "sales",
        label: "Sales",
        icon: DollarSign,
        href: "/sales",
      },
      {
        id: "expenses",
        label: "Expenses",
        icon: Receipt,
        href: "/expenses",
      },
      {
        id: "offers-coupons",
        label: "Offers & Coupons",
        icon: Gift,
        href: "/offers-coupons",
      },
      {
        id: "referrals",
        label: "Referrals",
        icon: Users,
        href: "/referrals",
      },
      {
        id: "marketing",
        label: "Marketing",
        icon: Megaphone,
        href: "/marketing",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        href: "/push-notifications",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        href: "/reports",
      },
    ],
    staff: [], // Staff will get filtered permissions-based items
  };

  const roleItems = roleItemsMap[role] || [];
  
  // For staff, filter by permissions
  if (role === 'staff' && permissions.length > 0) {
    // Map staff permissions to corresponding nav items
    const permissionToNavItemMap: Record<string, string> = {
      'dashboard_view': 'dashboard',
      'calendar_view': 'calendar',
      'appointments_view': 'appointments',
      'clients_view': 'clients',
      'services_view': 'services',
      'products_view': 'products',
      'orders_view': 'orders',
      'reports_view': 'reports',
    };
    
    const allowedItemIds = permissions
      .map(perm => permissionToNavItemMap[perm])
      .filter(Boolean);
    
    return [...baseItems, ...roleItems.filter(item => allowedItemIds.includes(item.id))];
  }
  
  return [...baseItems, ...roleItems];
};

const navItems = [
  { label: "Apps", href: "/apps" },
  { label: "Support", href: "/support" },
  { label: "About", href: "/about" },
];

export function MarketingHeader({
  isMobileMenuOpen,
  toggleMobileMenu,
  isHomePage = false,
  hideMenuItems = false,
  customMenuItems,
}: MarketingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isCrmAuthenticated: isAuthenticated, user, isLoading, role, permissions } = useCrmAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove("token", { path: "/" });
      Cookies.remove("token", { path: "/", domain: window.location.hostname });
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("access_token", {
        path: "/",
        domain: window.location.hostname,
      });
      Cookies.remove("crm_access_token", { path: "/" });
      Cookies.remove("crm_access_token", {
        path: "/",
        domain: window.location.hostname,
      });

      // Clear all auth-related data from localStorage
      localStorage.removeItem("userAuthState");
      localStorage.removeItem("crmAuthState");
      localStorage.removeItem("adminAuthState");

      // Clear any other possible tokens
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("token") || key.includes("auth")) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove localStorage item: ${key}`, e);
          }
        }
      });

      // Dispatch the CRM action to clear auth state
      dispatch(clearCrmAuth());
      toast.success("You have been logged out.");
      // Redirect to CRM login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout. Please try again.");
      // Still redirect to CRM login even if there was an error
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const getInitials = (firstName: string = "", lastName: string = "") => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  const isActiveRoute = (href: string) => pathname === href;

  // Get role-specific navigation items
  const roleNavItems = getRoleSpecificNavItems(role || '', permissions || []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isHomePage && !isScrolled
            ? "bg-transparent"
            : "bg-background/80 backdrop-blur-lg border-b border-border/20"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
          <Link
            href="/"
            className="font-bold text-xl sm:text-2xl font-headline text-primary bg-clip-text hover:opacity-80 transition-opacity"
          >
            <span className="hidden sm:inline">GlowVita Salon</span>
            <span className="sm:hidden">GlowVita</span>
          </Link>

          {/* Desktop & Tablet Nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {!hideMenuItems && (
              <>
                {customMenuItems ? (
                  customMenuItems.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "hover:bg-primary/10 text-sm px-3 relative",
                          isActiveRoute(item.href) &&
                            "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full"
                        )}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))
                ) : (
                  <>
                    {navItems.map((item, index) => (
                      <Link key={index} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "hover:bg-primary/10 text-md px-5 relative",
                            isActiveRoute(item.href) &&
                              "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-1 after:bg-primary after:rounded-full"
                          )}
                        >
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
            <div className="mx-2">
              <ThemeToggle />
            </div>
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="group flex items-center gap-2 h-10 rounded-full hover:bg-primary/10 transition-all duration-300"
                        aria-label="User menu"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-primary/50">
                          <AvatarImage
                            src={user?.profilePicture || user?.avatarUrl}
                            alt={`${user?.firstName || "User"} avatar`}
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {getInitials(user?.firstName, user?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-background/95 backdrop-blur-xl border border-border/30 shadow-lg rounded-lg"
                    >
                      <DropdownMenuLabel className="p-5 border-b border-border/20">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/50">
                            <AvatarImage
                              src={user?.profilePicture || user?.avatarUrl}
                              alt={`${user?.firstName || "User"} avatar`}
                            />
                            <AvatarFallback className="bg-primary text-white">
                              {getInitials(user?.firstName, user?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.firstName || user.lastName || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.emailAddress}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuGroup className="p-2 max-h-96 overflow-y-auto">
                        {roleNavItems.map((item) => (
                          <DropdownMenuItem
                            key={item.id}
                            asChild
                            className="rounded-md"
                          >
                            <Link
                              href={item.href}
                              className="flex items-center gap-3"
                            >
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowLogoutModal(true)}
                        className="text-destructive m-2 rounded-md cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    className="hover:bg-primary/10 text-md px-3"
                    asChild
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </>
            )}
          </nav>

          {/* Mobile Nav Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border/50 absolute top-16 sm:top-20 left-0 w-full z-30 shadow-lg">
            <nav className="flex flex-col gap-1 p-4 max-h-[80vh] overflow-y-auto">
              {!hideMenuItems && (
                <>
                  <div className="space-y-1">
                    {customMenuItems ? (
                      customMenuItems.map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-12 text-left",
                            isActiveRoute(item.href) && "bg-primary/10"
                          )}
                          asChild
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ))
                    ) : (
                      <>
                        {navItems.map((item, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start h-12 text-left",
                              isActiveRoute(item.href) && "bg-primary/10"
                            )}
                            asChild
                          >
                            <Link href={item.href}>{item.label}</Link>
                          </Button>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="border-t border-border/30 my-4"></div>
                </>
              )}

              <div className="space-y-2">
                {!isLoading &&
                  (isAuthenticated && user ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-center"
                        asChild
                      >
                        <Link href="/profile">My Profile</Link>
                      </Button>
                      <Button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full h-12 justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-center"
                        asChild
                      >
                        <Link href="/crm/login">Login</Link>
                      </Button>
                      <Button
                        className="w-full h-12 justify-center bg-primary hover:to-secondary/90"
                        asChild
                      >
                        <Link href="/crm/register">
                          <span className="flex items-center gap-2">
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      </Button>
                    </>
                  ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      <LogoutConfirmationModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
