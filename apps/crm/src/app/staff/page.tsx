
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { StaffFormModal } from '@/components/StaffFormModal';
import { ExportButtons } from '@/components/ExportButtons';
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
    sundayAvailable?: boolean;
    sundaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    mondayAvailable?: boolean;
    mondaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    tuesdayAvailable?: boolean;
    tuesdaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    wednesdayAvailable?: boolean;
    wednesdaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    thursdayAvailable?: boolean;
    thursdaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    fridayAvailable?: boolean;
    fridaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    saturdayAvailable?: boolean;
    saturdaySlots?: Array<{ startTime: string; endTime: string; startMinutes: number; endMinutes: number }>;
    blockedTimes?: Array<{
        _id?: string;
        date: Date | string;
        startTime: string;
        endTime: string;
        startMinutes: number;
        endMinutes: number;
        reason: string;
        isRecurring: boolean;
        recurringType?: string;
        isActive: boolean;
    }>;
};

export default function StaffPage() {
    const { user } = useCrmAuth();
    const { data: staffList = [], isLoading, isError, refetch } = useGetStaffQuery(user?._id, {
        skip: !user?._id,
    });

    console.log("Staff List:", staffList)

    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

    // Refetch staff data when the page becomes visible to ensure latest data
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refetch();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refetch]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filteredStaff = useMemo(() => {
        if (!staffList) return [];
        return staffList.filter((staff: Staff) =>
            staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.mobileNo.includes(searchTerm)
        );
    }, [staffList, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredStaff.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const handleOpenModal = (staff?: Staff) => {
        setSelectedStaff(staff || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedStaff) {
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

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <Skeleton className="h-8 w-64" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <div className="relative">
                                    <Skeleton className="h-10 w-80" />
                                </div>
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto no-scrollbar rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary hover:bg-secondary">
                                        {["Name", "Contact", "Position", "Status", "Actions"].map((_, i) => (
                                            <TableHead key={i}>
                                                <Skeleton className="h-5 w-full" />
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i} className="hover:bg-muted/50">
                                            <TableCell className="font-medium py-3">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-10 h-10 rounded-full" />
                                                    <Skeleton className="h-5 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-full mb-1" />
                                                <Skeleton className="h-4 w-24" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Skeleton className="h-8 w-8 rounded" />
                                                    <Skeleton className="h-8 w-8 rounded" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return <div>Error loading staff data.</div>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Staff Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffList.length}</div>
                        <p className="text-xs text-muted-foreground">Total team members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{staffList.filter((s: Staff) => s.status === 'Active').length}</div>
                        <p className="text-xs text-muted-foreground">Currently active members</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>All Staff</CardTitle>
                            <CardDescription>View, add, and manage your staff members.</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, email, or phone..."
                                    className="w-full md:w-80 pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <ExportButtons
                                data={filteredStaff}
                                filename="staff_export"
                                title="Staff Report"
                                columns={[
                                    { header: 'Name', key: 'fullName' },
                                    { header: 'Email', key: 'emailAddress' },
                                    { header: 'Phone', key: 'mobileNo' },
                                    { header: 'Position', key: 'position' },
                                    { header: 'Status', key: 'status' }
                                ]}
                            />
                            <Button onClick={() => handleOpenModal()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Staff
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary hover:bg-secondary">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((staff: Staff) => (
                                    <TableRow key={staff._id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium flex items-center gap-3 py-3">
                                            <img src={staff.photo || `https://placehold.co/40x40.png?text=${staff.fullName[0]}`} alt={staff.fullName} className="w-10 h-10 rounded-full object-cover" />
                                            <span className="font-semibold">{staff.fullName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div>{staff.emailAddress}</div>
                                            <div className="text-sm text-muted-foreground">{staff.mobileNo}</div>
                                        </TableCell>
                                        <TableCell>{staff.position}</TableCell>
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
                    <Pagination
                        className="mt-4"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredStaff.length}
                    />
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
