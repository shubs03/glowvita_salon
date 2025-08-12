
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";

export default function VendorManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>Details about all registered vendors.</CardDescription>
            </div>
            <Button>Add New Vendor</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Glamour Salon</TableCell>
                  <TableCell>contact@glamoursalon.com</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Disable</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Modern Cuts</TableCell>
                  <TableCell>info@moderncuts.com</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Disable</Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Style Hub</TableCell>
                  <TableCell>support@stylehub.com</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Disabled</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Enable</Button>
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
