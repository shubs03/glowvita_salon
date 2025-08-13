
"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Checkbox } from '@repo/ui/checkbox';
import { Trash2, Edit, Plus } from 'lucide-react';
import { sidebarNavItems } from '@/lib/routes';

interface Role {
    id: string;
    roleName: string;
    permissions: string[];
}

const initialRoles: Role[] = [
    {
        id: 'role_1',
        roleName: "Super Admin",
        permissions: sidebarNavItems.map(item => item.permission), // All permissions
    },
    {
        id: 'role_2',
        roleName: "Support Staff",
        permissions: ["dashboard", "customers", "vendors"],
    },
    {
        id: 'role_3',
        roleName: "Content Editor",
        permissions: ["dashboard", "faq-management", "marketing"],
    },
    {
        id: 'role_4',
        roleName: "Finance Manager",
        permissions: ["dashboard", "payout", "reports", "tax-fees"],
    },
];

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const openModal = (role: Role | null = null) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
    };
    
    const openDeleteModal = (role: Role) => {
        setEditingRole(role);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setEditingRole(null);
    };

    const handleSaveRole = (roleData: Role) => {
        if (editingRole) {
            setRoles(roles.map(r => r.id === roleData.id ? roleData : r));
        } else {
            setRoles([...roles, { ...roleData, id: `role_${Date.now()}` }]);
        }
        closeModal();
    };
    
    const handleDeleteRole = () => {
        if (editingRole) {
            setRoles(roles.filter(r => r.id !== editingRole.id));
            closeDeleteModal();
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Admin Roles & Permissions</h1>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Roles</CardTitle>
                            <CardDescription>Define roles and assign permissions for admin users.</CardDescription>
                        </div>
                        <Button onClick={() => openModal()}>
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
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">{role.roleName}</TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {role.permissions.join(', ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal(role)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-red-500 hover:text-red-700" 
                                                onClick={() => openDeleteModal(role)}
                                                disabled={role.roleName === 'Super Admin'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <RoleFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveRole}
                role={editingRole}
            />

            <Dialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role "{editingRole?.roleName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteRole}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Role) => void;
    role: Role | null;
}

function RoleFormModal({ isOpen, onClose, onSave, role }: RoleFormModalProps) {
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    React.useEffect(() => {
        if (role) {
            setRoleName(role.roleName);
            setSelectedPermissions(role.permissions);
        } else {
            setRoleName('');
            setSelectedPermissions([]);
        }
    }, [role, isOpen]);

    const handlePermissionChange = (permission: string, checked: boolean) => {
        setSelectedPermissions(prev =>
            checked ? [...prev, permission] : prev.filter(p => p !== permission)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: role?.id || '',
            roleName,
            permissions: selectedPermissions
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                        <DialogDescription>
                            Set the role name and select the pages this role can access.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input
                                id="roleName"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                required
                                disabled={role?.roleName === 'Super Admin'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-md border p-4 max-h-64 overflow-y-auto">
                                {sidebarNavItems.map(item => (
                                    <div key={item.permission} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={item.permission}
                                            checked={selectedPermissions.includes(item.permission)}
                                            onCheckedChange={(checked) => handlePermissionChange(item.permission, !!checked)}
                                            disabled={role?.roleName === 'Super Admin'}
                                        />
                                        <label
                                            htmlFor={item.permission}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {item.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={role?.roleName === 'Super Admin'}>Save Role</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Checkbox component needs to be available in the project.
// Assuming it exists at @repo/ui/checkbox
declare module "@repo/ui/checkbox" {
    const Checkbox: React.FC<any>;
    export { Checkbox };
}
