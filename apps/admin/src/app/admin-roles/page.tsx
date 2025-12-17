
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Skeleton } from "@repo/ui/skeleton";
import { Plus, Edit } from 'lucide-react';
import AddAdminForm, { AdminUser } from '@/components/AddAdminForm';
import { useGetAdminsQuery, useGetSuperDataQuery } from '../../../../../packages/store/src/services/api.js';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { closeModal, openModal } from '../../../../../packages/store/src/slices/modalSlice.js';

const rolesData = [
  {
    id: 'role_1',
    roleName: "Super Admin",
    permissions: "All Access",
    isActive: true,
  },
  {
    id: 'role_2',
    roleName: "admin",
    permissions: "View Customers, View Vendors", 
    isActive: true,
  },
  {
    roleName: "Editor",
    permissions: "Manage FAQ, Manage Offers",
    isActive: false,
  },
  {
    roleName: "Staff",
    permissions: "View Payouts, View Reports",
    isActive: true,
  },
  {
    roleName: "Viewer",
    permissions: "View Payouts, View Reports",
    isActive: true,
  },
];

  



export default function AdminRolesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminUser | null>(null);
  
  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector((state : any) => state.modal);
  const { data: admins, isLoading, isError } = useGetAdminsQuery(undefined);
  const { data: superData = [] } = useGetSuperDataQuery(undefined);

  const designations = useMemo(() => {
    return superData.filter((item: any) => item.type === 'designation').map((item: any) => ({ roleName: item.name }));
  }, [superData]);

  useEffect(() => {
    if (admins) {
      setAdminUsers(admins);
    }
  }, [admins]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = adminUsers.slice(firstItemIndex, lastItemIndex);

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
    dispatch(closeModal());
  };

  const handleDeleteAdmin = (id?: string) => {
    if (id) {
      setAdminUsers(adminUsers.filter(admin => admin.id !== id));
    }
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

  const isModalOpen = isOpen && (modalType === 'addAdmin' || modalType === 'editAdmin');

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-80 mt-2" />
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(7)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-5 w-full" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold font-headline mb-6">
          Admin User Management
        </h1>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manage Admins</CardTitle>
                <CardDescription>
                  Add, edit, and assign permissions to admin users.
                </CardDescription>
              </div>
              <Button onClick={() => dispatch(openModal({ modalType: 'addAdmin' }))}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Admin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {isError && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive">Error loading admins.</TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && currentItems.map((admin: AdminUser) => (
                    <TableRow key={admin._id || admin.id}>
                      <TableCell className="font-medium">
                        {admin.fullName}
                      </TableCell>
                      <TableCell>{admin.emailAddress}</TableCell>
                      <TableCell>{admin.roleName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch(openModal({ modalType: 'editAdmin', data: admin }))}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AddAdminForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAdmin}
          initialData={data as AdminUser}
          roles={designations}
          onDelete={handleDeleteAdmin}
          isEditMode={modalType === 'editAdmin'}
        />
      </div>
    );
}
