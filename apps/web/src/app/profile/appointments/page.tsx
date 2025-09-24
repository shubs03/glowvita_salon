
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Search, MapPin, Calendar, X, Edit, Trash2 } from 'lucide-react';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { cn } from '@repo/ui/cn';
import { AppointmentCard } from '../../../components/profile/AppointmentCard';
import { AppointmentDetails } from '../../../components/profile/AppointmentDetails';


const initialAppointments = [
  {
    id: "APP-024",
    service: "Signature Facial",
    date: "2024-08-15T16:00:00Z",
    staff: "Emily White",
    status: "Completed",
    price: 150.0,
    duration: 75,
    salon: {
        name: "GlowVita Elite Spa",
        address: "123 Luxury Ave, Beverly Hills, CA 90210"
    }
  },
  {
    id: "APP-023",
    service: "Haircut & Style",
    date: "2024-07-20T10:00:00Z",
    staff: "Jessica Miller",
    status: "Completed",
    price: 75.0,
    duration: 60,
    salon: {
        name: "Modern Cuts",
        address: "456 Style St, New York, NY 10001"
    }
  },
  {
    id: "APP-027",
    service: "Upcoming Haircut",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    staff: "Jessica Miller",
    status: "Confirmed",
    price: 85.0,
    duration: 60,
    salon: {
        name: "Modern Cuts",
        address: "456 Style St, New York, NY 10001"
    }
  },
  {
    id: "APP-022",
    service: "Hot Stone Massage",
    date: "2024-06-25T13:00:00Z",
    staff: "Michael Chen",
    status: "Cancelled",
    price: 130.0,
    duration: 90,
    salon: {
        name: "Serenity Now Spa",
        address: "789 Relax Rd, Miami, FL 33101"
    }
  },
];

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Set the first upcoming or confirmed appointment as default, or the first one overall
    const [selectedAppointment, setSelectedAppointment] = useState(() => {
        const upcoming = appointments.find(a => new Date(a.date) >= new Date() && a.status === 'Confirmed');
        return upcoming || appointments[0] || null;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appointment =>
            (appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
             appointment.staff.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || appointment.status === statusFilter)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, searchTerm, statusFilter]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredAppointments.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const handleCancelClick = (appointment) => {
        setAppointmentToCancel(appointment);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        const updatedAppointments = appointments.map(appt => 
            appt.id === appointmentToCancel.id ? { ...appt, status: 'Cancelled' } : appt
        );
        setAppointments(updatedAppointments);

        if (selectedAppointment?.id === appointmentToCancel.id) {
            setSelectedAppointment(prev => ({ ...prev, status: 'Cancelled' }));
        }

        setIsCancelModalOpen(false);
        setAppointmentToCancel(null);
        setCancellationReason('');
    };

    // Auto-select the first appointment in the filtered list if the current one is filtered out
    useEffect(() => {
        if (currentItems.length > 0 && !currentItems.some(a => a.id === selectedAppointment?.id)) {
            setSelectedAppointment(currentItems[0]);
        } else if (currentItems.length === 0) {
            setSelectedAppointment(null);
        }
    }, [currentItems, selectedAppointment]);
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                {/* Left Column: Appointments List */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <Card className="shadow-none border-0 bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-bold">My Appointments</CardTitle>
                            <CardDescription>Select an appointment to view details.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="search"
                                      placeholder="Search appointments..."
                                      className="pl-10"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 max-h-[60vh] lg:max-h-[calc(100vh-22rem)] overflow-y-auto no-scrollbar pr-2 -mr-2">
                                {currentItems.length > 0 ? (
                                    currentItems.map(appt => (
                                        <AppointmentCard 
                                            key={appt.id} 
                                            appointment={appt} 
                                            onSelect={() => setSelectedAppointment(appt)}
                                            isSelected={selectedAppointment?.id === appt.id}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <p>No appointments found.</p>
                                    </div>
                                )}
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    className="mt-4"
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    totalItems={filteredAppointments.length}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column: Appointment Details */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <AppointmentDetails appointment={selectedAppointment} onCancelClick={handleCancelClick} />
                </div>
            </div>

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your appointment for {appointmentToCancel?.service}? Please provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
                        <Textarea 
                          id="cancellation-reason"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="e.g., Schedule conflict"
                          className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No, Keep It</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancellationReason.trim()}>Yes, Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

