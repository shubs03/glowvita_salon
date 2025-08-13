
import {
    FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaBox, FaUserMd, 
    FaCheckCircle, FaMoneyBillWave, FaBullhorn, FaUserShield, FaTags, 
    FaQuestionCircle, FaUserFriends, FaTruck, FaMoneyCheckAlt, FaRedo 
} from "react-icons/fa";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactElement;
  permission: string; // This key will be used for role-based access
}

export const sidebarNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <FaTachometerAlt className="h-4 w-4" />,
    permission: "dashboard",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: <FaUsers className="h-4 w-4" />,
    permission: "customers",
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: <FaUserCog className="h-4 w-4" />,
    permission: "vendors",
  },
  {
    title: "Doctors & Dermats",
    href: "/doctors-dermats",
    icon: <FaUserMd className="h-4 w-4" />,
    permission: "doctors-dermats",
  },
  {
    title: "Vendor Approval",
    href: "/vendor-approval",
    icon: <FaCheckCircle className="h-4 w-4" />,
    permission: "vendor-approval",
  },
  {
    title: "Supplier Management",
    href: "/supplier-management",
    icon: <FaTruck className="h-4 w-4" />,
    permission: "supplier-management",
  },
  {
    title: "Admin Roles",
    href: "/admin-roles",
    icon: <FaUserShield className="h-4 w-4" />,
    permission: "admin-roles",
  },
  {
    title: "Offers & Coupons",
    href: "/offers-coupons",
    icon: <FaTags className="h-4 w-4" />,
    permission: "offers-coupons",
  },
   {
    title: "Subscription Management",
    href: "/subscription-management",
    icon: <FaRedo className="h-4 w-4" />,
    permission: "subscription-management",
  },
  {
    title: "Referral Management",
    href: "/referral-management",
    icon: <FaUserFriends className="h-4 w-4" />,
    permission: "referral-management",
  },
  {
    title: "Tax & Fees",
    href: "/tax-fees",
    icon: <FaMoneyBillWave className="h-4 w-4" />,
    permission: "tax-fees",
  },
  {
    title: "Payout",
    href: "/payout",
    icon: <FaMoneyCheckAlt className="h-4 w-4" />,
    permission: "payout",
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: <FaBullhorn className="h-4 w-4" />,
    permission: "marketing",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FaFileAlt className="h-4 w-4" />,
    permission: "reports",
  },
  {
    title: "FAQ Management",
    href: "/faq-management",
    icon: <FaQuestionCircle className="h-4 w-4" />,
    permission: "faq-management",
  },
];
