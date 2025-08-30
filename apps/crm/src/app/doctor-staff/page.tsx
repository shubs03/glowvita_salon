
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

type Staff = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
};

const mockStaff: Staff[] = [
  { id: 'STAFF-001', name: 'Alex Green', role: 'Assistant', email: 'alex@yourclinic.com', phone: '123-456-7890', status: 'Active' },
  { id: 'STAFF-002', name: 'Maria Hill', role: 'Receptionist', email: 'maria@yourclinic.com', phone: '234-567-8901', status: 'Active' },
];

export default function DoctorStaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>(mockStaff);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    const handleOpenModal = (staff?: Staff) => {
        setSelectedStaff(staff || null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Manage My Staff</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffList.length}</div>
                        <p className="text-xs text-muted-foreground">Active and inactive staff</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Staff Members</CardTitle>
                        <Button onClick={() => handleOpenModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Staff Member
                        </Button>
                    </div>
                    <CardDescription>
                        Add and manage your clinic's staff members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffList.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.role}</TableCell>
                                        <TableCell>
                                            <div>{staff.email}</div>
                                            <div className="text-sm text-muted-foreground">{staff.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {staff.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(staff)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                    </DialogHeader>
                    {/* Form would go here */}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
