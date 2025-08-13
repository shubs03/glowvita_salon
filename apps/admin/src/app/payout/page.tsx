
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const payoutData = [
  {
    id: "TXN7483982",
    vendor: "Glamour Salon",
    bookingAmount: 100.00,
    platformFee: 15.00,
    tax: 18.00,
    netPayout: 67.00,
    status: "Paid",
  },
  {
    id: "TXN7483981",
    vendor: "Modern Cuts",
    bookingAmount: 50.00,
    platformFee: 7.50,
    tax: 9.00,
    netPayout: 33.50,
    status: "Pending",
  },
  {
    id: "TXN7483980",
    vendor: "Glamour Salon",
    bookingAmount: 250.00,
    platformFee: 37.50,
    tax: 45.00,
    netPayout: 167.50,
    status: "Failed",
  },
  {
    id: "TXN7483979",
    vendor: "Style Lounge",
    bookingAmount: 120.00,
    platformFee: 18.00,
    tax: 21.60,
    netPayout: 80.40,
    status: "Paid",
  },
  {
    id: "TXN7483978",
    vendor: "The Barber Shop",
    bookingAmount: 75.00,
    platformFee: 11.25,
    tax: 13.50,
    netPayout: 50.25,
    status: "Pending",
  }
];

export default function PayoutPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = payoutData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(payoutData.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Payout Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payout Transactions</CardTitle>
              <CardDescription>
                Details of all transactions for vendor payouts, taxes, and fees.
              </CardDescription>
            </div>
            <Button>Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Booking Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Tax (GST)</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((payout) => (
                    <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">{payout.id}</TableCell>
                    <TableCell>{payout.vendor}</TableCell>
                    <TableCell>${payout.bookingAmount.toFixed(2)}</TableCell>
                    <TableCell>${payout.platformFee.toFixed(2)}</TableCell>
                    <TableCell>${payout.tax.toFixed(2)}</TableCell>
                    <TableCell className="font-bold">${payout.netPayout.toFixed(2)}</TableCell>
                    <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payout.status === "Paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : payout.status === "Pending" 
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                        {payout.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                       {payout.status === 'Pending' && (
                         <Button variant="ghost" size="icon">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Mark as Paid</span>
                        </Button>
                       )}
                       {payout.status === 'Failed' && (
                         <Button variant="ghost" size="icon">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <span className="sr-only">Retry</span>
                        </Button>
                       )}
                    </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={payoutData.length}
            />
        </CardContent>
      </Card>
    </div>
  );
}
