"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Download, Eye, DollarSign, Users, UserPlus, ShoppingCart, Search, FileSpreadsheet, FileText, Printer, Tag, CheckCircle, Percent, IndianRupee, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { 
  useGetAppointmentsQuery, 
  useGetClientsQuery, 
  useGetCrmProductsQuery, 
  useGetExpensesQuery, 
  useGetCrmOrdersQuery,
  useGetCrmReferralsQuery,
  useGetCrmCampaignsQuery,
  useGetCrmClientOrdersQuery,
  useGetOffersQuery
} from '@repo/store/services/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

interface Report {
  title: string;
  description: string;
  details: string;
  type: string; // Used to identify the report type for data fetching
}

interface ReportCategory {
  category: string;
  reports: Report[];
}

interface ReportData {
  headers: string[];
  rows: any[][];
}

// Add SupplierOrder interface
interface SupplierOrder {
  _id: string;
  orderId?: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
  customerName?: string;
  vendorId?: string;
  supplierId?: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
}

// Define role-specific reports
const roleSpecificReports: Record<string, ReportCategory[]> = {
  admin: [
    {
      category: "Financial Reports",
      reports: [
        {
          title: "Sales Report",
          description: "Detailed report of all sales, bookings, and transactions.",
          details: "Includes profit, loss, and settlement data.",
          type: "sales"
        },
        {
          title: "Tax & Fees Report",
          description: "A comprehensive breakdown of collected taxes and platform fees.",
          details: "For financial reconciliation and accounting.",
          type: "tax"
        },
        {
          title: "Subscription Report",
          description: "Detailed report on subscription revenue and user churn.",
          details: "Monitor the health of your subscription business.",
          type: "subscription"
        },
      ]
    },
    {
      category: "User & Vendor Reports",
      reports: [
        {
          title: "User Activity Report",
          description: "Report on user registrations, logins, and platform activity.",
          details: "Track user engagement and growth metrics.",
          type: "user-activity"
        },
        {
          title: "Customer Demographics Report",
          description: "Insights into your customer base, including location and preferences.",
          details: "Understand your audience to tailor your services.",
          type: "customer-demographics"
        },
        {
          title: "Vendor Performance Report",
          description: "Analytics on vendor bookings, ratings, and payouts.",
          details: "Evaluate and manage vendor performance effectively.",
          type: "vendor-performance"
        },
        {
          title: "Doctor & Dermatologist Report",
          description: "Performance and engagement metrics for registered doctors.",
          details: "Track consultations, revenue, and ratings.",
          type: "doctor-performance"
        },
        {
          title: "Supplier & Inventory Report",
          description: "Track supplier performance and product sales.",
          details: "Manage inventory and supplier relationships.",
          type: "supplier-inventory"
        },
      ]
    },
    {
      category: "Marketing & Engagement Reports",
      reports: [
        {
          title: "Offers & Coupons Report",
          description: "Analytics on coupon usage, redemption rates, and campaign ROI.",
          details: "Optimize your promotional strategies.",
          type: "offers"
        },
        {
          title: "Referral Program Report",
          description: "Track the performance of C2C, C2V, and V2V referral programs.",
          details: "Analyze referral conversions and bonus payouts.",
          type: "referrals"
        },
        {
          title: "Marketing Campaign Report",
          description: "Performance metrics for all marketing campaigns.",
          details: "Includes SMS, social media, and digital marketing.",
          type: "campaigns"
        }
      ]
    }
  ],
  vendor: [
    {
      category: "Business Performance",
      reports: [
        {
          title: "Sales Report",
          description: "Detailed report of your salon's sales and bookings.",
          details: "Track revenue, popular services, and peak booking times.",
          type: "sales"
        },
        {
          title: "Service Performance Report",
          description: "Analytics on your service offerings and staff performance.",
          details: "Identify top-performing services and staff members.",
          type: "service-performance"
        },
        {
          title: "Customer Retention Report",
          description: "Insights into customer loyalty and repeat bookings.",
          details: "Track customer retention rates and lifetime value.",
          type: "customer-retention"
        }
      ]
    },
    {
      category: "Financial Reports",
      reports: [

      ]
    },
    {
      category: "Marketing & Engagement",
      reports: [
        {
          title: "Offer Performance Report",
          description: "Analytics on your promotions and discount effectiveness.",
          details: "Measure ROI on your marketing campaigns and offers.",
          type: "offers"
        },
        {
          title: "Customer Feedback Report",
          description: "Overview of customer reviews and satisfaction scores.",
          details: "Track your reputation and areas for improvement.",
          type: "feedback"
        }
      ]
    }
  ],
  doctor: [
    {
      category: "Consultation Reports",
      reports: [
        {
          title: "Appointment Report",
          description: "Detailed view of your consultation appointments.",
          details: "Track appointment history, cancellations, and reschedules.",
          type: "appointments"
        },
        {
          title: "Patient History Report",
          description: "Overview of patient records and treatment histories.",
          details: "Access consolidated patient data and treatment outcomes.",
          type: "patient-history"
        }
      ]
    },
    {
      category: "Earnings & Performance",
      reports: [
        {
          title: "Consultation Revenue Report",
          description: "Track earnings from patient consultations.",
          details: "Monitor income from different service types and time periods.",
          type: "revenue"
        },
        {
          title: "Performance Metrics",
          description: "Analytics on consultation volume and patient satisfaction.",
          details: "Measure your professional performance and impact.",
          type: "performance"
        }
      ]
    }
  ],
  supplier: [
    {
      category: "Order Management",
      reports: [
        {
          title: "Customer Orders Report",
          description: "Detailed report of all orders received from vendors.",
          details: "Track order status, revenue, and fulfillment metrics.",
          type: "supplier-orders"
        },
        {
          title: "Product Sales Report",
          description: "Analytics on your product sales performance.",
          details: "Track best-selling items, seasonal trends, and revenue.",
          type: "product-sales"
        },
        {
          title: "Inventory Report",
          description: "Real-time overview of stock levels and reorder alerts.",
          details: "Monitor inventory turnover and optimize stock levels.",
          type: "inventory"
        }
      ]
    },
    {
      category: "Financial Reports",
      reports: [

        {
          title: "Supplier Revenue Report",
          description: "Monthly breakdown of your revenue from product sales.",
          details: "Track your earnings on a monthly basis with detailed revenue analytics.",
          type: "supplier-revenue"
        }
      ]
    },
    {
      category: "Marketing & Engagement",
      reports: [
        {
          title: "Offer Performance Report",
          description: "Analytics on your promotions and discount effectiveness.",
          details: "Measure ROI on your marketing campaigns and offers.",
          type: "offers"
        },
        {
          title: "Referral Program Report",
          description: "Detailed report of all your supplier referrals and earnings.",
          details: "Track referral performance and bonuses earned.",
          type: "referrals"
        }
      ]
    }
  ]
};

