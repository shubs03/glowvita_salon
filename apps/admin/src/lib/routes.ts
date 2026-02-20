
import {
  FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaBox, FaUserMd,
  FaCheckCircle, FaMoneyBillWave, FaBullhorn, FaUserShield, FaTags,
  FaQuestionCircle, FaUserFriends, FaTruck, FaMoneyCheckAlt, FaSync,
  FaMapMarkedAlt, FaBell, FaWallet
} from "react-icons/fa";
import { FaListUl } from "react-icons/fa";
import { IconType } from "react-icons";

export interface NavItem {
  title: string;
  href: string;
  Icon: IconType;
  permission: string;
}

export const sidebarNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    Icon: FaTachometerAlt,
    permission: "dashboard",
  },
  {
    title: "Customers",
    href: "/customers",
    Icon: FaUsers,
    permission: "customers",
  },
  {
    title: "Vendors",
    href: "/vendors",
    Icon: FaUserCog,
    permission: "vendors",
  },
  {
    title: "Doctors & Dermats",
    href: "/doctors-dermats",
    Icon: FaUserMd,
    permission: "doctors-dermats",
  },
  {
    title: "Approvals",
    href: "/approval",
    Icon: FaCheckCircle,
    permission: "vendor-approval",
  },
  {
    title: "Services",
    href: "/services",
    Icon: FaBox,
    permission: "services",
  },
  {
    title: "Supplier Management",
    href: "/supplier-management",
    Icon: FaTruck,
    permission: "supplier-management",
  },
  {
    title: "Geo-fencing",
    href: "/geo-fencing",
    Icon: FaMapMarkedAlt,
    permission: "geo-fencing",
  },
  {
    title: "Admin Roles",
    href: "/admin-roles",
    Icon: FaUserShield,
    permission: "admin-roles",
  },
  {
    title: "Regions",
    href: "/regions",
    Icon: FaMapMarkedAlt,
    permission: "admin-roles", // Grouped with admin roles for now
  },
  {
    title: "Offers & Coupons",
    href: "/offers-coupons",
    Icon: FaTags,
    permission: "offers-coupons",
  },
  {
    title: "Subscription Management",
    href: "/subscription-management",
    Icon: FaSync,
    permission: "subscription-management",
  },
  {
    title: "Referral Management",
    href: "/referral-management",
    Icon: FaUserFriends,
    permission: "referral-management",
  },
  {
    title: "Wallet Management",
    href: "/wallet-management",
    Icon: FaWallet,
    permission: "wallet-management",
  },
  {
    title: "Superdata",
    href: "/dropdown-management",
    Icon: FaListUl,
    permission: "dropdown-management",
  },
  {
    title: "Tax & Fees",
    href: "/tax-fees",
    Icon: FaMoneyBillWave,
    permission: "tax-fees",
  },
  {
    title: "Payout",
    href: "/payout",
    Icon: FaMoneyCheckAlt,
    permission: "payout",
  },
  {
    title: "Push Notifications",
    href: "/push-notifications",
    Icon: FaBell,
    permission: "push-notifications",
  },
  {
    title: "Marketing",
    href: "/marketing",
    Icon: FaBullhorn,
    permission: "marketing",
  },
  {
    title: "Reports",
    href: "/reports",
    Icon: FaFileAlt,
    permission: "reports",
  },
  {
    title: "FAQ Management",
    href: "/faq-management",
    Icon: FaQuestionCircle,
    permission: "faq-management",
  },
];
