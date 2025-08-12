
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";

export default function PayoutPage() {
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
                <TableRow>
                  <TableCell className="font-mono text-xs">TXN7483982</TableCell>
                  <TableCell>Glamour Salon</TableCell>
                  <TableCell>$100.00</TableCell>
                  <TableCell>$15.00</TableCell>
                  <TableCell>$18.00</TableCell>
                  <TableCell className="font-bold">$67.00</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Paid</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">TXN7483981</TableCell>
                  <TableCell>Modern Cuts</TableCell>
                  <TableCell>$50.00</TableCell>
                  <TableCell>$7.50</TableCell>
                  <TableCell>$9.00</TableCell>
                  <TableCell className="font-bold">$33.50</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pending</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button size="sm" className="ml-2">Mark as Paid</Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-mono text-xs">TXN7483980</TableCell>
                  <TableCell>Glamour Salon</TableCell>
                  <TableCell>$250.00</TableCell>
                  <TableCell>$37.50</TableCell>
                  <TableCell>$45.00</TableCell>
                  <TableCell className="font-bold">$167.50</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Failed</span></TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="ml-2">Retry</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
           <Pagination className="mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}
