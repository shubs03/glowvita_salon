
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Edit2 } from 'lucide-react';

const rolesData = [
  {
    roleName: "Super Admin",
    permissions: "All Access",
  },
  {
    roleName: "Support Staff",
    permissions: "View Customers, View Vendors",
  },
   {
    roleName: "Content Editor",
    permissions: "Manage FAQ, Manage Offers",
  },
   {
    roleName: "Finance Manager",
    permissions: "View Payouts, View Reports",
  },
];

export default function AdminRolesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = rolesData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(rolesData.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Admin Roles & Permissions</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manage Roles</CardTitle>
                <CardDescription>Define roles and assign permissions for admin users.</CardDescription>
              </div>
              <Button>Add New Role</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {currentItems.map((role, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{role.roleName}</TableCell>
                      <TableCell>{role.permissions}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
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
              totalItems={rolesData.length}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
