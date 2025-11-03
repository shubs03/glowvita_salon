"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { AlertCircle, Calendar, CheckCircle, X, Trash, Search, MapPin, Clock, User, Scissors, DollarSign, Edit, MoreVertical, Link as LinkIcon, Info } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { cn } from '@repo/ui/cn';
import { useUserAppointments } from '@/hooks/useUserAppointments';

// Initial appointments are now fetched from the API
const initialAppointments: Appointment[] = [];

interface Appointment {
  id: string;
  service: string;
  date: string;
  staff: string;
  status: 'Completed' | 'Confirmed' | 'Cancelled';
  price: number;
  duration: number;
  salon: {
    name: string;
    address: string;
  };
  serviceItems?: Array<{
    service: string;
    serviceName: string;
    staff: string | null;
    staffName: string;
    startTime: string;
    endTime: string;
    duration: number;
    amount: number;
  }>;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onSelect: () => void;
  isSelected: boolean;
}

const AppointmentCard = ({ appointment, onSelect, isSelected }: AppointmentCardProps) => {
    console.log("AppointmentCard received appointment:", appointment);
    const statusConfig = {
        Completed: { icon: CheckCircle, color: 'text-green-500' },
        Confirmed: { icon: Calendar, color: 'text-blue-500' },
        Cancelled: { icon: X, color: 'text-red-500' },
    };
    const StatusIcon = statusConfig[appointment.status]?.icon || CheckCircle;
    console.log("appointment ",appointment);
    
    // Safely parse the date
    let displayDate = 'Invalid Date';
    try {
        const dateObj = new Date(appointment.date);
        if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString();
        }
    } catch (e) {
        console.error('Error parsing date:', e);
    }
    
    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md",
                isSelected ? "bg-primary/10 border-primary shadow-lg" : "bg-card hover:border-gray-300"
            )}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold">{appointment.service}</p>
                    <p className="text-sm text-muted-foreground">{displayDate}</p>
                </div>
                <div className={`flex items-center text-xs font-medium gap-1 ${statusConfig[appointment.status]?.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {appointment.status}
                </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
                with {appointment.staff} at {appointment.salon.name}
            </div>
        </button>
    );
};

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onCancelClick: (appointment: Appointment) => void;
}

const AppointmentDetails = ({ appointment, onCancelClick }: AppointmentDetailsProps) => {
    console.log("AppointmentDetails received appointment:", appointment);
    if (!appointment) return (
        <Card className="sticky top-24">
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>Select an appointment to see details.</p>
                </div>
            </CardContent>
        </Card>
    );

    const statusConfig = {
        Completed: { color: 'bg-green-100 text-green-800' },
        Confirmed: { color: 'bg-blue-100 text-blue-800' },
        Cancelled: { color: 'bg-red-100 text-red-800' },
    };
    
    const isAppointmentCancellable = (appointmentDate: string) => {
        const now = new Date();
        const apptDate = new Date(appointmentDate);
        const hoursDifference = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursDifference > 24;
    };
    
    // Safely parse the date for display
    let displayDate = 'Invalid Date';
    let displayDateTime = 'Invalid Date';
    try {
        const dateObj = new Date(appointment.date);
        if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            displayDateTime = `${displayDate} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    } catch (e) {
        console.error('Error parsing date in AppointmentDetails:', e);
    }

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{appointment.service}</CardTitle>
                    <Badge className={cn("text-xs", statusConfig[appointment.status]?.color)}>
                        {appointment.status}
                    </Badge>
                </div>
                <CardDescription>{appointment.salon.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Date & Time</p>
                            <p className="text-sm text-muted-foreground">
                                {displayDateTime}
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{appointment.duration} minutes</p>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h4 className="font-semibold">Options</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start gap-2"><Calendar className="h-4 w-4"/> Add to Calendar</Button>
                        <Button variant="outline" className="justify-start gap-2"><MapPin className="h-4 w-4"/> Get Directions</Button>
                        <Button variant="outline" className="justify-start gap-2" disabled={!isAppointmentCancellable(appointment.date)} onClick={() => onCancelClick(appointment)}>
                            <Edit className="h-4 w-4"/> Manage Appointment
                        </Button>
                         <Button variant="outline" className="justify-start gap-2"><LinkIcon className="h-4 w-4"/> Salon Details</Button>
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-3">
                    <h4 className="font-semibold">Service & Booking Summary</h4>
                    <div className="text-sm space-y-2">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Service</span>
                            <span>{appointment.service}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Professional</span>
                            <span>{appointment.staff}</span>
                        </div>
                         <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{appointment.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AppointmentsPage() {
    const { appointments: userAppointments, isLoading, error } = useUserAppointments();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Update appointments when user appointments data changes
    // Use a ref to track if we've already set the initial selection to prevent infinite loops
    const hasSetInitialSelection = useRef(false);

    console.log("Appointments:", userAppointments)
    
    useEffect(() => {
        if (userAppointments) {
            console.log("Raw user appointments data:", userAppointments);
            setAppointments(userAppointments);
            // Set the first appointment as selected if none is selected and there are appointments
            // Only do this once to prevent infinite loops
            if (!hasSetInitialSelection.current && !selectedAppointment && userAppointments.length > 0) {
                setSelectedAppointment(userAppointments[0]);
                hasSetInitialSelection.current = true;
            }
        }
    }, [userAppointments]); // Remove selectedAppointment from dependencies

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appointment =>
            (appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
             appointment.staff.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || appointment.status === statusFilter)
        );
    }, [appointments, searchTerm, statusFilter]);

    const handleCancelClick = (appointment: Appointment) => {
        setAppointmentToCancel(appointment);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        // In a real implementation, this would call an API to cancel the appointment
        setAppointments(appointments.map(appt => 
            appt.id === appointmentToCancel!.id ? { ...appt, status: 'Cancelled' } : appt
        ));
        setIsCancelModalOpen(false);
        setAppointmentToCancel(null);
        setCancellationReason('');
        if (selectedAppointment?.id === appointmentToCancel!.id) {
            setSelectedAppointment(prev => prev ? ({ ...prev, status: 'Cancelled' }) : null);
        }
    };
    
    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                        <p>Loading your appointments...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>Failed to load appointments. Please try again later.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={Calendar} title="Upcoming" value={appointments.filter(a => {
                            try {
                                return new Date(a.date) > new Date() && a.status === 'Confirmed';
                            } catch (e) {
                                console.error('Error parsing date for stats:', e);
                                return false;
                            }
                        }).length} change="Next in 3 days" />
                        <StatCard icon={CheckCircle} title="Completed" value={appointments.filter(a => a.status === 'Completed').length} change="All time" />
                        <StatCard icon={X} title="Cancelled" value={appointments.filter(a => a.status === 'Cancelled').length} change="All time" />
                    </div>
                    
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                        {/* Left Column: Appointments List */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Appointments</CardTitle>
                                    <CardDescription>Select an appointment to view details.</CardDescription>
                                    <div className="pt-4 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              type="search"
                                              placeholder="Search by service or staff..."
                                              className="pl-8"
                                              value={searchTerm}
                                              onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map(appt => (
                                            <AppointmentCard 
                                                key={appt.id} 
                                                appointment={appt} 
                                                onSelect={() => setSelectedAppointment(appt)}
                                                isSelected={selectedAppointment?.id === appt.id}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">No appointments found.</p>
                                            <p className="text-sm text-muted-foreground mt-2">Book your first appointment to see it here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Right Column: Appointment Details */}
                        <div className="lg:col-span-2">
                            <AppointmentDetails appointment={selectedAppointment} onCancelClick={handleCancelClick} />
                        </div>
                    </div>
                </>
            )}

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

const Separator = () => <hr className="my-4 border-border/50" />;