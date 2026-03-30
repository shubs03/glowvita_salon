import { ReportCategory } from '../types';

export const reportsData: ReportCategory[] = [
  {
    category: "Financial Reports",
    reports: [
      {
        title: "Sales Report",
        description: "Consolidated report of service and product sales.",
        details: "Combined revenue breakdown for services and products."
      },
      {
        title: "Subscription Report",
        description: "Detailed report on subscription revenue and user churn.",
        details: "Monitor the health of your subscription business."
      },
      {
        title: "Sales by Product",
        description: "Revenue breakdown by individual products/services.",
        details: "Compare performance across different products/services."
      }
    ]
  },
  {
    category: "Booking Summary",
    reports: [
      {
        title: "Sales by Services",
        description: "Overview of services sold and their performance metrics.",
        details: "Track which services are most popular and profitable."
      },
      {
        title: "Total Bookings",
        description: "Complete report of all bookings made on the platform.",
        details: "Comprehensive view of booking volume and trends."
      },
      {
        title: "Completed Bookings",
        description: "Detailed report of successfully completed bookings.",
        details: "Track service fulfillment and customer satisfaction."
      },
      {
        title: "Cancellations",
        description: "Analysis of cancelled bookings and reasons.",
        details: "Identify patterns and reduce cancellation rates."
      }
    ]
  },
  {
    category: "Marketing & Engagement Reports",
    reports: [
      {
        title: "Marketing Campaign Report",
        description: "Performance metrics for all marketing campaigns.",
        details: "Includes SMS, social media, and digital marketing."
      }
    ]
  },
  {
    category: "Referral Reports",
    reports: [
      {
        title: "Referral Report",
        description: "Comprehensive report of all referral activities.",
        details: "Track who referred whom, including clients, vendors, doctors, and suppliers with bonus amounts."
      }
    ]
  },
  {
    category: "Admin Settlement Reports",
    reports: [
      {
        title: "Vendor Payout Settlement Report-service",
        description: "Amount admin pays to vendor for services",
        details: "Track vendor payouts for services."
      },
      {
        title: "Vendor Payout Settlement Report - Product",
        description: "Amount admin pays to vendor for products",
        details: "Track vendor payouts for products with platform fee, tax, and total amounts."
      },
      {
        title: "Vendor Payable to Admin Report-service",
        description: "Amount vendor pays to admin for services",
        details: "Track platform fees, taxes, and other revenues from vendors."
      },
      {
        title: "Vendor Payable to Admin Report - Product",
        description: "Amount vendor pays to admin for products",
        details: "Track platform fees, taxes, and other revenues from vendors for products with Payee Type, Payee Name, product Platform Fee, product Tax/gst, and Total amounts."
      },
      {
        title: "Settlement Payment History",
        description: "Actual money transfer history between Admin and Vendors",
        details: "Track who paid how much and when, including transaction IDs and methods."
      },
      {
        title: "Platform Collections",
        description: "Revenue from product orders including platform fees and taxes",
        details: "Track total collections from product orders with breakdown of platform fees and GST."
      }
    ]
  }
];
