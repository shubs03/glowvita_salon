
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { CheckCircle, Eye, XCircle, Users, ThumbsUp, Hourglass, ThumbsDown } from 'lucide-react';

const vendorsData = [
    {
        id: "VEN-007",
        name: "New Beauty Haven",
        owner: "Jessica Day",
        phone: "789-012-3456",
        city: "Miami",
        pincode: "33101",
    },
    {
        id: "VEN-008",
        name: "City Style Salon",
        owner: "Winston Bishop",
        phone: "890-123-4567",
        city: "San Diego",
        pincode: "92101",
    },
    {
        id: "VEN-009",
        name: "Urban Cuts",
        owner: "Nick Miller",
        phone: "901-234-5678",
        city: "Portland",
        pincode: "97201",
    },
    {
        id: "VEN-010",
        name: "The Glow Up Studio",
        owner: "Cece Parekh",
        phone: "012-345-6789",
        city: "Seattle",
        pincode: "98101",
    },
    {
        id: "VEN-011",
        name: "Chic & Co.",
        owner: "Schmidt",
        phone: "123-456-7890",
        city: "Los Angeles",
        pincode: "90028",
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

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">450</div>
            <p className="text-xs text-muted-foreground">87% approval rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <p className="text-xs text-muted-foreground">Waiting for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">118</div>
            <p className="text-xs text-muted-foreground">Onboarding rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Vendors waiting for verification to join the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor ID</TableHead>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-mono text-xs">{vendor.id}</TableCell>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.owner}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>{vendor.city}</TableCell>
                      <TableCell>{vendor.pincode}</TableCell>
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
