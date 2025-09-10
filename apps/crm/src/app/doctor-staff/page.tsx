
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { StaffFormModal } from '@/components/StaffFormModal';
import { useGetStaffQuery, useDeleteStaffMutation } from '@repo/store/api';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';

export type Staff = {
  _id: string;
  fullName: string;
  position: string;
  mobileNo: string;
  emailAddress: string;
  photo?: string;
  status: 'Active' | 'Inactive';
};

export default function DoctorStaffPage() {
    const { user } = useCrmAuth();
    const { data: staffList = [], isLoading, isError, refetch } = useGetStaffQuery(user?._id, {
        skip: !user?._id,
    });
    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const handleOpenModal = (staff?: Staff) => {
        setSelectedStaff(staff || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if(selectedStaff) {
            try {
                await deleteStaff(selectedStaff._id).unwrap();
                toast.success("Staff member deleted successfully.");
                refetch();
            } catch (err) {
                toast.error("Failed to delete staff member.");
            } finally {
                setIsDeleteModalOpen(false);
                setSelectedStaff(null);
            }
        }
    };
    
    const getStatusColor = (status: Staff['status']) => {
        switch (status) {
          case 'Active': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

    if(isLoading) {
        return <div>Loading staff...</div>
    }

    if(isError) {
        return <div>Error loading staff data.</div>
    }

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
                                {staffList.map((staff: Staff) => (
                                    <TableRow key={staff._id}>
                                        <TableCell className="font-medium">{staff.fullName}</TableCell>
                                        <TableCell>{staff.position}</TableCell>
                                        <TableCell>
                                            <div>{staff.emailAddress}</div>
                                            <div className="text-sm text-muted-foreground">{staff.mobileNo}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(staff.status)}`}>
                                                {staff.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(staff)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(staff)}>
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

            <StaffFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                staff={selectedStaff}
                onSuccess={() => {
                    setIsModalOpen(false);
                    refetch();
                }}
            />
            
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Staff Member?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedStaff?.fullName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
