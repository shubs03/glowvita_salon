
"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { sidebarNavItems } from '@/lib/routes';
import AddAdminForm, { AdminUser } from '@/components/AddAdminForm';

const initialAdmins: AdminUser[] = [
    {
        id: 'user_1',
        fullName: "Super Admin",
        mobileNumber: "1234567890",
        email: "superadmin@example.com",
        role: "Super Admin",
        designation: "Head Admin",
        address: "123 Admin Lane",
        permissions: sidebarNavItems.map(item => item.permission),
        isActive: true,
    },
    {
        id: 'user_2',
        fullName: "Support Staff",
        mobileNumber: "0987654321",
        email: "support@example.com",
        role: "Support Staff",
        designation: "Support Agent",
        address: "456 Support Street",
        permissions: ["dashboard", "customers", "vendors"],
        isActive: true,
    },
];

const allRoles = [
    { roleName: 'Super Admin', permissions: 'all', isActive: true },
    { roleName: 'Support Staff', permissions: 'limited', isActive: true },
    { roleName: 'Content Editor', permissions: 'limited', isActive: true },
    { roleName: 'Finance Manager', permissions: 'limited', isActive: true },
];

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

    const openModal = (admin: AdminUser | null = null) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
    };

    const handleSaveAdmin = (adminData: AdminUser) => {
        if (adminData.id) {
            setAdmins(admins.map(a => a.id === adminData.id ? adminData : a));
        } else {
            setAdmins([...admins, { ...adminData, id: `user_${Date.now()}` }]);
        }
        closeModal();
    };
    
    const handleDeleteAdmin = (id?: string) => {
        if (id) {
            setAdmins(admins.filter(a => a.id !== id));
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Admin User Management</h1>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Admins</CardTitle>
                            <CardDescription>Add, edit, and assign permissions to admin users.</CardDescription>
                        </div>
                        <Button onClick={() => openModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Admin
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
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
                                {admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="font-medium">{admin.fullName}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                        <TableCell>
                                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                admin.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {admin.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(admin)}>
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
                onClose={closeModal}
                onSave={handleSaveAdmin}
                initialData={editingAdmin}
                roles={allRoles}
                onDelete={handleDeleteAdmin}
                isEditMode={!!editingAdmin}
            />
        </div>
    );
}
