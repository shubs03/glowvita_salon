"use client";


import { useState, useMemo, useEffect, useRef } from 'react';
import { useCancelBookingMutation } from '@repo/store/api';
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

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Initial appointments are now fetched from the API
const initialAppointments: Appointment[] = [];

interface Appointment {
    id: string;
    service: string;
    date: string;
    staff: string;
    status: 'Completed' | 'Confirmed' | 'Cancelled' | 'Pending' | 'Scheduled';
    price: number;
    duration: number;
    salon: {
        name: string;
        address: string;
    };
    vendorId?: string;
    startTime?: string;
    endTime?: string;
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
    amount?: number;
    totalAmount?: number;
    platformFee?: number;
    serviceTax?: number;
    discountAmount?: number;
    finalAmount?: number;
    cancellationReason?: string;
}

interface AppointmentCardProps {
    appointment: Appointment;
    onSelect: () => void;
    isSelected: boolean;
}

const AppointmentCard = ({ appointment, onSelect, isSelected }: AppointmentCardProps) => {
    const statusConfig: Record<string, { icon: any, color: string }> = {
        Completed: { icon: CheckCircle, color: 'text-green-500' },
        Confirmed: { icon: Calendar, color: 'text-blue-500' },
        Cancelled: { icon: X, color: 'text-red-500' },
        Pending: { icon: Clock, color: 'text-yellow-500' },
        Scheduled: { icon: Calendar, color: 'text-blue-500' },
    };
    const StatusIcon = statusConfig[appointment.status]?.icon || CheckCircle;
    console.log("appointment ", appointment);

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
                    {/* Show all services for multi-service appointments */}
                    {appointment.serviceItems && appointment.serviceItems.length > 1 ? (
                        <p className="font-semibold">
                            {appointment.serviceItems.map((item, index) => (
                                <span key={index}>
                                    {item.serviceName}
                                    {index < appointment.serviceItems!.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </p>
                    ) : (
                        <p className="font-semibold">{appointment.service}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{displayDate}</p>
                </div>
                <div className={`flex items-center text-xs font-medium gap-1 ${statusConfig[appointment.status]?.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {appointment.status}
                </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
                {appointment.serviceItems && appointment.serviceItems.length > 1 ? (
                    <>
                        with {appointment.serviceItems.map(item => item.staffName).join(", ")} at {appointment.salon.name}
                    </>
                ) : (
                    <>with {appointment.staff} at {appointment.salon.name}</>
                )}
            </div>
            {/* Show indicator for multi-service appointments */}
            {appointment.serviceItems && appointment.serviceItems.length > 1 && (
                <div className="mt-2 flex items-center text-xs text-primary">
                    <Scissors className="h-3 w-3 mr-1" />
                    <span>{appointment.serviceItems.length} Services</span>
                </div>
            )}
        </button>
    );
};

interface AppointmentDetailsProps {
    appointment: Appointment | null;
    onCancelClick: (appointment: Appointment) => void;
}

const AppointmentDetails = ({ appointment, onCancelClick }: AppointmentDetailsProps) => {
    const router = useRouter();
    console.log("AppointmentDetails received appointment:", appointment);
    console.log("Pricing details - amount:", appointment?.amount, "platformFee:", appointment?.platformFee, "serviceTax:", appointment?.serviceTax, "discountAmount:", appointment?.discountAmount, "finalAmount:", appointment?.finalAmount);
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

    const statusConfig: Record<string, { color: string }> = {
        Completed: { color: 'bg-green-100 text-green-800' },
        Scheduled: { color: 'bg-blue-100 text-blue-800' },
        Confirmed: { color: 'bg-blue-100 text-blue-800' },
        Pending: { color: 'bg-yellow-100 text-yellow-800' },
        Cancelled: { color: 'bg-red-100 text-red-800' },
    };

    const isAppointmentCancellable = (appointmentDate: string, status: string, startTime?: string) => {
        if (['Cancelled', 'Completed', 'no_show', 'in_progress', 'partially-completed'].includes(status)) return false;

        const now = new Date();
        const apptDate = new Date(appointmentDate);

        // If startTime is provided (e.g. "12:30"), adjust the date to reflect this time
        if (startTime) {
            const [hours, minutes] = startTime.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                apptDate.setHours(hours, minutes, 0, 0);
            }
        }

        const minutesDifference = (apptDate.getTime() - now.getTime()) / (1000 * 60);
        // Allow cancellation if it's more than 30 minutes before the service
        return minutesDifference > 30;
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

    // Handler: Add to Calendar
    const handleAddToCalendar = () => {
        try {
            const dateObj = new Date(appointment.date);

            // Format date for calendar event (YYYYMMDDTHHMMSS)
            const startDateTime = dateObj.toISOString().replace(/-|:|\.\d+/g, '');

            // Calculate end time based on duration
            const endDate = new Date(dateObj.getTime() + appointment.duration * 60000);
            const endDateTime = endDate.toISOString().replace(/-|:|\.\d+/g, '');

            // Create Google Calendar URL
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.service + ' - ' + appointment.salon.name)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(`Professional: ${appointment.staff}\nLocation: ${appointment.salon.address}`)}&location=${encodeURIComponent(appointment.salon.address)}`;

            window.open(calendarUrl, '_blank');
        } catch (error) {
            console.error('Error adding to calendar:', error);
            alert('Unable to add to calendar. Please try again.');
        }
    };

    // Handler: Get Directions
    const handleGetDirections = () => {
        try {
            const address = appointment.salon.address;
            // Open Google Maps with the salon address
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            window.open(mapsUrl, '_blank');
        } catch (error) {
            console.error('Error opening directions:', error);
            alert('Unable to open directions. Please try again.');
        }
    };

    // Handler: Salon Details
    const handleSalonDetails = () => {
        try {
            if (appointment.vendorId) {
                router.push(`/salon-details/${appointment.vendorId}`);
            } else {
                alert('Salon information not available.');
            }
        } catch (error) {
            console.error('Error navigating to salon details:', error);
            alert('Unable to open salon details. Please try again.');
        }
    };

    return (
        <Card className="sticky top-24">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    {/* Show all services for multi-service appointments */}
                    {appointment.serviceItems && appointment.serviceItems.length > 1 ? (
                        <div>
                            <CardTitle className="text-xl">Multiple Services</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {appointment.serviceItems.map((item, index) => (
                                    <span key={index}>
                                        {item.serviceName}
                                        {index < appointment.serviceItems!.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </p>
                        </div>
                    ) : (
                        <CardTitle className="text-xl">{appointment.service}</CardTitle>
                    )}
                    <Badge className={cn("text-xs", statusConfig[appointment.status]?.color)}>
                        {appointment.status}
                    </Badge>
                </div>
                <CardDescription>{appointment.salon.name}</CardDescription>
                {/* Show all staff for multi-service appointments */}
                {appointment.serviceItems && appointment.serviceItems.length > 1 && (
                    <p className="text-sm text-muted-foreground">
                        with {appointment.serviceItems.map(item => item.staffName).join(", ")}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Show cancellation reason if cancelled */}
                {appointment.status === 'Cancelled' && appointment.cancellationReason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-800 text-sm">Cancellation Reason</p>
                                <p className="text-sm text-red-700">{appointment.cancellationReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start gap-4">
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
                        <Button variant="outline" className="justify-start gap-2" onClick={handleAddToCalendar}>
                            <Calendar className="h-4 w-4" /> Add to Calendar
                        </Button>
                        <Button variant="outline" className="justify-start gap-2" onClick={handleGetDirections}>
                            <MapPin className="h-4 w-4" /> Get Directions
                        </Button>
                        <Button variant="outline" className="justify-start gap-2" disabled={!isAppointmentCancellable(appointment.date, appointment.status, appointment.startTime)} onClick={() => onCancelClick(appointment)}>
                            <Edit className="h-4 w-4" /> Manage Appointment
                        </Button>
                        <Button variant="outline" className="justify-start gap-2" onClick={handleSalonDetails} disabled={!appointment.vendorId}>
                            <LinkIcon className="h-4 w-4" /> Salon Details
                        </Button>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h4 className="font-semibold">Service & Booking Summary</h4>

                    {/* Show service details for all appointments */}
                    <div className="space-y-3">
                        <h5 className="font-semibold text-sm">Services</h5>
                        {appointment.serviceItems && appointment.serviceItems.length > 0 ? (
                            <div className="space-y-2">
                                {appointment.serviceItems.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-3 bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{item.serviceName}</p>
                                                <p className="text-xs text-muted-foreground mt-1">with {item.staffName}</p>
                                            </div>
                                            <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>{item.startTime} - {item.endTime}</span>
                                            <span>{item.duration} min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border rounded-lg p-3 bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{appointment.service}</p>
                                        <p className="text-xs text-muted-foreground mt-1">with {appointment.staff}</p>
                                    </div>
                                    <span className="font-medium">₹{appointment.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>{appointment.startTime} - {appointment.endTime}</span>
                                    <span>{appointment.duration} min</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Display detailed pricing breakdown */}
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{appointment.amount?.toFixed(2) || '0.00'}</span>
                        </div>

                        {appointment.discountAmount != null && appointment.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="text-muted-foreground">Discount</span>
                                <span>-₹{appointment.discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Platform Fee</span>
                            <span>₹{appointment.platformFee?.toFixed(2) || '0.00'}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">GST</span>
                            <span>₹{appointment.serviceTax?.toFixed(2) || '0.00'}</span>
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total Amount</span>
                            <span>₹{appointment.finalAmount?.toFixed(2) || appointment.price.toFixed(2)}</span>
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
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

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

    const handleConfirmCancel = async () => {
        if (!appointmentToCancel || !cancellationReason.trim()) return;

        try {
            await cancelBooking({
                appointmentId: appointmentToCancel.id,
                reason: cancellationReason
            }).unwrap();

            toast.success("Appointment cancelled successfully");

            // Optimistic update handled by RTK Query cache invalidation
            // But we can also update local state if needed (though setAppointments is derived from props/hook)
            // Actually userAppointments hook will re-fetch automatically due to tag invalidation

            setIsCancelModalOpen(false);
            setAppointmentToCancel(null);
            setCancellationReason('');

            if (selectedAppointment?.id === appointmentToCancel.id) {
                // Keep it selected but update status? Or deselect?
                // Let's update status locally for immediate feedback until re-fetch happens
                setSelectedAppointment(prev => prev ? ({ ...prev, status: 'Cancelled' }) : null);
            }
        } catch (error: any) {
            console.error("Failed to cancel booking:", error);
            toast.error(error?.data?.message || "Failed to cancel appointment. Please try again.");
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
                        <div className="lg:col-span-1 flex flex-col h-full">
                            <Card className="flex-1 flex flex-col">
                                <CardHeader className="pb-3">
                                    <CardTitle>My Appointments</CardTitle>
                                    <CardDescription>Select an appointment to view details.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col space-y-4">
                                    <div className="space-y-4">
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
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
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
                                    </div>
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
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling}>No, Keep It</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancellationReason.trim() || isCancelling}>
                            {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const Separator = () => <hr className="my-4 border-border/50" />;