// Role-specific dashboard statistics
const roleSpecificStats: Record<string, Array<{title: string, icon: React.ReactNode, value: string, change: string}>> = {
  admin: [
    { title: "Total Sales", icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, value: "$1,250,345", change: "+12% from last month" },
    { title: "Active Users", icon: <Users className="h-4 w-4 text-muted-foreground" />, value: "15,234", change: "+8% from last month" },
    { title: "Vendor Growth", icon: <UserPlus className="h-4 w-4 text-muted-foreground" />, value: "+52", change: "New vendors this month" },
    { title: "New Bookings", icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />, value: "+2,350", change: "+5.2% from last month" }
  ],
  vendor: [
    { title: "Monthly Revenue", icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, value: "$24,560", change: "+8% from last month" },
    { title: "Bookings", icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />, value: "342", change: "+12% from last month" },
    { title: "Customer Rating", icon: <Users className="h-4 w-4 text-muted-foreground" />, value: "4.8/5.0", change: "Based on 124 reviews" },
    { title: "Services Offered", icon: <UserPlus className="h-4 w-4 text-muted-foreground" />, value: "24", change: "Active services" }
  ],
  doctor: [
    { title: "Consultations", icon: <Users className="h-4 w-4 text-muted-foreground" />, value: "128", change: "This month" },
    { title: "Avg. Rating", icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, value: "4.9/5.0", change: "Based on patient feedback" },
    { title: "Revenue", icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />, value: "$18,420", change: "+5% from last month" },
    { title: "Availability", icon: <UserPlus className="h-4 w-4 text-muted-foreground" />, value: "22 days", change: "This month" }
  ],
  supplier: [
    { title: "Product Sales", icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />, value: "$42,180", change: "+15% from last month" },
    { title: "Active Products", icon: <UserPlus className="h-4 w-4 text-muted-foreground" />, value: "86", change: "In catalog" },
    { title: "Vendor Partners", icon: <Users className="h-4 w-4 text-muted-foreground" />, value: "142", change: "Active partnerships" },
    { title: "Avg. Rating", icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, value: "4.6/5.0", change: "Based on vendor reviews" }
  ]
};

