
import { 
    FaTachometerAlt, FaUsers, FaCalendarAlt, FaCut, FaSignOutAlt, 
    FaTimes, FaBars, FaClipboardList, FaBoxOpen, FaFileAlt, FaBullhorn, 
    FaBell, FaGift, FaUserFriends, FaUserCircle
} from 'react-icons/fa';
import { IconType } from "react-icons";

export interface NavItem {
  title: string;
  href: string;
  Icon: IconType;
  permission: string;
}

export const vendorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", Icon: FaTachometerAlt, permission: 'dashboard_view' },
  { title: "Calendar", href: "/calendar", Icon: FaCalendarAlt, permission: 'calendar_view' },
  { title: "Appointments", href: "/appointments", Icon: FaClipboardList, permission: 'appointments_view' },
  { title: "Staff", href: "/staff", Icon: FaUsers, permission: 'staff_view' },
  { title: "Clients", href: "/clients", Icon: FaUsers, permission: 'clients_view' },
  { title: "Services", href: "/services", Icon: FaCut, permission: 'services_view' },
  { title: "Products", href: "/products", Icon: FaBoxOpen, permission: 'products_view' },
  { title: "Offers & Coupons", href: "/offers-coupons", Icon: FaGift, permission: 'offers_view' },
  { title: "Referrals", href: "/referrals", Icon: FaUserFriends, permission: 'referrals_view' },
  { title: "Marketing", href: "/marketing", Icon: FaBullhorn, permission: 'marketing_view' },
  { title: "Notifications", href: "/push-notifications", Icon: FaBell, permission: 'notifications_view' },
  { title: "Reports", href: "/reports", Icon: FaFileAlt, permission: 'reports_view' },
];

export const doctorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", Icon: FaTachometerAlt, permission: 'dashboard_view' },
  { title: "Appointments", href: "/appointments", Icon: FaClipboardList, permission: 'appointments_view' },
  { title: "Clients", href: "/clients", Icon: FaUsers, permission: 'clients_view' },
];

export const supplierNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", Icon: FaTachometerAlt, permission: 'dashboard_view' },
  { title: "Products", href: "/products", Icon: FaBoxOpen, permission: 'products_view' },
];
