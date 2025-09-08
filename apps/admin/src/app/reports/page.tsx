
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Download, Eye, DollarSign, Users, UserPlus, ShoppingCart, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';

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

const dummyReportData = [
  { id: 'REP-001', name: 'John Doe', amount: '$150.00', date: '2024-08-01' },
  { id: 'REP-002', name: 'Jane Smith', amount: '$200.50', date: '2024-08-02' },
  { id: 'REP-003', name: 'Sam Wilson', amount: '$75.25', date: '2024-08-03' },
  { id: 'REP-004', name: 'Alice Brown', amount: '$300.00', date: '2024-08-04' },
];

const DummyReportTable = () => (
    <div className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dummyReportData.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>{item.date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state for skeleton demo
  
  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  
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
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="relative mt-4 md:mt-0">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports sections skeleton */}
        <div className="space-y-10">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, cardIndex) => (
                  <Card key={cardIndex} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-24" />
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
                Generate and download detailed reports for various components of the platform.
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250,345</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,234</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Growth</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+52</div>
            <p className="text-xs text-muted-foreground">New vendors this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
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
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedReport?.title}</DialogTitle>
                    <DialogDescription>
                        A preview of the "{selectedReport?.title}".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <DummyReportTable />
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
