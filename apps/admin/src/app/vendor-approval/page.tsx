
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { CheckCircle, Eye, XCircle } from 'lucide-react';

const vendorsData = [
    {
        name: "New Beauty Haven",
        email: "contact@newbeauty.com",
        date: "2023-10-27",
    },
    {
        name: "City Style Salon",
        email: "info@citystyle.com",
        date: "2023-10-26",
    },
    {
        name: "Urban Cuts",
        email: "support@urbancuts.dev",
        date: "2023-10-25",
    },
    {
        name: "The Glow Up Studio",
        email: "manager@glowup.com",
        date: "2023-10-24",
    },
    {
        name: "Chic & Co.",
        email: "contact@chicandco.net",
        date: "2023-10-23",
    },
];

export default function VendorApprovalPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = vendorsData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(vendorsData.length / itemsPerPage);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Verification & Approval</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Vendors waiting for verification to join the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vendor) => (
                    <TableRow key={vendor.email}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.date}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                        </Button>
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
              totalItems={vendorsData.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
