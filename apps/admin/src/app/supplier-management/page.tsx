
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const suppliersData = [
  {
    name: "Global Beauty Supplies",
    products: 125,
    sales: 25430,
    status: "Approved",
  },
  {
    name: "Organic Skincare Inc.",
    products: 45,
    sales: 12810,
    status: "Pending",
  },
  {
    name: "Nail Art Creations",
    products: 210,
    sales: 32050,
    status: "Approved",
  },
  {
    name: "Modern Hair Tools",
    products: 80,
    sales: 18900,
    status: "Rejected",
  },
  {
    name: "Spa Essentials",
    products: 60,
    sales: 9500,
    status: "Pending",
  },
];


export default function SupplierManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = suppliersData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(suppliersData.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Supplier Management</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Suppliers</CardTitle>
                <CardDescription>Manage suppliers and their product listings.</CardDescription>
              </div>
              <Button>Add New Supplier</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.products}</TableCell>
                      <TableCell>${supplier.sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            supplier.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : supplier.status === "Pending" 
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {supplier.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                        {supplier.status === "Pending" && (
                          <>
                            <Button variant="ghost" size="icon">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Reject</span>
                            </Button>
                          </>
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
                totalItems={suppliersData.length}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
