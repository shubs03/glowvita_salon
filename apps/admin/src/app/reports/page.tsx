
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Download, Eye } from 'lucide-react';

interface Report {
  title: string;
  description: string;
  details: string;
}

interface ReportCategory {
  category: string;
  reports: Report[];
}

const reportsData: ReportCategory[] = [
    {
        category: "Financial Reports",
        reports: [
            {
                title: "Sales Report",
                description: "Detailed report of all sales, bookings, and transactions.",
                details: "Includes profit, loss, and settlement data."
            },
            {
                title: "Tax & Fees Report",
                description: "A comprehensive breakdown of collected taxes and platform fees.",
                details: "For financial reconciliation and accounting."
            },
            {
                title: "Subscription Report",
                description: "Detailed report on subscription revenue and user churn.",
                details: "Monitor the health of your subscription business."
            },
        ]
    },
    {
        category: "User & Vendor Reports",
        reports: [
            {
                title: "User Activity Report",
                description: "Report on user registrations, logins, and platform activity.",
                details: "Track user engagement and growth metrics."
            },
             {
                title: "Customer Demographics Report",
                description: "Insights into your customer base, including location and preferences.",
                details: "Understand your audience to tailor your services."
            },
            {
                title: "Vendor Performance Report",
                description: "Analytics on vendor bookings, ratings, and payouts.",
                details: "Evaluate and manage vendor performance effectively."
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
        ]
    },
    {
        category: "Marketing & Engagement Reports",
        reports: [
            {
                title: "Offers & Coupons Report",
                description: "Analytics on coupon usage, redemption rates, and campaign ROI.",
                details: "Optimize your promotional strategies."
            },
            {
                title: "Referral Program Report",
                description: "Track the performance of C2C, C2V, and V2V referral programs.",
                details: "Analyze referral conversions and bonus payouts."
            },
            {
                title: "Marketing Campaign Report",
                description: "Performance metrics for all marketing campaigns.",
                details: "Includes SMS, social media, and digital marketing."
            }
        ]
    }
];


export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-2">Reports</h1>
      <p className="text-muted-foreground mb-8">
        Generate and download detailed reports for various components of the platform.
      </p>

      <div className="space-y-10">
        {reportsData.map((category) => (
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
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedReport?.title}</DialogTitle>
                    <DialogDescription>
                        {selectedReport?.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>Report content for "{selectedReport?.title}" will be displayed here.</p>
                    {/* Placeholder for actual report component/data */}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
