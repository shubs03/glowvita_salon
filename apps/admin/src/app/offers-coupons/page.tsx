
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";

export default function OffersCouponsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Offers & Coupons Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Coupons</CardTitle>
              <CardDescription>Manage and create new promotional coupons.</CardDescription>
            </div>
            <Button>Create New Coupon</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>SUMMER24</TableCell>
                  <TableCell>20% Off</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></TableCell>
                  <TableCell>2024-08-31</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Deactivate</Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>NEWUSER10</TableCell>
                  <TableCell>$10 Off</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Deactivate</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>EXPIRED01</TableCell>
                  <TableCell>15% Off</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Expired</span></TableCell>
                  <TableCell>2023-12-31</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
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
