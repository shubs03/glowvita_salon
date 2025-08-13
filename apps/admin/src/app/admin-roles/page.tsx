
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openModal, closeModal } from '@repo/store/slices/modalSlice';

const rolesData = [
  {
    id: 'role_1',
    roleName: "Super Admin",
    permissions: "All Access",
  },
  {
    id: 'role_2',
    roleName: "Support Staff",
    permissions: "View Customers, View Vendors",
  },
   {
    id: 'role_3',
    roleName: "Content Editor",
    permissions: "Manage FAQ, Manage Offers",
  },
   {
    id: 'role_4',
    roleName: "Finance Manager",
    permissions: "View Payouts, View Reports",
  },
];

type Role = typeof rolesData[0];

export default function AdminRolesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector((state) => state.modal);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = rolesData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(rolesData.length / itemsPerPage);

  const handleOpenModal = (type: 'addRole' | 'editRole', role?: Role) => {
    dispatch(openModal({ modalType: type, data: role }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };
  
  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    // API call to delete role
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  }

  const isModalOpen = isOpen && (modalType === 'addRole' || modalType === 'editRole');
  const modalRole = data as Role;

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
              <Button onClick={() => handleOpenModal('addRole')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {currentItems.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.roleName}</TableCell>
                      <TableCell>{role.permissions}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('editRole', role)}>
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(role)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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
      
      {/* Add/Edit Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalType === 'editRole' ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {modalType === 'editRole' ? 'Update the details for this role.' : 'Enter the details for the new role.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">Role Name</Label>
              <Input id="roleName" defaultValue={modalRole?.roleName || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permissions" className="text-right">Permissions</Label>
              <Input id="permissions" defaultValue={modalRole?.permissions || ''} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Role?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the role "{selectedRole?.roleName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={handleConfirmDelete}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
