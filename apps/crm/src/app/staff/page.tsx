
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
  // Individual day availability fields from Staff model
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
  // Block times from Staff model
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
                                {currentItems.map((staff: Staff) => (
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
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0 border-b pb-4">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Eye className="w-3 h-3 text-blue-600" />
                            </div>
                            Staff Profile
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm">
                            Profile information for {viewStaff?.fullName}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewStaff && (
                        <div className="flex-1 overflow-y-auto pr-1" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                            <div className="space-y-6 py-3">
                                {/* Profile Header Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img 
                                                src={viewStaff.photo || `https://placehold.co/80x80.png?text=${viewStaff.fullName[0]}`} 
                                                alt={viewStaff.fullName} 
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" 
                                            />
                                            <div className={`absolute -bottom-0 -right-0 w-4 h-4 rounded-full border-2 border-white ${
                                                viewStaff.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{viewStaff.fullName}</h3>
                                            <p className="text-gray-600 mb-2">{viewStaff.position}</p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                viewStaff.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                                    viewStaff.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                                                }`}></div>
                                                {viewStaff.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Contact Information Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-5 h-5 text-gray-400">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</Label>
                                                    <p className="text-gray-900 font-medium">{viewStaff.emailAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-5 h-5 text-gray-400">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile Number</Label>
                                                    <p className="text-gray-900 font-medium">{viewStaff.mobileNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employment Information Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-900">Employment Details</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Position</Label>
                                                <p className="text-gray-900 font-medium">{viewStaff.position}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</Label>
                                                <p className="text-gray-900 font-medium">{viewStaff.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Working Hours Section */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Working Schedule</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { day: 'Sunday', available: viewStaff.sundayAvailable, slots: viewStaff.sundaySlots },
                                            { day: 'Monday', available: viewStaff.mondayAvailable, slots: viewStaff.mondaySlots },
                                            { day: 'Tuesday', available: viewStaff.tuesdayAvailable, slots: viewStaff.tuesdaySlots },
                                            { day: 'Wednesday', available: viewStaff.wednesdayAvailable, slots: viewStaff.wednesdaySlots },
                                            { day: 'Thursday', available: viewStaff.thursdayAvailable, slots: viewStaff.thursdaySlots },
                                            { day: 'Friday', available: viewStaff.fridayAvailable, slots: viewStaff.fridaySlots },
                                            { day: 'Saturday', available: viewStaff.saturdayAvailable, slots: viewStaff.saturdaySlots }
                                        ].map(({ day, available, slots }) => (
                                            <div key={day} className={`p-4 rounded-lg border-2 transition-all ${
                                                available && slots && slots.length > 0 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900 text-sm">{day}</span>
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        available && slots && slots.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}></div>
                                                </div>
                                                {available && slots && slots.length > 0 ? (
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        {slots[0].startTime} - {slots[0].endTime}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400">Off Day</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Block Time Entries */}
                                {viewStaff.blockedTimes && viewStaff.blockedTimes.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center mb-6">
                                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-900">Blocked Time Periods</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {viewStaff.blockedTimes.map((entry: any, index: number) => (
                                                entry.isActive && (
                                                    <div key={index} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-red-900 mb-1">
                                                                    {new Date(entry.date).toLocaleDateString('en-US', { 
                                                                        weekday: 'short', 
                                                                        year: 'numeric', 
                                                                        month: 'short', 
                                                                        day: 'numeric' 
                                                                    })}
                                                                </p>
                                                                <p className="text-sm text-red-700 mb-1">
                                                                    {entry.startTime} - {entry.endTime}
                                                                </p>
                                                                {entry.reason && (
                                                                    <p className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                                        {entry.reason}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="flex-shrink-0 border-t pt-4 bg-gray-50 rounded-b-lg">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsViewModalOpen(false)}
                            className="w-full sm:w-auto px-6 py-2 font-medium"
                        >
                            Close Profile
                        </Button>
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
