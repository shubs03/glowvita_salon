
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, ToggleRight, ToggleLeft, FileDown, X } from 'lucide-react';
import { Input } from '@repo/ui/input';

const vendorsData = [
  {
    id: "VEN-001",
    name: "Glamour Salon",
    owner: "Alice Johnson",
    phone: "123-456-7890",
    status: "Active",
  },
  {
    id: "VEN-002",
    name: "Modern Cuts",
    owner: "Bob Williams",
    phone: "234-567-8901",
    status: "Active",
  },
  {
    id: "VEN-003",
    name: "Style Hub",
    owner: "Charlie Brown",
    phone: "345-678-9012",
    status: "Disabled",
  },
  {
    id: "VEN-004",
    name: "Beauty Bliss",
    owner: "Diana Prince",
    phone: "456-789-0123",
    status: "Active",
  },
  {
    id: "VEN-005",
    name: "The Men's Room",
    owner: "Clark Kent",
    phone: "567-890-1234",
    status: "Active",
  },
  {
    id: "VEN-006",
    name: "Nail Envy",
    owner: "Lois Lane",
    phone: "678-901-2345",
    status: "Disabled",
  },
];


export default function VendorManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = vendorsData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(vendorsData.length / itemsPerPage);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>Details about all registered vendors.</CardDescription>
            </div>
             <div className="flex gap-2">
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export List
                </Button>
                <Button>Add New Vendor</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="mb-6 p-4 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Input type="text" placeholder="Filter by Salon Name..." />
                    <Input type="text" placeholder="Filter by Owner Name..." />
                    <Input type="text" placeholder="Filter by City..." />
                </div>
            </div>

          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vendor) => (
                    <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.owner}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                            {vendor.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" 
                            className={vendor.status === 'Active' ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-700'}>
                            {vendor.status === 'Active' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                            <span className="sr-only">{vendor.status === 'Active' ? 'Disable' : 'Enable'}</span>
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