// Sample report data for previews
const sampleReportData: Record<string, ReportData> = {
  "sales": {
    headers: ["Date", "Booking ID", "Customer", "Service", "Amount", "Status"],
    rows: [
      ["2024-08-01", "BK-001", "John Doe", "Haircut & Styling", "$45.00", "Completed"],
      ["2024-08-01", "BK-002", "Jane Smith", "Facial Treatment", "$75.50", "Completed"],
      ["2024-08-02", "BK-003", "Sam Wilson", "Manicure", "$35.25", "Completed"],
      ["2024-08-02", "BK-004", "Alice Brown", "Hair Color", "$120.00", "Completed"]
    ]
  },
  "appointments": {
    headers: ["Date", "Time", "Patient", "Service", "Status", "Notes"],
    rows: [
      ["2024-08-01", "10:00 AM", "John Doe", "Skin Consultation", "Completed", "Follow-up in 2 weeks"],
      ["2024-08-01", "2:00 PM", "Jane Smith", "Acne Treatment", "Scheduled", ""],
      ["2024-08-02", "11:30 AM", "Sam Wilson", "Anti-Aging Therapy", "Completed", "Prescribed skincare routine"],
      ["2024-08-03", "9:00 AM", "Alice Brown", "Laser Treatment", "Scheduled", ""]
    ]
  },
  "product-sales": {
    headers: ["Product", "Category", "Units Sold", "Revenue", "Stock Remaining"],
    rows: [
      ["Moisturizer Cream", "Skincare", "42", "$1,260.00", "58"],
      ["Sunscreen SPF 50", "Skincare", "36", "$1,080.00", "64"],
      ["Hair Serum", "Haircare", "28", "$840.00", "72"],
      ["Face Wash", "Skincare", "55", "$550.00", "45"]
    ]
  },
  "inventory": {
    headers: ["Product", "Category", "Current Stock", "Reorder Level", "Status"],
    rows: [
      ["Moisturizer Cream", "Skincare", "58", "30", "In Stock"],
      ["Sunscreen SPF 50", "Skincare", "64", "25", "In Stock"],
      ["Hair Serum", "Haircare", "72", "20", "In Stock"],
      ["Face Wash", "Skincare", "45", "50", "Low Stock"]
    ]
  }
};

// Report data generator functions
const generateSalesReportData = (appointments: any[], orders: any[]) => {
  const headers = ["Date", "Booking ID", "Customer", "Service", "Amount", "Status"];
  const rows = [
    ...appointments.slice(0, 5).map(appointment => [
      new Date(appointment.date).toLocaleDateString(),
      appointment._id.substring(0, 8).toUpperCase(),
      appointment.clientName || "Unknown Customer",
      appointment.serviceName || "Service",
      `$${Math.floor(Math.random() * 200) + 50}.00`,
      appointment.status || "Completed"
    ]),
    ...orders.slice(0, 5).map(order => [
      new Date(order.createdAt).toLocaleDateString(),
      order._id.substring(0, 8).toUpperCase(),
      order.customerName || "Unknown Customer",
      "Product Order",
      `$${order.totalAmount || 0}`,
      order.status || "Completed"
    ])
  ];
  
  return { headers, rows };
};

const generateAppointmentsReportData = (appointments: any[]) => {
  const headers = ["Date", "Time", "Patient", "Service", "Status", "Notes"];
  const rows = appointments.slice(0, 8).map(appointment => [
    new Date(appointment.date).toLocaleDateString(),
    new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    appointment.clientName || "Unknown Patient",
    appointment.serviceName || "Consultation",
    appointment.status || "Scheduled",
    appointment.notes || ""
  ]);
  
  return { headers, rows };
};

