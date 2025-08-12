
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";

export default function SupplierManagementPage() {
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
                  <TableRow>
                    <TableCell>Global Beauty Supplies</TableCell>
                    <TableCell>125</TableCell>
                    <TableCell>$25,430</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Approved</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>Organic Skincare Inc.</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>$12,810</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pending</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <Pagination className="mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
