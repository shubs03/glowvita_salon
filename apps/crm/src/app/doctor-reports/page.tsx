
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Download, Eye, DollarSign, Users, UserPlus, ShoppingCart, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';

interface Report {
  title: string;
  description: string;
  details: string;
}

const reportsData: Report[] = [
    { title: "Monthly Earnings", description: "Detailed breakdown of your earnings.", details: "Includes consultation fees and referral bonuses." },
    { title: "Consultation History", description: "Complete log of all past consultations.", details: "Filter by date, patient, or consultation type." },
    { title: "Patient Demographics", description: "Insights into your patient base.", details: "View statistics on age, gender, and location." },
    { title: "Referral Performance", description: "Track the success of your referrals.", details: "See who has signed up and your bonus status." },
    { title: "Payout History", description: "A record of all payouts to your bank account.", details: "Includes dates, amounts, and transaction IDs." }
];

const dummyReportData = [
  { id: 'REP-001', name: 'John Doe', amount: '₹1500.00', date: '2024-08-01' },
  { id: 'REP-002', name: 'Jane Smith', amount: '₹2000.50', date: '2024-08-02' },
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


export default function DoctorReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
          <h1 className="text-2xl font-bold font-headline mb-2">My Reports</h1>
          <p className="text-muted-foreground">
              Generate and download detailed reports for your activities on the platform.
          </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportsData.map((report, index) => (
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