const generateProductSalesReportData = (products: any[], orders: any[]) => {
  const headers = ["Product", "Category", "Units Sold", "Revenue", "Stock Remaining"];
  const rows = products.slice(0, 6).map(product => [
    product.productName || "Product",
    product.category || "General",
    Math.floor(Math.random() * 50) + 10,
    `$${Math.floor(Math.random() * 1000) + 200}.00`,
    product.stock || 0
  ]);
  
  return { headers, rows };
};

const generateInventoryReportData = (products: any[]) => {
  const headers = ["Product", "Category", "Current Stock", "Reorder Level", "Status"];
  const rows = products.slice(0, 6).map(product => {
    const stock = product.stock || 0;
    const reorderLevel = product.reorderLevel || 20;
    const status = stock < reorderLevel ? "Low Stock" : "In Stock";
    
    return [
      product.productName || "Product",
      product.category || "General",
      stock,
      reorderLevel,
      status
    ];
  });
  
  return { headers, rows };
};

// Add supplier orders report data generator
const generateSupplierOrdersReportData = (orders: SupplierOrder[]) => {
  const headers = ["Order ID", "Vendor", "Products", "Quantity", "Amount", "Status", "Date"];
  const rows = orders.slice(0, 10).map(order => {
    // Calculate total quantity
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Get product names
    const productNames = order.items.map(item => item.productName).join(", ");
    
    return [
      order.orderId || `#${order._id.substring(0, 8).toUpperCase()}`,
      order.vendorId ? `Vendor-${order.vendorId.substring(0, 6).toUpperCase()}` : "Unknown Vendor",
      productNames,
      totalQuantity.toString(),
      `₹${order.totalAmount.toFixed(2)}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ];
  });
  
  return { headers, rows };
};

// Add supplier revenue report data generator
const generateSupplierRevenueReportData = (orders: SupplierOrder[], selectedMonth: string | null = null) => {
  // Filter orders by selected month if provided
  const filteredOrders = selectedMonth 
    ? orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        return orderMonth === selectedMonth;
      })
    : orders;
  
  // Group orders by date
  const dailyRevenue: Record<string, { count: number; revenue: number }> = {};
  
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt);
    // Format date as YYYY-MM-DD for consistent grouping
    const dateString = date.toISOString().split('T')[0];
    
    if (!dailyRevenue[dateString]) {
      dailyRevenue[dateString] = { count: 0, revenue: 0 };
    }
    
    dailyRevenue[dateString].count += 1;
    dailyRevenue[dateString].revenue += order.totalAmount;
  });
  
  // Convert to array and sort by date (newest first)
  const revenueData = Object.entries(dailyRevenue)
    .map(([dateString, data]) => ({
      date: dateString,
      orders: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  const headers = ["Date", "Orders Count", "Total Revenue"];
  const rows = revenueData.map(data => [
    new Date(data.date).toLocaleDateString(),
    data.orders.toString(),
    `₹${data.revenue.toFixed(2)}`
  ]);
  
  return { headers, rows };
};

// Add offers report data generator
const generateOffersReportData = (offers: any[]) => {
  // Calculate summary statistics
  const totalOffers = offers.length;
  const activeOffers = offers.filter(offer => offer.status === 'Active').length;
  const expiredOffers = offers.filter(offer => offer.status === 'Expired').length;
  const scheduledOffers = offers.filter(offer => offer.status === 'Scheduled').length;
  
  // Calculate total redemptions and estimated value
  const totalRedemptions = offers.reduce((sum, offer) => sum + (offer.redeemed || 0), 0);
  
  // Estimate total discount value
  const totalDiscountValue = offers.reduce((sum, offer) => {
    if (offer.type === 'fixed') {
      return sum + (offer.value * (offer.redeemed || 0));
    } else {
      // For percentage discounts, estimate based on average order value of ₹1000
      return sum + (1000 * (offer.value / 100) * (offer.redeemed || 0));
    }
  }, 0);
  
  // Top 5 most redeemed offers
  const topOffers = [...offers]
    .sort((a, b) => (b.redeemed || 0) - (a.redeemed || 0))
    .slice(0, 5);
  
  // Prepare headers and rows for the detailed report
  const headers = ["Offer Code", "Type", "Value", "Status", "Start Date", "Expiry Date", "Redemptions", "Est. Value"];
  const rows = offers.map(offer => [
    offer.code,
    offer.type === 'percentage' ? 'Percentage' : 'Fixed',
    offer.type === 'percentage' ? `${offer.value}%` : `₹${offer.value}`,
    offer.status,
    offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A',
    offer.expires ? new Date(offer.expires).toLocaleDateString() : 'No Expiry',
    offer.redeemed || 0,
    offer.type === 'percentage' 
      ? `₹${(1000 * (offer.value / 100) * (offer.redeemed || 0)).toFixed(2)}` 
      : `₹${(offer.value * (offer.redeemed || 0)).toFixed(2)}`
  ]);
  
  return { headers, rows, summary: {
    totalOffers,
    activeOffers,
    expiredOffers,
    scheduledOffers,
    totalRedemptions,
    totalDiscountValue
  }};
};

// Add referrals report data generator
const generateReferralsReportData = (referrals: any[]) => {
  // Calculate summary statistics
  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(referral => referral.status === 'Pending').length;
  const completedReferrals = referrals.filter(referral => referral.status === 'Completed').length;
  const paidReferrals = referrals.filter(referral => referral.status === 'Bonus Paid').length;
  
  // Calculate total earnings
  const totalEarnings = referrals
    .filter(referral => referral.status === 'Completed' || referral.status === 'Bonus Paid')
    .reduce((sum, referral) => {
      const bonusValue = parseFloat(referral.bonus.replace('₹', '').replace(',', ''));
      return sum + (isNaN(bonusValue) ? 0 : bonusValue);
    }, 0);
  
  // Prepare headers and rows for the detailed report
  const headers = ["Referral ID", "Referral Type", "Referred Person", "Date", "Status", "Bonus"];
  const rows = referrals.map(referral => [
    referral.referralId,
    referral.referralType,
    referral.referee,
    new Date(referral.date).toLocaleDateString(),
    referral.status,
    referral.bonus
  ]);
  
  return { headers, rows, summary: {
    totalReferrals,
    pendingReferrals,
    completedReferrals,
    paidReferrals,
    totalEarnings
  }};
};

// Real report data generator
const getReportDataByType = (reportType: string, data: any, selectedMonth: string | null = null) => {
  switch (reportType) {
    case "sales":
      return generateSalesReportData(data.appointments || [], data.orders || []);
    case "appointments":
      return generateAppointmentsReportData(data.appointments || []);
    case "product-sales":
      return generateProductSalesReportData(data.products || [], data.orders || []);
    case "inventory":
      return generateInventoryReportData(data.products || []);
    case "supplier-orders":
      // Use received orders for suppliers
      const receivedOrders = (data.orders || []).filter((order: SupplierOrder) => order.supplierId);
      return generateSupplierOrdersReportData(receivedOrders);
    case "supplier-revenue":
      // Use received orders for suppliers
      const supplierOrders = (data.orders || []).filter((order: SupplierOrder) => order.supplierId);
      return generateSupplierRevenueReportData(supplierOrders, selectedMonth);
    case "offers":
      return generateOffersReportData(data.offers || []);
    case "referrals":
      return generateReferralsReportData(data.referrals || []);
    default:
      // Return sample data for other report types
      return sampleReportData[reportType] || sampleReportData["sales"];
  }
};

// ReportPreviewTable component
const ReportPreviewTable = ({ reportType, reportData }: { reportType: string; reportData: ReportData }) => {
  return (
    <div className="overflow-x-auto no-scrollbar rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {reportData.headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={cellIndex === 0 ? "font-mono" : ""}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// OffersReportPreview component
const OffersReportPreview = ({ reportData }: { reportData: any }) => {
  const summary = reportData.summary;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalOffers || 0}</div>
            <p className="text-xs text-muted-foreground">All created offers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.activeOffers || 0}</div>
            <p className="text-xs text-muted-foreground">Currently usable</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalRedemptions || 0}</div>
            <p className="text-xs text-muted-foreground">Total times used</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summary?.totalDiscountValue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.expiredOffers || 0}</div>
            <p className="text-xs text-muted-foreground">No longer valid</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.scheduledOffers || 0}</div>
            <p className="text-xs text-muted-foreground">Upcoming offers</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offers Details</CardTitle>
          <CardDescription>Complete list of all offers with usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportPreviewTable reportType="offers" reportData={reportData} />
        </CardContent>
      </Card>
    </div>
  );
};

// ReferralsReportPreview component
const ReferralsReportPreview = ({ reportData }: { reportData: any }) => {
  const summary = reportData.summary;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">All referrals made</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pendingReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completedReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully referred</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.paidReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">Bonuses paid</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summary?.totalEarnings || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total referral income</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Details</CardTitle>
          <CardDescription>Complete list of all your referrals with status and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportPreviewTable reportType="referrals" reportData={reportData} />
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to generate month options including future months
const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  
  // Generate options for the past 12 months and next 12 months
  for (let i = -12; i <= 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'long' });
    const label = `${monthName} ${year}`;
    const value = `${year}-${month}`;
    
    options.push({ label, value });
  }
  
  // Sort by date descending (newest first)
  return options.sort((a, b) => b.value.localeCompare(a.value));
};

export default function ReportsPage() {
  const { user, role, isLoading: isAuthLoading } = useCrmAuth();
  const userRole = role || user?.role || 'admin'; // Default to admin if no role found
  
  // Fetch data based on user role
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useGetAppointmentsQuery(undefined, { 
    skip: userRole !== 'doctor' && userRole !== 'vendor' 
  });
  
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({}, { 
    skip: userRole !== 'vendor' 
  });
  
  const { data: productsData, isLoading: isProductsLoading } = useGetCrmProductsQuery({}, { 
    skip: userRole !== 'supplier' && userRole !== 'vendor' 
  });
  
  const { data: expensesData, isLoading: isExpensesLoading } = useGetExpensesQuery(undefined, { 
    skip: userRole !== 'vendor' 
  });
  
  const { data: ordersData, isLoading: isOrdersLoading } = useGetCrmOrdersQuery(user?._id || '', { 
    skip: !user?._id
  });
  
  const { data: referralsData, isLoading: isReferralsLoading } = useGetCrmReferralsQuery(undefined, { 
    skip: userRole !== 'vendor' && userRole !== 'supplier'
  });
  
  const { data: campaignsData, isLoading: isCampaignsLoading } = useGetCrmCampaignsQuery({}, { 
    skip: userRole !== 'vendor' 
  });
  
  const { data: clientOrdersData, isLoading: isClientOrdersLoading } = useGetCrmClientOrdersQuery(undefined, { 
    skip: userRole !== 'vendor' && userRole !== 'supplier'
  });

  const { data: offersData, isLoading: isOffersLoading } = useGetOffersQuery({}, { 
    skip: userRole !== 'vendor' && userRole !== 'admin' && userRole !== 'supplier'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Simulate loading for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle loading states
  useEffect(() => {
    if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading]);

  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    // Set default month to current month for supplier revenue report
    if (report.type === "supplier-revenue") {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(currentMonth);
    } else {
      setSelectedMonth(null); // Reset selected month when opening a new report
    }
    setIsModalOpen(true);
  };
  
  // Export to CSV
  const exportToCSV = (reportType: string, reportTitle: string) => {
    try {
      // Get real data or fallback to sample data
      const allData = {
        appointments: appointmentsData,
        clients: clientsData,
        products: productsData,
        expenses: expensesData,
        orders: ordersData,
        referrals: referralsData,
        campaigns: campaignsData,
        clientOrders: clientOrdersData,
        offers: offersData
      };
      
      const reportData = getReportDataByType(reportType, allData, reportType === "supplier-revenue" ? selectedMonth : null);
      const headers = reportData.headers.join(',');
      const rows = reportData.rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const csvContent = `${headers}\n${rows}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully as CSV');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export report as CSV');
    }
  };
  
  // Export to Excel (CSV format with .xlsx extension for simplicity)
  const exportToExcel = (reportType: string, reportTitle: string) => {
    try {
      // Get real data or fallback to sample data
      const allData = {
        appointments: appointmentsData,
        clients: clientsData,
        products: productsData,
        expenses: expensesData,
        orders: ordersData,
        referrals: referralsData,
        campaigns: campaignsData,
        clientOrders: clientOrdersData,
        offers: offersData
      };
      
      const reportData = getReportDataByType(reportType, allData, reportType === "supplier-revenue" ? selectedMonth : null);
      const headers = reportData.headers.join('\t');
      const rows = reportData.rows.map(row => row.join('\t')).join('\n');
      const excelContent = `${headers}\n${rows}`;
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully as Excel');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export report as Excel');
    }
  };
  
  // Export to PDF
  const exportToPDF = async (reportType: string, reportTitle: string) => {
    try {
      // Get real data or fallback to sample data
      const allData = {
        appointments: appointmentsData,
        clients: clientsData,
        products: productsData,
        expenses: expensesData,
        orders: ordersData,
        referrals: referralsData,
        campaigns: campaignsData,
        clientOrders: clientOrdersData,
        offers: offersData
      };
      
      const reportData = getReportDataByType(reportType, allData, reportType === "supplier-revenue" ? selectedMonth : null);
      
      // Dynamically import html2pdf only on client side
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;
      
      // Create a temporary HTML element for PDF generation
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px;">${reportTitle}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                ${reportData.headers.map(header => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${reportData.rows.map((row: any[], rowIndex: number) => `
                <tr key="${rowIndex}">
                  ${row.map((cell: any) => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; text-align: right; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleDateString()}
          </p>
        </div>
      `;
      
      const pdfOptions: any = {
        margin: 10,
        filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      await html2pdf().set(pdfOptions).from(element).save();
      toast.success('Report exported successfully as PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export report as PDF');
    }
  };

  // Get reports data based on user role
  const reportsData = useMemo(() => {
    return roleSpecificReports[userRole] || roleSpecificReports['admin'];
  }, [userRole]);

  const filteredReportsData = useMemo(() => {
    if (!searchTerm) return reportsData;

    return reportsData
      .map(category => ({
        ...category,
        reports: category.reports.filter(report =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter(category => category.reports.length > 0);
  }, [reportsData, searchTerm]);

  // Get stats data based on user role
  const statsData = useMemo(() => {
    return roleSpecificStats[userRole] || roleSpecificStats['admin'];
  }, [userRole]);

  // Get report data for preview
  const previewReportData = useMemo(() => {
    if (!selectedReport) return sampleReportData["sales"];
    
    const allData = {
      appointments: appointmentsData,
      clients: clientsData,
      products: productsData,
      expenses: expensesData,
      orders: ordersData,
      referrals: referralsData,
      campaigns: campaignsData,
      clientOrders: clientOrdersData,
      offers: offersData
    };
    
    // For supplier revenue report, pass the selected month
    if (selectedReport.type === "supplier-revenue") {
      const supplierOrders = (allData.orders || []).filter((order: SupplierOrder) => order.supplierId);
      return generateSupplierRevenueReportData(supplierOrders, selectedMonth);
    }
    
    return getReportDataByType(selectedReport.type, allData);
  }, [selectedReport, appointmentsData, clientsData, productsData, expensesData, ordersData, referralsData, campaignsData, clientOrdersData, offersData, selectedMonth]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="relative">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-8">
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex}>
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, reportIndex) => (
                  <Card key={reportIndex}>
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download detailed reports for your {userRole} account.
          </p>
        </div>
        <div className="relative mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full md:w-80 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-10">
        {filteredReportsData.length > 0 ? filteredReportsData.map((category) => (
          <div key={category.category}>
            <h2 className="text-xl font-semibold font-headline mb-4 pb-2 border-b">{category.category}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.reports.map((report, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{report.details}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewClick(report)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportToCSV(report.type, report.title)}>
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          <span>CSV</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToExcel(report.type, report.title)}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Excel</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToPDF(report.type, report.title)}>
                          <Printer className="mr-2 h-4 w-4" />
                          <span>PDF</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No reports found matching your search.</p>
          </div>
        )}
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              A preview of the "{selectedReport?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Month selector for supplier revenue report */}
            {selectedReport?.type === "supplier-revenue" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Month</label>
                <Select value={selectedMonth || undefined} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedReport && (
              selectedReport.type === "offers" ? (
                <OffersReportPreview reportData={previewReportData} />
              ) : selectedReport.type === "referrals" ? (
                <ReferralsReportPreview reportData={previewReportData} />
              ) : (
                <ReportPreviewTable reportType={selectedReport.type} reportData={previewReportData} />
              )
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => selectedReport && exportToCSV(selectedReport.type, selectedReport.title || '')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => selectedReport && exportToExcel(selectedReport.type, selectedReport.title || '')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => selectedReport && exportToPDF(selectedReport.type, selectedReport.title || '')}>
                  <Printer className="mr-2 h-4 w-4" />
                  <span>PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Global styles to hide scrollbars while maintaining functionality */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}