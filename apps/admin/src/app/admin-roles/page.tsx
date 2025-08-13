
"use client";

import { useState } from 'react';
import { AddAdminForm, type AdminUser } from '@/components/AddAdminForm';
import { Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openModal, closeModal } from '@repo/store/slices/modal';

const rolesData = [
  {
    id: 'role_1',
    roleName: "Super Admin",
    permissions: "All Access",
    isActive: true,
  },
  {
    id: 'role_2',
    roleName: "Support Staff",
    permissions: "View Customers, View Vendors",
    isActive: true,
  },
  {
    roleName: "Content Editor",
    permissions: "Manage FAQ, Manage Offers",
    isActive: false,
  },
  {
    roleName: "Finance Manager",
    permissions: "View Payouts, View Reports",
    isActive: true,
  },
];

// Mock data for admin users
const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    fullName: 'John Doe',
    mobileNumber: '1234567890',
    email: 'john@example.com',
    role: 'Super Admin',
    designation: 'Administrator',
    address: '123 Admin St, City',
    isActive: true,
  } as AdminUser,
  {
    id: '2',
    fullName: 'Jane Smith',
    mobileNumber: '0987654321',
    email: 'jane@example.com',
    role: 'Content Editor',
    designation: 'Editor',
    address: '456 Editor Ave, Town',
    isActive: false,
  } as AdminUser,
];

export default function AdminRolesPage() {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminUser | null>(null);
  
  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector((state) => state.modal);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = rolesData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(adminUsers.length / itemsPerPage);

  const handleSaveAdmin = (adminData: AdminUser) => {
    if (editingAdmin) {
      // Update existing admin
      setAdminUsers(adminUsers.map(admin => 
        admin.id === editingAdmin.id ? { ...admin, ...adminData } : admin
      ));
    } else {
      // Add new admin
      const newAdmin = {
        ...adminData,
        id: Date.now().toString(),
        isActive: true // Default to active when creating new admin
      };
      setAdminUsers([...adminUsers, newAdmin]);
    }
    setEditingAdmin(null);
    setIsAddAdminOpen(false);
  };

  const handleDeleteAdmin = (id?: string) => {
    if (id) {
      setAdminUsers(adminUsers.filter(admin => admin.id !== id));
    }
  };

  const handleEditAdmin = (admin: AdminUser) => {
    // Create a deep copy of the admin object to avoid reference issues
    const adminCopy = { ...admin };
    setEditingAdmin(adminCopy);
    setIsAddAdminOpen(true);
  };

  const handleOpenModal = (type: 'addRole' | 'editRole', role?: AdminUser) => {
    dispatch(openModal({ modalType: type, data: role }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };
  
  const handleDeleteClick = (role:AdminUser) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    // API call to delete role
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  }

  const isModalOpen = isOpen && (modalType === 'addRole' || modalType === 'editRole');

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
              <Button onClick={() => {
                // Reset editing state and open the form
                setEditingAdmin(null);
                // Close and immediately reopen to ensure form resets
                setIsAddAdminOpen(false);
                setTimeout(() => setIsAddAdminOpen(true), 0);
              }}>
                Add New Admin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.slice(firstItemIndex, lastItemIndex).map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.fullName}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.role}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {admin.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
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
      
      <AddAdminForm 
        isOpen={isAddAdminOpen} 
        onClose={() => {
          setIsAddAdminOpen(false);
          setEditingAdmin(null);
        }} 
        roles={rolesData}
        initialData={editingAdmin}
        onSave={handleSaveAdmin}
        onDelete={editingAdmin ? handleDeleteAdmin : undefined}
        isEditMode={!!editingAdmin}
      />
    </div>
  );
}
