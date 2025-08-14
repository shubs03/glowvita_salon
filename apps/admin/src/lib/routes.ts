
import {
    FaTachometerAlt, FaUsers, FaUserCog, FaFileAlt, FaBox, FaUserMd, 
    FaCheckCircle, FaMoneyBillWave, FaBullhorn, FaUserShield, FaTags, 
    FaQuestionCircle, FaUserFriends, FaTruck, FaMoneyCheckAlt, FaSync
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
    title: "Vendor Approval",
    href: "/vendor-approval",
    Icon: FaCheckCircle,
    permission: "vendor-approval",
  },
  {
    title: "Supplier Management",
    href: "/supplier-management",
    Icon: FaTruck,
    permission: "supplier-management",
  },
  {
    title: "Admin Roles",
    href: "/admin-roles",
    Icon: FaUserShield,
    permission: "admin-roles",
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
    title: "Dropdown Management",
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
