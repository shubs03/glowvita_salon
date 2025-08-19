
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Plus, Search, FileDown, Eye, Edit, Trash2 } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';

type Booking = {
  id: string;
  clientName: string;
  service: string;
  staffName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  cost: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
};

const mockBookings: Booking[] = [
  { id: 'APP-001', clientName: 'Alice Johnson', service: 'Deluxe Haircut', staffName: 'Jane Doe', date: '2024-08-25', time: '10:00', duration: 60, cost: 75, status: 'Confirmed' },
  { id: 'APP-002', clientName: 'Bob Williams', service: 'Manicure', staffName: 'Emily White', date: '2024-08-25', time: '12:30', duration: 45, cost: 40, status: 'Completed' },
  { id: 'APP-003', clientName: 'Charlie Brown', service: 'Facial', staffName: 'Jane Doe', date: '2024-08-26', time: '14:00', duration: 75, cost: 120, status: 'Confirmed' },
  { id: 'APP-004', clientName: 'Diana Prince', service: 'Color & Style', staffName: 'John Smith', date: '2024-08-27', time: '09:00', duration: 180, cost: 250, status: 'Pending' },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(mockBookings);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');

    const filteredBookings = useMemo(() => {
        return bookings.filter(appt => 
            (appt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             appt.service.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || appt.status === statusFilter)
        );
    }, [bookings, searchTerm, statusFilter]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredBookings.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    const handleOpenModal = (type: 'add' | 'edit' | 'view', booking?: Booking) => {
        setModalType(type);
        setSelectedBooking(booking || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if(selectedBooking) {
            setBookings(bookings.filter(a => a.id !== selectedBooking.id));
            setIsDeleteModalOpen(false);
            setSelectedBooking(null);
        }
    };

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
          case 'Confirmed': return 'bg-blue-100 text-blue-800';
          case 'Completed': return 'bg-green-100 text-green-800';
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          case 'Cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Manage Bookings</h1>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                         <div>
                            <CardTitle>All Bookings</CardTitle>
                            <CardDescription>View, create, and manage all client bookings.</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="search" 
                                    placeholder="Search by client or service..."
                                    className="w-full md:w-64 pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button onClick={() => handleOpenModal('add')}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Booking
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map(appt => (
                                    <TableRow key={appt.id}>
                                        <TableCell className="font-medium">{appt.clientName}</TableCell>
                                        <TableCell>{appt.service}</TableCell>
                                        <TableCell>{appt.staffName}</TableCell>
                                        <TableCell>{appt.date} at {appt.time}</TableCell>
                                        <TableCell>₹{appt.cost.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', appt)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', appt)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(appt)}>
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
                        totalItems={filteredBookings.length}
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalType === 'add' ? 'New Booking' : 'Booking Details'}</DialogTitle>
                        <DialogDescription>
                            {modalType === 'add' ? 'Create a new booking.' : `Viewing/editing details for booking #${selectedBooking?.id}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input id="clientName" defaultValue={selectedBooking?.clientName || ''} disabled={modalType==='view'} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" defaultValue={selectedBooking?.date || ''} disabled={modalType==='view'}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" defaultValue={selectedBooking?.time || ''} disabled={modalType==='view'}/>
                            </div>
                        </div>
                        {/* More fields here */}
                    </div>
                    <DialogFooter>
                        {modalType !== 'view' && <Button>Save Changes</Button>}
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Booking?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the booking for "{selectedBooking?.clientName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
