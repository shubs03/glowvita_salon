
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, ShoppingBag } from 'lucide-react';
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
  timing?: {
    sunday: { startTime: string; endTime: string; isWorking: boolean };
    monday: { startTime: string; endTime: string; isWorking: boolean };
    tuesday: { startTime: string; endTime: string; isWorking: boolean };
    wednesday: { startTime: string; endTime: string; isWorking: boolean };
    thursday: { startTime: string; endTime: string; isWorking: boolean };
    friday: { startTime: string; endTime: string; isWorking: boolean };
    saturday: { startTime: string; endTime: string; isWorking: boolean };
  };
  blockTime?: {
    entries: Array<{
      _id?: string;
      date: string;
      startTime: string;
      endTime: string;
      description: string;
    }>;
  };
};

export default function StaffPage() {
    const { user } = useCrmAuth();
    const { data: staffList = [], isLoading, isError, refetch } = useGetStaffQuery(user?._id, {
        skip: !user?._id,
    });
    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewStaff, setViewStaff] = useState<Staff | null>(null);
    
    const filteredStaff = useMemo(() => {
        if (!staffList) return [];
        return staffList.filter(staff => 
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
    
    const handleViewClick = (staff: Staff) => {
        setViewStaff(staff);
        setIsViewModalOpen(true);
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
                        <div className="text-2xl font-bold text-green-600">{staffList.filter(s => s.status === 'Active').length}</div>
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
                            <Button variant="outline">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
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
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map(staff => (
                                    <TableRow key={staff._id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <img src={staff.photo || `https://placehold.co/40x40.png?text=${staff.fullName[0]}`} alt={staff.fullName} className="w-8 h-8 rounded-full object-cover" />
                                            {staff.fullName}
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
                                            <Button variant="ghost" size="icon" onClick={() => handleViewClick(staff)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
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
            
            {/* View Staff Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Staff Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {viewStaff?.fullName}
                        </DialogDescription>
                    </DialogHeader>
                    {viewStaff && (
                        <div className="space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={viewStaff.photo || `https://placehold.co/80x80.png?text=${viewStaff.fullName[0]}`} 
                                    alt={viewStaff.fullName} 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" 
                                />
                                <div>
                                    <h3 className="text-xl font-semibold">{viewStaff.fullName}</h3>
                                    <p className="text-gray-600">{viewStaff.position}</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(viewStaff.status)}`}>
                                        {viewStaff.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Contact Information</h4>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                                        <p className="mt-1">{viewStaff.emailAddress}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Mobile Number</Label>
                                        <p className="mt-1">{viewStaff.mobileNo}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Work Information</h4>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Position</Label>
                                        <p className="mt-1">{viewStaff.position}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                                        <p className="mt-1">{viewStaff.status}</p>
                                    </div>
                                    {viewStaff.timing && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Working Hours</Label>
                                            <div className="mt-1 space-y-1">
                                                {Object.entries(viewStaff.timing).map(([day, schedule]: [string, any]) => (
                                                    schedule.isWorking && (
                                                        <div key={day} className="text-sm">
                                                            <span className="font-medium capitalize">{day}:</span> {schedule.startTime} - {schedule.endTime}
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {viewStaff.blockTime && viewStaff.blockTime.entries && viewStaff.blockTime.entries.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Block Time Entries</Label>
                                            <div className="mt-1 space-y-2">
                                                {viewStaff.blockTime.entries.map((entry: any, index: number) => (
                                                    <div key={index} className="text-sm border p-2 rounded bg-red-50">
                                                        <div><span className="font-medium">Date:</span> {entry.date}</div>
                                                        <div><span className="font-medium">Time:</span> {entry.startTime} - {entry.endTime}</div>
                                                        {entry.description && <div><span className="font-medium">Reason:</span> {entry.description}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Modal */}
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
