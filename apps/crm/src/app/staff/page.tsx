
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Eye, Edit, Trash2, Mail } from 'lucide-react';
import { StaffFormModal } from '@/components/StaffFormModal';
import { useGetStaffQuery, useDeleteStaffMutation, useSendStaffCredentialsMutation } from '@repo/store/api';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Import new components
import StaffStatsCards from './components/StaffStatsCards';
import StaffFiltersToolbar from './components/StaffFiltersToolbar';
import StaffTable from './components/StaffTable';
import StaffPaginationControls from './components/StaffPaginationControls';

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
    commission?: boolean;
    commissionRate?: number;
    earningsSummary?: {
        netBalance: number;
        accumulatedEarnings: number;
        totalPaidOut: number;
        commissionCount: number;
    };
    createdAt?: string;
    updatedAt?: string;
};

export default function StaffPage() {
    const { user } = useCrmAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [commissionStatus, setCommissionStatus] = useState('all');
    const [sortBy, setSortBy] = useState<'createdAt' | 'balance' | 'name'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('personal');
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { data: staffListRaw = [], isLoading, isError, refetch } = useGetStaffQuery(user?._id, {
        skip: !user?._id,
    });

    const staffList = useMemo(() => {
        return [...staffListRaw].sort((a: Staff, b: Staff) => {
            if (sortBy === 'createdAt') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else if (sortBy === 'balance') {
                const balA = a.earningsSummary?.netBalance || 0;
                const balB = b.earningsSummary?.netBalance || 0;
                return sortOrder === 'desc' ? balB - balA : balA - balB;
            } else if (sortBy === 'name') {
                return sortOrder === 'desc'
                    ? b.fullName.localeCompare(a.fullName)
                    : a.fullName.localeCompare(b.fullName);
            }
            return 0;
        });
    }, [staffListRaw, sortBy, sortOrder]);

    console.log("Staff List:", staffList)

    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();
    const [sendCredentials, { isLoading: isSendingMail }] = useSendStaffCredentialsMutation();

    const handleSendMail = async (staffId: string) => {
        try {
            await sendCredentials(staffId).unwrap();
            toast.success("Credentials email sent successfully.");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send credentials email.");
        }
    };

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

    const filteredStaff = useMemo(() => {
        if (!staffList) return [];
        return staffList.filter((staff: Staff) => {
            const matchesSearch = staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.mobileNo.includes(searchTerm);
            const matchesPosition = positionFilter === 'all' || staff.position.toLowerCase().includes(positionFilter.toLowerCase());

            let matchesCommission = true;
            if (commissionStatus === 'enabled') matchesCommission = !!staff.commission;
            else if (commissionStatus === 'disabled') matchesCommission = !staff.commission;
            else if (commissionStatus === 'has_balance') matchesCommission = (staff.earningsSummary?.netBalance || 0) > 0;

            return matchesSearch && matchesPosition && matchesCommission;
        });
    }, [staffList, searchTerm, positionFilter, commissionStatus]);

    // Extract unique positions for the filter dropdown
    const positions = useMemo(() => {
        const uniquePositions: string[] = [];
        const seen = new Set<string>();
        staffList.forEach((staff: Staff) => {
            if (!seen.has(staff.position)) {
                seen.add(staff.position);
                uniquePositions.push(staff.position);
            }
        });
        return uniquePositions;
    }, [staffList]);

    const handleSort = (field: 'createdAt' | 'balance' | 'name') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredStaff.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const handleOpenModal = (staff?: Staff, tab: string = 'personal') => {
        setSelectedStaff(staff || null);
        setModalTab(tab);
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
            <div className="min-h-screen bg-background">
                <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
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
                                            {["Name", "Email", "Phone", "Position", "Status", "Actions"].map((_, i) => (
                                                <TableHead key={i} className={i < 3 ? (i === 0 ? "min-w-[120px]" : (i === 1 ? "min-w-[150px]" : "min-w-[120px]")) : ""}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(5)].map((_, i) => (
                                            <TableRow key={i} className="hover:bg-muted/50">
                                                <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                        <Skeleton className="h-5 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="min-w-[150px] max-w-[180px]">
                                                    <Skeleton className="h-5 w-full mb-1" />
                                                </TableCell>
                                                <TableCell className="min-w-[120px] max-w-[150px]">
                                                    <Skeleton className="h-5 w-full mb-1" />
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
            </div>
        );
    }

    if (isError) {
        return <div>Error loading staff data.</div>
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Enhanced Header Section matching marketplace design */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                                Staff Management
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                View, add, and manage your staff members.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Staff Stats Cards */}
                <StaffStatsCards staffList={staffList} />

                {/* Filters Toolbar */}
                <StaffFiltersToolbar
                    searchTerm={searchTerm}
                    positionFilter={positionFilter}
                    commissionStatus={commissionStatus}
                    onSearchChange={setSearchTerm}
                    onPositionChange={setPositionFilter}
                    onCommissionStatusChange={setCommissionStatus}
                    onAddStaff={() => handleOpenModal()}
                    exportData={filteredStaff}
                    positions={positions}
                />

                {/* Staff Table */}
                <div className="flex-1 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                            <StaffTable
                                currentItems={currentItems}
                                searchTerm={searchTerm}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                                onOpenModal={handleOpenModal}
                                onDeleteClick={handleDeleteClick}
                                onSendMail={handleSendMail}
                                isSendingMail={isSendingMail}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Pagination Controls */}
                <StaffPaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredStaff.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />

                <StaffFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    staff={selectedStaff}
                    initialTab={modalTab}
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
        </div>
    );
}
