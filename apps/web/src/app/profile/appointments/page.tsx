"use client";


import { useState, useMemo, useEffect, useRef } from 'react';
import { useCancelBookingMutation } from '@repo/store/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { AlertCircle, Calendar, CheckCircle, X, Trash, Search, MapPin, Clock, User, Scissors, DollarSign, Edit, MoreVertical, Link as LinkIcon, Info, FileText, Download } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { cn } from '@repo/ui/cn';
import { useUserAppointments } from '@/hooks/useUserAppointments';
import { useGetAppointmentInvoiceQuery } from '@repo/store/api';

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

// ─── Invoice Modal ────────────────────────────────────────────────
const InvoiceModal = ({ appointmentId, onClose }: { appointmentId: string; onClose: () => void }) => {
    const { data, isLoading, isError, error } = useGetAppointmentInvoiceQuery(appointmentId);

    const handleDownload = async () => {
        const element = document.getElementById('web-invoice-pdf-area');
        if (!element) return;
        try {
            const html2pdf = (await import('html2pdf.js' as any)).default;
            const invoiceNum = data?.data?.invoice?.invoiceNumber || appointmentId;
            await html2pdf().set({
                margin: 5,
                filename: `Invoice_${invoiceNum}.pdf`,
                image: { type: 'jpeg', quality: 0.9 },
                html2canvas: { scale: 1.5, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            }).from(element).save();
        } catch (e) {
            console.error('PDF download failed:', e);
        }
    };

    const invoice = data?.data?.invoice;
    const vendor = data?.data?.vendor;
    const appointment = data?.data?.appointment;

    const vendorName = vendor?.businessName || vendor?.salonName || 'Salon';
    const vendorAddress = [vendor?.address, vendor?.city, vendor?.state, vendor?.pincode].filter(Boolean).join(', ') || 'N/A';
    const vendorPhone = vendor?.phone || vendor?.mobile || 'N/A';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">Appointment Invoice</h2>
                            {invoice && <p className="text-xs text-gray-500">Invoice #{invoice.invoiceNumber}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {invoice && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="h-10 w-10 rounded-full border-2 border-t-green-500 border-gray-200 animate-spin" />
                            <p className="text-sm text-gray-500">Loading your invoice...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                                <FileText className="h-7 w-7 text-amber-500" />
                            </div>
                            <p className="font-semibold text-gray-800">Invoice Not Available Yet</p>
                            <p className="text-sm text-gray-500 max-w-xs">
                                {(error as any)?.data?.message || 'The invoice will be available once the vendor finalises your appointment.'}
                            </p>
                        </div>
                    )}

                    {invoice && (
                        <div id="web-invoice-pdf-area" className="p-6 font-sans bg-white">
                            {/* Branding */}
                            <div className="bg-slate-50 text-slate-900 py-3 px-4 rounded-t-lg -mx-6 -mt-6 mb-6 border-b border-slate-200 flex justify-center">
                                <img src="/images/GlowVita%20Salon%20PNG.png" alt="GlowVita Salon" className="h-10 w-auto object-contain" />
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4">
                                <div>
                                    <h1 className="text-xl font-bold text-black">{vendorName}</h1>
                                    <p className="text-xs text-gray-700 mt-1">{vendorAddress}</p>
                                    <p className="text-xs text-gray-700 mt-1">Phone: {vendorPhone}</p>
                                </div>
                                <h2 className="text-2xl font-bold text-black">INVOICE</h2>
                            </div>

                            {/* Meta */}
                            <div className="flex justify-between mb-4">
                                <p className="text-sm text-black">
                                    <span className="font-semibold">Date:</span>{' '}
                                    {new Date(invoice.createdAt || appointment?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-sm text-black">
                                    <span className="font-semibold">Invoice No:</span> {invoice.invoiceNumber}
                                </p>
                            </div>

                            <div className="border-t border-black my-3" />

                            {/* Client Info */}
                            <div className="mb-4">
                                <p className="text-sm text-black">
                                    <span className="font-semibold">Invoice To:</span> {invoice.clientInfo?.fullName || 'N/A'}
                                </p>
                                {invoice.clientInfo?.phone && (
                                    <p className="text-sm text-black">
                                        <span className="font-semibold">Phone:</span> {invoice.clientInfo.phone}
                                    </p>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full border-collapse border border-black text-sm">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-black p-2 text-left font-bold text-black text-xs">ITEM DESCRIPTION</th>
                                            <th className="border border-black p-2 text-right font-bold text-black text-xs">₹ PRICE</th>
                                            <th className="border border-black p-2 text-right font-bold text-black text-xs">QTY</th>
                                            <th className="border border-black p-2 text-right font-bold text-black text-xs">₹ AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoice.items || []).map((item: any, idx: number) => (
                                            <tr key={idx} className="border border-black">
                                                <td className="border border-black p-2 text-black text-xs">
                                                    <div className={`font-semibold ${item.itemType === 'Addon' ? 'pl-4 text-gray-600' : ''}`}>
                                                        {item.itemType === 'Addon' ? '+ ' : ''}{item.name}
                                                    </div>
                                                    {item.staffName && <div className="text-[11px] text-gray-500 mt-0.5">Staff: {item.staffName}</div>}
                                                </td>
                                                <td className="border border-black p-2 text-right text-black text-xs">₹{(item.price || 0).toFixed(2)}</td>
                                                <td className="border border-black p-2 text-right text-black text-xs">{item.quantity || 1}</td>
                                                <td className="border border-black p-2 text-right font-semibold text-black text-xs">₹{(item.totalPrice || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {/* Summary rows */}
                                        <tr className="border border-black">
                                            <td colSpan={3} className="border border-black p-2 text-right font-semibold text-black text-xs">Subtotal:</td>
                                            <td className="border border-black p-2 text-right font-semibold text-black text-xs">₹{(invoice.subtotal || 0).toFixed(2)}</td>
                                        </tr>
                                        {invoice.discountAmount > 0 && (
                                            <tr className="border border-black">
                                                <td colSpan={3} className="border border-black p-2 text-right font-semibold text-green-600 text-xs">Discount:</td>
                                                <td className="border border-black p-2 text-right font-semibold text-green-600 text-xs">-₹{(invoice.discountAmount || 0).toFixed(2)}</td>
                                            </tr>
                                        )}
                                        {invoice.taxAmount > 0 && (
                                            <tr className="border border-black">
                                                <td colSpan={3} className="border border-black p-2 text-right font-semibold text-black text-xs">Tax ({invoice.taxRate || 0}%):</td>
                                                <td className="border border-black p-2 text-right font-semibold text-black text-xs">₹{(invoice.taxAmount || 0).toFixed(2)}</td>
                                            </tr>
                                        )}
                                        {invoice.platformFee > 0 && (
                                            <tr className="border border-black">
                                                <td colSpan={3} className="border border-black p-2 text-right font-semibold text-black text-xs">Platform Fee:</td>
                                                <td className="border border-black p-2 text-right font-semibold text-black text-xs">₹{(invoice.platformFee || 0).toFixed(2)}</td>
                                            </tr>
                                        )}
                                        <tr className="border border-black bg-gray-200">
                                            <td colSpan={3} className="border border-black p-2 text-right font-bold text-black text-xs">Total:</td>
                                            <td className="border border-black p-2 text-right font-bold text-black text-xs">₹{(invoice.totalAmount || 0).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment footer */}
                            <div className="border-t-2 border-black pt-3">
                                <p className="text-center text-black font-medium text-xs mb-1">
                                    {invoice.paymentMethod && invoice.paymentMethod !== 'Pending'
                                        ? `Payment of ₹${(invoice.totalAmount || 0).toFixed(2)} received via ${invoice.paymentMethod}`
                                        : `Payment of ₹${(invoice.totalAmount || 0).toFixed(2)} is pending`}
                                </p>
                                <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    NOTE: This is a computer generated receipt and does not require physical signature.
                                </p>
                                <div className="mt-6 pt-4 border-t border-gray-300 flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-400 font-medium">Powered by</span>
                                    <img src="/images/GlowVita%20Salon%20PNG.png" alt="GlowVita Salon" className="h-8 w-auto object-contain" />
                                    <p className="text-xs text-gray-400">www.glowvitasalon.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────


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
    onViewInvoice: (appointmentId: string) => void;
}

const AppointmentDetails = ({ appointment, onCancelClick, onViewInvoice }: AppointmentDetailsProps) => {
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

        // If startTime is provided (e.g. "12:30" or "12:30 PM"), adjust the date to reflect this time
        if (startTime) {
            const timeMatch = startTime.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
            if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                const period = timeMatch[3];

                if (period) {
                    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
                }

                apptDate.setHours(hours, minutes, 0, 0);
            } else {
                // Fallback for HH:mm format if match fails
                const [hours, minutes] = startTime.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    apptDate.setHours(hours, minutes, 0, 0);
                }
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

            // Use appointment.startTime or the first service item's startTime if available
            const startTime = (appointment.serviceItems && appointment.serviceItems.length > 0)
                ? appointment.serviceItems[0].startTime
                : appointment.startTime;

            if (startTime) {
                displayDateTime = `${displayDate} at ${startTime}`;
            } else {
                displayDateTime = `${displayDate} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
        }
    } catch (e) {
        console.error('Error parsing date in AppointmentDetails:', e);
    }

    // Handler: Add to Calendar
    const handleAddToCalendar = () => {
        try {
            const dateObj = new Date(appointment.date);

            // Adjust time based on startTime if available
            const startTime = (appointment.serviceItems && appointment.serviceItems.length > 0)
                ? appointment.serviceItems[0].startTime
                : appointment.startTime;

            if (startTime) {
                const timeMatch = startTime.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
                if (timeMatch) {
                    let hours = parseInt(timeMatch[1], 10);
                    const minutes = parseInt(timeMatch[2], 10);
                    const period = timeMatch[3];
                    if (period) {
                        if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    }
                    dateObj.setHours(hours, minutes, 0, 0);
                }
            }

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
                        <Button variant="outline" className="justify-start gap-2" disabled={!isAppointmentCancellable(appointment.date, appointment.status, appointment.serviceItems && appointment.serviceItems.length > 0 ? appointment.serviceItems[0].startTime : appointment.startTime)} onClick={() => onCancelClick(appointment)}>
                            <Edit className="h-4 w-4" /> Manage Appointment
                        </Button>
                        <Button variant="outline" className="justify-start gap-2" onClick={handleSalonDetails} disabled={!appointment.vendorId}>
                            <LinkIcon className="h-4 w-4" /> Salon Details
                        </Button>
                        {appointment.status === 'Completed' && (
                            <Button
                                variant="outline"
                                className="justify-start gap-2 col-span-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={() => onViewInvoice(appointment.id)}
                            >
                                <FileText className="h-4 w-4" /> View Invoice
                            </Button>
                        )}
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
    const [invoiceModalAppointmentId, setInvoiceModalAppointmentId] = useState<string | null>(null);

    // Update appointments when user appointments data changes
    // Use a ref to track if we've already set the initial selection to prevent infinite loops
    const hasSetInitialSelection = useRef(false);

    console.log("Appointments:", userAppointments)

    useEffect(() => {
        if (userAppointments) {
            console.log("Raw user appointments data:", userAppointments);
            setAppointments(userAppointments);

            if (!hasSetInitialSelection.current && userAppointments.length > 0) {
                // Check if we just came from a booking — auto-select that appointment
                const newlyBookedId = typeof window !== 'undefined'
                    ? sessionStorage.getItem('newlyBookedAppointmentId')
                    : null;

                if (newlyBookedId) {
                    const newlyBooked = userAppointments.find((apt: any) => apt.id === newlyBookedId);
                    if (newlyBooked) {
                        setSelectedAppointment(newlyBooked);
                        sessionStorage.removeItem('newlyBookedAppointmentId');
                        hasSetInitialSelection.current = true;
                        return;
                    }
                }

                // Default: select first appointment
                if (!selectedAppointment) {
                    setSelectedAppointment(userAppointments[0]);
                }
                hasSetInitialSelection.current = true;
            }
        }
    }, [userAppointments]); // Remove selectedAppointment from dependencies

    const filteredAppointments = useMemo(() => {
        const statusGroupOrder: Record<string, number> = {
            Scheduled: 0,
            Confirmed: 0,
            Pending: 1,
            Completed: 2,
            Cancelled: 3,
        };

        const getDateTime = (apt: Appointment) => {
            const date = new Date(apt.date).getTime();
            const timeStr = apt.startTime || apt.serviceItems?.[0]?.startTime || '00:00';
            const [h, m] = timeStr.split(':').map(Number);
            return date + (h || 0) * 60 * 60 * 1000 + (m || 0) * 60 * 1000;
        };

        return appointments
            .filter(appointment =>
                (appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    appointment.staff.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (statusFilter === 'all' || appointment.status === statusFilter)
            )
            .sort((a, b) => {
                const groupA = statusGroupOrder[a.status] ?? 99;
                const groupB = statusGroupOrder[b.status] ?? 99;
                if (groupA !== groupB) return groupA - groupB;
                return getDateTime(a) - getDateTime(b);
            });
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
                                const apptDate = new Date(a.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return apptDate >= today && ['Confirmed', 'Scheduled'].includes(a.status);
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
                            <AppointmentDetails
                                appointment={selectedAppointment}
                                onCancelClick={handleCancelClick}
                                onViewInvoice={(id) => setInvoiceModalAppointmentId(id)}
                            />
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

            {/* Invoice Modal */}
            {invoiceModalAppointmentId && (
                <InvoiceModal
                    appointmentId={invoiceModalAppointmentId}
                    onClose={() => setInvoiceModalAppointmentId(null)}
                />
            )}
        </div>
    );
}

const Separator = () => <hr className="my-4 border-border/50" />;