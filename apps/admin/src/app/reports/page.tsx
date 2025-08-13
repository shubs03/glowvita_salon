
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      title: "Sales Report",
      description: "Detailed report of all sales, bookings, and transactions.",
      details: "Includes profit, loss, and settlement data."
    },
    {
      title: "User Activity Report",
      description: "Report on user registrations, logins, and platform activity.",
      details: "Track user engagement and growth metrics."
    },
    {
      title: "Vendor Performance Report",
      description: "Analytics on vendor bookings, ratings, and payouts.",
      details: "Evaluate and manage vendor performance effectively."
    },
    {
      title: "Customer Demographics Report",
      description: "Insights into your customer base, including location and preferences.",
      details: "Understand your audience to tailor your services."
    },
    {
      title: "Doctor & Dermatologist Report",
      description: "Performance and engagement metrics for registered doctors.",
      details: "Track consultations, revenue, and ratings."
    },
    {
      title: "Supplier & Inventory Report",
      description: "Track supplier performance and product sales.",
      details: "Manage inventory and supplier relationships."
    },
    {
      title: "Offers & Coupons Report",
      description: "Analytics on coupon usage, redemption rates, and campaign ROI.",
      details: "Optimize your promotional strategies."
    },
    {
      title: "Subscription Report",
      description: "Detailed report on subscription revenue and user churn.",
      details: "Monitor the health of your subscription business."
    },
    {
      title: "Referral Program Report",
      description: "Track the performance of C2C, C2V, and V2V referral programs.",
      details: "Analyze referral conversions and bonus payouts."
    },
    {
      title: "Tax & Fees Report",
      description: "A comprehensive breakdown of collected taxes and platform fees.",
      details: "For financial reconciliation and accounting."
    },
    {
      title: "Marketing Campaign Report",
      description: "Performance metrics for all marketing campaigns.",
      details: "Includes SMS, social media, and digital marketing."
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Reports</h1>
      <p className="text-muted-foreground mb-8">
        Generate and download detailed reports for various components of the platform.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{report.details}</p>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
