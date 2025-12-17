"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { X, Phone, Mail, MapPin, Clock, Calendar, User, Scissors, DollarSign, UserCheck, CreditCard, Wallet, Smartphone, History, CalendarPlus, ClipboardList } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@repo/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import NewAppointmentForm, { type Appointment as FormAppointment } from "../app/calendar/components/NewAppointmentForm";
import { toast } from 'sonner';
import { useCollectPaymentMutation, useGetAppointmentsQuery } from '@repo/store/services/api';

interface PaymentDetails {
  amount: number;
  paid: number;
  discount?: {
    amount: number;
    code?: string;
    description: string;
  };
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  platformFee?: number;
  serviceTax?: number;
  offer?: {
    code: string;
    description: string;
    discountAmount: number;
  };
  bookingSource?: 'web' | 'phone' | 'walk-in';
  paymentMode?: 'online' | 'salon';
}

// Service item interface for multi-service appointments
interface ServiceItem {
  _id?: string;
  service: string;
  serviceName: string;
  staff: string;
  staffName: string;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
}

// Create a new interface that combines the properties we need
interface Appointment {
  // Properties from the original FormAppointment interface
  id?: string;
  _id?: string;
  client: string;
  clientName: string;
  service: string;
  serviceName: string;
  staff: string;
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending';
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Multi-service appointment properties
  isMultiService?: boolean;
  serviceItems?: ServiceItem[];
  
  // Additional properties used in this component
  payment?: PaymentDetails;
  vendorId?: string;
}

interface AppointmentDetailViewProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange?: (status: string, reason?: string) => void;
  onCollectPayment?: (paymentData: { amount: number; paymentMethod: string; notes?: string }) => void;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void>;
  onRescheduleAppointment?: (appointment: Appointment) => Promise<void>;
  onCloseReschedule?: () => void;
  onOpenAppointment?: (appointmentId: string) => void;
}

interface ClientAppointment {
  id: string;
  date: Date;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  staffName: string;
  amount: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  payment?: PaymentDetails;
}

export function AppointmentDetailView({
  appointment,
  onClose,
  onStatusChange,
  onCollectPayment,
  onUpdateAppointment,
  onRescheduleAppointment,
  onCloseReschedule,
  onOpenAppointment,
}: AppointmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [clientHistory, setClientHistory] = useState<ClientAppointment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollectingPayment, setIsCollectingPayment] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });
  const [collectPayment, { isLoading: isCollectingPaymentLoading }] = useCollectPaymentMutation();
  
  // Add the missing isStatusChanging state
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  // Local override for payment values after a successful collection, so UI updates immediately
  const [overridePayment, setOverridePayment] = useState<{ amountPaid: number; amountRemaining: number; paymentStatus: string } | null>(null);
  // Local override for payment history so it shows immediately after payment
  const [overridePaymentHistory, setOverridePaymentHistory] = useState<any[] | null>(null);

  // Pull latest appointments list from store and merge the one for this id
  const { data: allAppointments } = useGetAppointmentsQuery(undefined, { refetchOnMountOrArgChange: true });
  const liveAppointment = useMemo(() => {
    const currentId = (appointment as any)._id || (appointment as any).id;
    const fromList = Array.isArray(allAppointments)
      ? allAppointments.find((a: any) => (a?._id || a?.id) === currentId)
      : undefined;
    return { ...appointment, ...(fromList || {}) } as any;
  }, [allAppointments, appointment]);

  // Normalize all appointments into an array regardless of API shape
  const appointmentsList: any[] = useMemo(() => {
    const r: any = allAppointments;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.appointments)) return r.appointments;
    if (Array.isArray(r?.data?.appointments)) return r.data.appointments;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    return [];
  }, [allAppointments]);

  // Prepare default values for edit/reschedule form
  const defaultFormValues = useMemo(() => {
    // Map 'pending' status to 'scheduled' since NewAppointmentForm doesn't support 'pending'
    const status = liveAppointment.status === 'pending' ? 'scheduled' : liveAppointment.status;
    
    return {
      ...appointment,
      date: appointment.date instanceof Date ? appointment.date : new Date(appointment.date),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      service: appointment.service, // This should be the service ID
      serviceName: appointment.serviceName || appointment.service, // Fallback to service ID if name is missing
      staff: appointment.staff, // This should be the staff ID
      staffName: appointment.staffName,
      clientName: appointment.clientName,
      notes: appointment.notes || '',
      amount: appointment.amount,
      status: status,
      // Ensure these are always defined
      _id: appointment._id,
      id: appointment._id,
      duration: appointment.duration || 60,
      totalAmount: appointment.totalAmount || appointment.amount || 0,
      discount: appointment.discount || 0,
      tax: (appointment as any).tax || 0,
      paymentStatus: (appointment as any).paymentStatus || 'pending'
    };
  }, [appointment]);

  // Create service object in the format expected by NewAppointmentForm
  const currentService = {
    _id: appointment.service,
    id: appointment.service,
    name: appointment.serviceName,
    duration: appointment.duration,
    price: appointment.amount,
    // Add other required service fields with default values if needed
    category: '',
    staff: [],
    description: '',
    gender: 'unisex'
  };

  // Create staff object in the format expected by NewAppointmentForm
  const currentStaff = {
    _id: appointment.staff,
    id: appointment.staff,
    name: appointment.staffName,
    email: '',
    phone: ''
  };

  // Handle reschedule form submission
  const handleRescheduleSubmit = async (data: any) => {
    const toastId = toast.loading('Rescheduling appointment...');
    try {
      // Call the parent component's onStatusChange with the updated appointment data
      if (onRescheduleAppointment) {
        const updatedAppointment = {
          ...appointment,
          ...data,
          // Ensure date is a Date object
          date: data.date instanceof Date ? data.date : new Date(data.date),
          // Preserve the original status unless explicitly changed
          status: appointment.status,
        };

        await onRescheduleAppointment(updatedAppointment);
        // Don't show success toast here, let the parent component handle it
      }

      // Close the reschedule dialog if open
      if (onCloseReschedule) {
        onCloseReschedule();
      }
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment', {
        description: error?.message || 'Please try again.'
      });
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    const toastId = toast.loading('Saving appointment...');
    try {
      console.log('Starting form submission with data:', { formData, appointment });
      
      const appointmentId = appointment?._id || appointment?.id || '';
      if (!appointmentId) {
        console.error('Appointment ID is missing in handleFormSubmit');
        throw new Error('Appointment ID is missing. Cannot save changes.');
      }

      setIsSaving(true);
      
      // Format date safely
      const formatDate = (date: any) => {
        if (!date) return appointment?.date;
        if (typeof date === 'string') return date.split('T')[0];
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return appointment?.date;
      };

      // Create the updated appointment object with all required fields
      const updatedAppointment = {
        ...appointment,      // Start with all original data
        ...formData,         // Apply form updates
        _id: appointmentId,  // Ensure _id is preserved
        id: appointmentId,   // Also set id for backward compatibility
        date: formatDate(formData.date || appointment?.date),
        clientName: formData.clientName || appointment?.clientName,
        serviceName: formData.serviceName || appointment?.serviceName,
        staffName: formData.staffName || appointment?.staffName,
        startTime: formData.startTime || appointment?.startTime,
        endTime: formData.endTime || appointment?.endTime,
        status: formData.status || appointment?.status || 'scheduled',
        notes: formData.notes || appointment?.notes || '',
        amount: formData.amount || appointment?.amount || 0,
        discount: formData.discount || appointment?.discount || 0,
        tax: formData.tax || appointment?.tax || 0,
        totalAmount: formData.totalAmount || appointment?.totalAmount || 0,
      };

      console.log('Updated appointment data:', updatedAppointment);

      // Call the update handler if provided
      if (onUpdateAppointment) {
        await onUpdateAppointment(updatedAppointment);
        toast.success('Appointment updated successfully');
      }

      // Close the detail view
      onClose();
      
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      toast.error('Failed to save appointment', {
        description: typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message || 'Unknown error occurred' : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
      toast.dismiss(toastId);
    }
  };

  // Initialize payment data with values from the latest appointment snapshot
  const payment: PaymentDetails = {
    amount: (liveAppointment as any).amount || appointment.amount || 0,
    paid: (liveAppointment as any).amountPaid || (appointment as any).amountPaid || 0,
    tax: (liveAppointment as any).tax || (appointment as any).tax || 0,
    total: (liveAppointment as any).totalAmount || (appointment as any).totalAmount || appointment.amount || 0,
    paymentStatus: (liveAppointment as any).paymentStatus || (appointment as any).paymentStatus || 'pending',
    ...(liveAppointment as any).payment || appointment.payment
  };

  // Calculate total amount - prioritize finalAmount, then totalAmount, then amount (from liveAppointment)
  const totalAmount = (liveAppointment as any).finalAmount || (liveAppointment as any).totalAmount || payment.total || (liveAppointment as any).amount || 0;
  
  // Use override first, then amountPaid from appointment, then fallback to payment.paid
  const paidAmount = overridePayment?.amountPaid !== undefined
    ? Number(overridePayment.amountPaid)
    : (liveAppointment as any).amountPaid !== undefined
      ? parseFloat((liveAppointment as any).amountPaid)
      : (payment.paid ? parseFloat(payment.paid as any) : 0);
    
  // Calculate remaining amount - prefer override, then appointment, else compute
  const remainingAmount = overridePayment?.amountRemaining !== undefined
    ? Number(overridePayment.amountRemaining)
    : (liveAppointment as any).amountRemaining !== undefined
      ? parseFloat((liveAppointment as any).amountRemaining)
      : Math.max(0, totalAmount - paidAmount);
  
  // Resolve payment history to display
  const displayPaymentHistory = useMemo(() => {
    const hist = overridePaymentHistory ?? (liveAppointment as any)?.paymentHistory ?? [];
    // Sort desc by date if available
    return Array.isArray(hist)
      ? [...hist].sort((a: any, b: any) => new Date(b.paymentDate || b.date || 0).getTime() - new Date(a.paymentDate || a.date || 0).getTime())
      : [];
  }, [overridePaymentHistory, liveAppointment]);

  // Debug: Log appointment data to console
  console.log('=== APPOINTMENT PAYMENT DATA ===');
  console.log('Appointment ID:', (liveAppointment as any)._id);
  console.log('finalAmount:', (liveAppointment as any).finalAmount);
  console.log('totalAmount:', (liveAppointment as any).totalAmount);
  console.log('amountPaid (from liveAppointment):', (liveAppointment as any).amountPaid);
  console.log('amountRemaining (from liveAppointment):', (liveAppointment as any).amountRemaining);
  console.log('paymentStatus:', (liveAppointment as any).paymentStatus);
  console.log('payment.paid:', payment.paid);
  console.log('calculated remainingAmount:', remainingAmount);
  console.log('=== END APPOINTMENT PAYMENT DATA ===');
  
  // Update paymentData when remainingAmount changes
  useEffect(() => {
    setPaymentData(prev => ({
      ...prev,
      amount: remainingAmount
    }));
  }, [remainingAmount]);
  
  // Ensure paymentData is updated when appointment data changes
  useEffect(() => {
    setPaymentData(prev => ({
      ...prev,
      amount: remainingAmount
    }));
  }, [appointment._id, remainingAmount]);

  // Build client history: prefer clientId match; also allow name/phone fallback. Include all dates and statuses.
  useEffect(() => {
    setIsLoadingHistory(true);
    try {
      const currentClientId = String((appointment as any)?.client?._id ?? (appointment as any)?.client ?? (appointment as any)?.clientId ?? (appointment as any)?.client_id ?? '').trim();
      const currentClientName = String((appointment as any)?.clientName ?? (appointment as any)?.client?.name ?? '').trim().toLowerCase();
      const currentClientPhone = String((appointment as any)?.client?.phone ?? (appointment as any)?.clientPhone ?? (appointment as any)?.phone ?? '').replace(/\D+/g, '');

      const mapStatus = (s: any): ClientAppointment['status'] => {
        const status = String(s || '').toLowerCase();
        if (status === 'confirmed') return 'confirmed';
        if (status === 'completed') return 'completed';
        if (status === 'cancelled') return 'cancelled';
        if (status === 'no_show' || status === 'no-show' || status === 'missed') return 'missed';
        return 'pending';
      };

      const history = (appointmentsList || [])
        .filter((a: any) => {
          const rawClientId = a?.client?._id ?? a?.client ?? a?.clientId ?? a?.client_id;
          const clientId = rawClientId != null ? String(rawClientId).trim() : '';
          const name = String(a?.clientName ?? a?.client?.name ?? '').trim().toLowerCase();
          const phone = String(a?.client?.phone ?? a?.clientPhone ?? a?.phone ?? '').replace(/\D+/g, '');

          const idMatches = !!currentClientId && !!clientId && clientId === currentClientId;
          const nameMatches = !!currentClientName && !!name && name === currentClientName;
          const phoneMatches = !!currentClientPhone && !!phone && phone === currentClientPhone;
          return idMatches || nameMatches || phoneMatches;
        })
        .map((a: any) => ({
          id: String(a?._id ?? a?.id ?? ''),
          date: new Date(a?.date),
          service: String(a?.serviceName ?? a?.service?.name ?? a?.service ?? 'Service'),
          status: mapStatus(a?.status),
          staffName: String(a?.staffName ?? a?.staff?.name ?? ''),
          amount: Number(a?.totalAmount ?? a?.finalAmount ?? a?.amount ?? 0) || 0,
          startTime: a?.startTime,
          endTime: a?.endTime,
          notes: a?.notes ?? '',
          payment: a?.payment,
        }))
        .sort((a: ClientAppointment, b: ClientAppointment) => b.date.getTime() - a.date.getTime());

      const filtered = activeHistoryFilter === 'all' ? history : history.filter(h => h.status === activeHistoryFilter);
      if (process && process.env && typeof window !== 'undefined') {
        console.log('[ClientHistory] Matches total:', history.length, 'Filter:', activeHistoryFilter, 'Shown:', filtered.length);
        console.log('[ClientHistory] Current client id/name/phone:', { currentClientId, currentClientName, currentClientPhone });
      }
      setClientHistory(filtered);
    } catch (e) {
      console.error('Error building client history', e);
      setClientHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [appointmentsList, appointment, activeHistoryFilter]);

  // Function to update appointment status
  const updateAppointmentStatus = (appointmentId: string, newStatus: 'pending' | 'completed' | 'cancelled' | 'missed') => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = () => {
    if (!pendingStatus) return;
    
    const newStatus = pendingStatus as 'pending' | 'completed' | 'cancelled' | 'missed';
    
    // Update local state
    setClientHistory(prevHistory => 
      prevHistory.map(appt => 
        appt.id === appointment._id 
          ? { ...appt, status: newStatus } 
          : appt
      )
    );
    
    // Call the onStatusChange prop if provided
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    
    // Close the confirmation dialog
    setShowStatusConfirm(false);
    setPendingStatus(null);
  };

  // Status update confirmation dialog
  const renderStatusConfirmDialog = () => (
    <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Status Update</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this appointment as <span className="font-semibold">{pendingStatus}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowStatusConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={confirmStatusUpdate}
            className={`${
              pendingStatus === 'completed' ? 'bg-green-600 hover:bg-green-700' :
              pendingStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700' :
              pendingStatus === 'missed' ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm {pendingStatus}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Ensure total is calculated if not provided
  if (!payment.total && totalAmount > 0) {
    payment.total = totalAmount;
  }
  
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    }

  // Format date for display
  const formatAppointmentDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const commonOptions = [
      { value: 'cancelled', label: 'Cancel Appointment' }
    ];

    switch (currentStatus) {
      case 'scheduled':
        return [
          { value: 'confirmed', label: 'Confirm Appointment' },
          ...commonOptions
        ];
      case 'pending':
        return [
          { value: 'scheduled', label: 'Mark as Scheduled' },
          { value: 'confirmed', label: 'Confirm Appointment' },
          ...commonOptions
        ];
      case 'confirmed':
        return [
          { value: 'completed', label: 'Mark as Completed' },
          ...commonOptions
        ];
      default:
        return [
          { value: 'scheduled', label: 'Mark as Scheduled' },
          { value: 'confirmed', label: 'Confirm Appointment' },
          ...commonOptions
        ];
    }
  };

  const handleStatusChange = useCallback(async (newStatus: string) => {
    const toastId = toast.loading('Updating status...');
    if (!appointment || !onStatusChange) return;
    
    if (newStatus === 'cancelled') {
      // Show cancellation dialog instead of immediately changing status
      setPendingStatus(newStatus);
      setShowCancelDialog(true);
      return;
    }
    
    setIsStatusChanging(true);
    try {
      // Call the parent's status change handler with the new status
      await onStatusChange(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status', {
        description: error?.message || 'Please try again.'
      });
    } finally {
      setIsStatusChanging(false);
      toast.dismiss(toastId);
    }
  }, [appointment, onStatusChange]);

  const handleConfirmCancel = useCallback(async () => {
    const toastId = toast.loading('Cancelling appointment...');
    if (!pendingStatus || !onStatusChange) return;
    
    setIsStatusChanging(true);
    try {
      // Call the parent's status change handler with the cancellation reason
      await onStatusChange('cancelled', cancellationReason);
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      setCancellationReason('');
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment', {
        description: error?.message || 'Please try again.'
      });
    } finally {
      setIsStatusChanging(false);
      setPendingStatus(null);
      toast.dismiss(toastId);
    }
  }, [pendingStatus, onStatusChange, cancellationReason]);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsRescheduling(false);
  };

  const handleRescheduleClick = () => {
    setIsRescheduling(true);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsRescheduling(false);
  };

  // Collect payment and update appointment/payment state
  const handlePaymentSubmit = async () => {
    const toastId = toast.loading('Processing payment...');
    try {
      // Validate payment amount
      if (paymentData.amount <= 0) {
        toast.error('Payment amount must be greater than zero');
        return;
      }

      // Validate appointment ID
      if (!appointment?._id) {
        toast.error('Appointment ID is missing');
        return;
      }

      // Prepare payload
      const paymentPayload = {
        appointmentId: appointment._id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
      };

      console.log('Submitting payment with payload:', paymentPayload);

      // Call API
      const result: any = await collectPayment(paymentPayload).unwrap();
      console.log('Payment API response:', result);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to process payment');
      }

      // Extract response data
      const updatedAppointmentData = result.appointment || {};
      const paymentDetails = result.paymentDetails || {};

      // Derive amounts/status from most reliable source
      const newAmountPaid =
        paymentDetails.amountPaid ?? updatedAppointmentData.amountPaid ?? (appointment as any).amountPaid ?? 0;
      const newRemainingAmount =
        paymentDetails.amountRemaining ?? updatedAppointmentData.amountRemaining ?? (appointment as any).amountRemaining ?? 0;
      const newPaymentStatus =
        paymentDetails.paymentStatus ?? updatedAppointmentData.paymentStatus ?? (appointment as any).paymentStatus ?? 'pending';

      console.log('Updating payment data:', {
        newAmountPaid,
        newRemainingAmount,
        newPaymentStatus,
      });

      // Update parent with latest appointment state
      if (onUpdateAppointment) {
        const updatedAppointment: any = {
          ...appointment,
          ...updatedAppointmentData,
          payment: {
            ...(appointment.payment || {}),
            ...(updatedAppointmentData.payment || {}),
          },
          amountPaid: newAmountPaid,
          amountRemaining: newRemainingAmount,
          paymentStatus: newPaymentStatus,
          status: updatedAppointmentData.status || appointment.status,
        };

        // Keep payment object in sync
        updatedAppointment.payment = {
          ...updatedAppointment.payment,
          paid: newAmountPaid,
          paymentStatus: newPaymentStatus,
          amount: (updatedAppointment as any).finalAmount || updatedAppointment.totalAmount || updatedAppointment.amount || 0,
        };

        console.log('Calling onUpdateAppointment with:', updatedAppointment);
        await onUpdateAppointment(updatedAppointment);
      }

      // Success toast
      let successMessage = `Payment of ₹${paymentData.amount.toFixed(2)} received via ${paymentData.paymentMethod}`;
      if (updatedAppointmentData?.status && appointment.status !== updatedAppointmentData.status) {
        successMessage += ` and appointment marked as ${updatedAppointmentData.status}`;
      }
      toast.success('Payment Successful', { description: successMessage });

      // Update local payment input to remaining amount
      setPaymentData((prev) => ({
        ...prev,
        amount: newRemainingAmount,
        paymentMethod: paymentPayload.paymentMethod,
        notes: paymentPayload.notes,
      }));

      // Locally override UI payment values immediately
      setOverridePayment({
        amountPaid: newAmountPaid,
        amountRemaining: newRemainingAmount,
        paymentStatus: newPaymentStatus,
      });

      // Update local payment history for immediate UI
      const newHistoryEntry = {
        amount: paymentData.amount,
        paymentMethod: paymentPayload.paymentMethod,
        paymentDate: new Date().toISOString(),
        notes: paymentPayload.notes || '',
        transactionId: (result?.paymentCollection?.paymentHistory || []).slice(-1)[0]?.transactionId || null,
      };
      const backendHistory = updatedAppointmentData?.paymentHistory || result?.paymentCollection?.paymentHistory || [];
      setOverridePaymentHistory(Array.isArray(backendHistory) && backendHistory.length > 0 
        ? backendHistory
        : [newHistoryEntry, ...((overridePaymentHistory as any[]) || ((liveAppointment as any)?.paymentHistory || []))]);

      // Close payment form
      setIsCollectingPayment(false);
    } catch (error: any) {
      console.error('Error collecting payment:', error);
      toast.error('Payment Failed', {
        description: error?.message || 'There was an error processing your payment. Please try again.',
      });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const renderActionButtons = () => (
    <div className="flex justify-end space-x-2 mt-4">
      {!isEditing && !isRescheduling && (
        <>
          {/* <Button variant="outline" onClick={handleRescheduleClick}>
            Reschedule
          </Button>
          <Button onClick={handleEditClick}>
            Edit
          </Button> */}
        </>
      )}
      {(isEditing || isRescheduling) && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleCancelEdit}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="appointment-form"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );

  if (!appointment) return null;

  if (isEditing || isRescheduling) {
    return (
      <Dialog open={true} onOpenChange={handleCancelEdit}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isRescheduling ? 'Reschedule Appointment' : 'Edit Appointment'}
            </DialogTitle>
          </DialogHeader>
          <NewAppointmentForm
            key={`form-${appointment._id}-${isRescheduling ? 'reschedule' : 'edit'}`}
            defaultValues={defaultFormValues}
            isEditing={isEditing && !isRescheduling}
            isRescheduling={isRescheduling}
            onSubmit={isRescheduling ? handleRescheduleSubmit : handleFormSubmit}
            onCancel={handleCancelEdit}
            onSuccess={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {renderStatusConfirmDialog()}
      
      <Dialog open={!!appointment} onOpenChange={(open) => {
        // Only call onClose when the dialog is being closed by the user
        if (!open && onClose) {
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] h-auto overflow-y-scroll p-0 scrollbar-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground">Appointment Details</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.clientName} • {format(new Date(appointment.date), 'MMM d, yyyy')} • {appointment.startTime}
                  </p>
                </div>
              </div>
            </DialogHeader>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 py-0 h-12">
              <TabsTrigger 
                value="details" 
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <User className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <History className="mr-2 h-4 w-4" />
                Client History
                {clientHistory.length > 0 && (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {clientHistory.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6 pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="w-full flex flex-col sm:flex-row gap-3">
                {(remainingAmount > 0 && (overridePayment?.paymentStatus ?? (liveAppointment as any).paymentStatus) !== 'completed') && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      // When opening the payment form, set the amount to the remaining balance
                      if (!isCollectingPayment) {
                        setPaymentData(prev => ({
                          ...prev,
                          amount: remainingAmount
                        }));
                      }
                      setIsCollectingPayment(!isCollectingPayment);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {isCollectingPayment ? 'Hide Payment' : 'Collect Payment'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsRescheduling(true)}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <div className="w-full sm:w-[200px] hidden">
                  <Select 
                    value={appointment.status || "scheduled"}
                    onValueChange={handleStatusChange}
                    disabled={isStatusChanging}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 'scheduled', label: 'Mark as Scheduled' },
                        { value: 'confirmed', label: 'Mark as Confirmed' },
                        { value: 'completed', label: 'Mark as Completed' },
                        { value: 'cancelled', label: 'Mark as Cancelled' },
                      ].map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

            {/* Payment Collection Form */}
            {isCollectingPayment && (
              <div className="bg-background p-5 rounded-lg border-2 border-muted">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center text-foreground">
                    <DollarSign className="w-5 h-5 mr-2 text-foreground" />
                    Payment Collection
                  </h3>
                  {appointment.payment?.bookingSource && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {appointment.payment.bookingSource === 'web' ? '🌐 Online Booking' : 
                       appointment.payment.bookingSource === 'phone' ? '📞 Phone Booking' : 
                       '🚶 Walk-in'}
                    </Badge>
                  )}
                </div>

                {/* Booking Source & Payment Mode Info */}
                {appointment.payment?.bookingSource === 'web' && (
                  <div className="mb-4 p-3 bg-muted rounded-lg border border-muted">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-foreground rounded-md mt-0.5">
                        <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Online Booking {appointment.payment?.paymentMode === 'online' ? '- Paid Online' : '- Pay at Salon'}
                        </p>
                        <p className="text-xs text-foreground/80 mt-0.5">
                          {appointment.payment?.paymentMode === 'online' 
                            ? 'Customer has already paid online. Verify payment status before service.' 
                            : 'Customer selected "Pay at Salon" option. Collect payment now.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Payment Breakdown */}
                  <div className="bg-background p-4 rounded-lg border shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Payment Breakdown</h4>
                    
                    <div className="space-y-2 text-sm">
                      {/* Service Amount */}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Service Amount</span>
                        <span className="font-medium">₹{appointment.amount?.toFixed(2) || '0.00'}</span>
                      </div>

                      {/* Discount Amount (from appointment root) */}
                      {(appointment as any).discountAmount > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <span>Discount Applied</span>
                          <span className="font-medium">-₹{((appointment as any).discountAmount)?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}

                      {/* Offer/Discount Applied (from payment object) */}
                      {appointment.payment?.offer && (
                        <div className="flex justify-between items-center text-foreground">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Offer ({appointment.payment.offer.code})</span>
                          </div>
                          <span className="font-medium">-₹{appointment.payment.offer.discountAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}

                      {/* Regular Discount */}
                      {appointment.discount > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <span>Discount</span>
                          <span className="font-medium">-₹{appointment.discount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Service Tax (from appointment root) */}
                      {(appointment as any).serviceTax && (appointment as any).serviceTax > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Service Tax (GST)</span>
                          <span className="font-medium">₹{((appointment as any).serviceTax)?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}

                      {/* Service Tax (from payment object - fallback) */}
                      {!((appointment as any).serviceTax) && appointment.payment?.serviceTax && appointment.payment.serviceTax > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Service Tax (GST)</span>
                          <span className="font-medium">₹{appointment.payment.serviceTax.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Platform Fee (from appointment root) */}
                      {(appointment as any).platformFee && (appointment as any).platformFee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Platform Fee</span>
                          <span className="font-medium">₹{((appointment as any).platformFee)?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}

                      {/* Platform Fee (from payment object - fallback) */}
                      {!((appointment as any).platformFee) && appointment.payment?.platformFee && appointment.payment.platformFee > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Platform Fee</span>
                          <span className="font-medium">₹{appointment.payment.platformFee.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-semibold text-base">
                          <span>Total Amount</span>
                          <span className="text-foreground">₹{((appointment as any).finalAmount || appointment.totalAmount)?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Payment Method (from appointment root) */}
                      {(appointment as any).paymentMethod && (
                        <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium text-foreground">Payment Method:</span>
                          <span className="text-sm font-semibold text-foreground">{(appointment as any).paymentMethod}</span>
                        </div>
                      )}

                      {/* Payment Status (from appointment root) */}
                      {(appointment as any).paymentStatus && (
                        <div className="flex justify-between items-center py-2 px-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Payment Status:</span>
                          <span className={`text-sm font-semibold capitalize ${
                            (appointment as any).paymentStatus === 'completed' ? 'text-green-700 dark:text-green-300' :
                            (appointment as any).paymentStatus === 'pending' ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-red-700 dark:text-red-300'
                          }`}>
                            {(appointment as any).paymentStatus}
                          </span>
                        </div>
                      )}

                      {/* Amount Paid (from appointment root) */}
                      <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Amount Paid:</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          ₹{paidAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Amount Remaining (from appointment root) */}
                      <div className="flex justify-between items-center py-2 px-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Amount Remaining:</span>
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          ₹{remainingAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Amount Already Paid */}
                      {(appointment.payment?.paid ?? 0) > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Amount Paid {appointment.payment?.paymentMode === 'online' ? '(Online)' : ''}</span>
                          </div>
                          <span className="font-medium">₹{(appointment.payment?.paid ?? 0).toFixed(2)}</span>
                        </div>
                      )}

                      {/* Remaining Amount */}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-base">Amount to Collect</span>
                          <span className="text-xl font-bold text-foreground">
                            ₹{remainingAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Collection Details */}
                  <div className="bg-background p-4 rounded-lg border shadow-sm mt-4">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Payment Collection Details</h4>
                    
                    {/* Debug Information - Remove this in production */}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-2 px-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Amount</span>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          ₹{((appointment as any).finalAmount || appointment.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Amount Paid</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          ₹{paidAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Amount Remaining</span>
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          ₹{remainingAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Payment Status */}
                      <div className={`flex justify-between items-center py-2 px-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg`}>
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Payment Status</span>
                        <span className={`text-sm font-semibold ${
                          (overridePayment?.paymentStatus ?? (appointment as any).paymentStatus) === 'completed' ? 'text-green-700 dark:text-green-300' :
                          (overridePayment?.paymentStatus ?? (appointment as any).paymentStatus) === 'pending' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-red-700 dark:text-red-300'
                        }`}>
                          {/* Map backend payment status to user-friendly terms */}
                          {(() => {
                            const status = overridePayment?.paymentStatus ?? (appointment as any).paymentStatus;
                            const amountPaid = Number(paidAmount || 0) || 0;
                            const totalAmount = Number((appointment as any).finalAmount ?? appointment.totalAmount ?? 0) || 0;
                            
                            switch (status) {
                              case 'completed': return 'PAID';
                              case 'pending': 
                                if (amountPaid > 0 && totalAmount > 0) {
                                  return `PARTIAL (₹${amountPaid.toFixed(2)})`;
                                }
                                return 'UNPAID';
                              default: return status.toUpperCase();
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collect Payment Amount */}
                  {remainingAmount > 0 && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Collecting Amount (Manual Entry)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-medium">₹</span>
                          <Input 
                            type="number" 
                            value={paymentData.amount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              // Allow any positive value for manual entry
                              setPaymentData(prev => ({
                                ...prev,
                                amount: value >= 0 ? value : 0
                              }));
                            }}
                            className="pl-7 text-lg font-semibold"
                            min="0"
                            step="0.01"
                            placeholder="Enter amount to collect"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-xs text-foreground/80">
                            Remaining Balance: ₹{remainingAmount.toFixed(2)}
                          </p>
                          {paymentData.amount !== remainingAmount && remainingAmount > 0 && (
                            <button
                              onClick={() => setPaymentData(prev => ({ ...prev, amount: remainingAmount }))}
                              className="text-xs text-foreground font-medium hover:opacity-80"
                            >
                              Set to Remaining
                            </button>
                          )}
                        </div>
                        {paymentData.amount > remainingAmount && (
                          <p className="text-xs text-foreground/80 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Amount exceeds remaining balance by ₹{(paymentData.amount - remainingAmount).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Payment Methods */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <button
                            onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              paymentData.paymentMethod === 'cash'
                                ? 'border-foreground bg-muted'
                                : 'border-muted hover:border-foreground/50'
                            }`}
                          >
                            <Wallet className={`w-6 h-6 mx-auto mb-1 ${
                              paymentData.paymentMethod === 'cash' ? 'text-foreground' : 'text-foreground/60'
                            }`} />
                            <p className="text-xs font-medium">Cash</p>
                          </button>

                          <button
                            onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'card' }))}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              paymentData.paymentMethod === 'card'
                                ? 'border-foreground bg-muted'
                                : 'border-muted hover:border-foreground/50'
                            }`}
                          >
                            <CreditCard className={`w-6 h-6 mx-auto mb-1 ${
                              paymentData.paymentMethod === 'card' ? 'text-foreground' : 'text-foreground/60'
                            }`} />
                            <p className="text-xs font-medium">Card</p>
                          </button>

                          <button
                            onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'upi' }))}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              paymentData.paymentMethod === 'upi'
                                ? 'border-foreground bg-muted'
                                : 'border-muted hover:border-foreground/50'
                            }`}
                          >
                            <Smartphone className={`w-6 h-6 mx-auto mb-1 ${
                              paymentData.paymentMethod === 'upi' ? 'text-foreground' : 'text-foreground/60'
                            }`} />
                            <p className="text-xs font-medium">UPI</p>
                          </button>

                          <button
                            onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'netbanking' }))}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              paymentData.paymentMethod === 'netbanking'
                                ? 'border-foreground bg-muted'
                                : 'border-muted hover:border-foreground/50'
                            }`}
                          >
                            <svg className={`w-6 h-6 mx-auto mb-1 ${
                              paymentData.paymentMethod === 'netbanking' ? 'text-foreground' : 'text-foreground/60'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <p className="text-xs font-medium">Net Banking</p>
                          </button>
                        </div>
                      </div>

                      {/* UPI QR Code Section */}
                      {paymentData.paymentMethod === 'upi' && (
                        <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-muted">
                          <div className="flex flex-col items-center">
                            <div className="bg-background p-3 rounded-lg shadow-md mb-3">
                              {/* Placeholder for QR Code - You can integrate a QR code generator library */}
                              <div className="w-48 h-48 bg-muted rounded flex items-center justify-center">
                                <div className="text-center">
                                  <Smartphone className="w-12 h-12 mx-auto mb-2 text-foreground" />
                                  <p className="text-xs text-foreground/80">QR Code</p>
                                  <p className="text-xs text-foreground/80">Scan to Pay</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-center">Scan QR code to pay ₹{paymentData.amount.toFixed(2)}</p>
                            <p className="text-xs text-foreground/80 mt-1">Or enter UPI ID manually</p>
                          </div>
                        </div>
                      )}

                      {/* Payment Notes */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Transaction Notes (Optional)</label>
                        <Textarea
                          placeholder="Add payment reference, transaction ID, or any notes..."
                          value={paymentData.notes}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCollectingPayment(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handlePaymentSubmit}
                          disabled={paymentData.amount <= 0 || isCollectingPaymentLoading}
                          className="flex-1 bg-foreground hover:bg-foreground/90 text-background"
                        >
                          {isCollectingPaymentLoading ? (
                            <>
                              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirm Payment ₹{paymentData.amount.toFixed(2)}
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Already Paid Message */}
                  {remainingAmount <= 0 && (
                    <div className="bg-muted p-4 rounded-lg border-2 border-muted">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-foreground rounded-full">
                          <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Payment Complete</p>
                          <p className="text-sm text-foreground/80">Full payment of ₹{appointment.totalAmount?.toFixed(2)} has been received.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Payment History */}
            <div className="bg-background p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="w-4 h-4" /> Payment History
                </h4>
                {displayPaymentHistory.length > 0 && (
                  <span className="text-xs text-muted-foreground">{displayPaymentHistory.length} entr{displayPaymentHistory.length === 1 ? 'y' : 'ies'}</span>
                )}
              </div>

              {displayPaymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {displayPaymentHistory.map((p: any, idx: number) => {
                    const when = p.paymentDate || p.date;
                    const dateStr = when ? format(new Date(when), 'MMM d, yyyy h:mm a') : '';
                    return (
                      <div key={idx} className="flex items-start justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">₹{Number(p.amount || 0).toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">• {String(p.paymentMethod || 'cash').toUpperCase()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{dateStr}</div>
                          {(p.notes || p.transactionId) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {p.notes && <span className="mr-2">{p.notes}</span>}
                              {p.transactionId && <span className="font-mono">Txn: {p.transactionId}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Client & Service Info */}
            <div className="bg-gradient-to-br from-background/50 to-muted/20 p-3 sm:p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</p>
                        <p className="text-lg font-semibold text-foreground">{appointment.clientName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show single service or multi-service header */}
                  {!(appointment.isMultiService || (appointment.serviceItems && appointment.serviceItems.length > 1)) ? (
                    <div className="bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Scissors className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                          <p className="text-lg font-semibold text-foreground">
                            {appointment.serviceName || 'No service specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</p>
                          <p className="text-lg font-semibold text-foreground">
                            Multi-Service ({appointment.serviceItems?.length || 0} Services)
                          </p>
                        </div>
                      </div>
                      
                      {/* Display all service items */}
                      {appointment.serviceItems && appointment.serviceItems.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {appointment.serviceItems.map((item: ServiceItem, index: number) => (
                            <div key={item._id || index} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-muted">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.serviceName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.staffName} • {item.startTime} - {item.endTime} ({item.duration} min)
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <div className="font-semibold text-sm">₹{item.amount?.toFixed(2) || '0.00'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Staff</p>
                        <p className="text-lg font-semibold text-foreground">{appointment.staffName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</p>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">
                            {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <div className="flex items-center text-foreground/80">
                            <Clock className="h-4 w-4 mr-1.5 text-foreground" />
                            <span>{appointment.startTime} - {appointment.endTime}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({appointment.duration} min)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        appointment.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          appointment.status === 'confirmed' ? 'text-blue-600 dark:text-blue-400' :
                          appointment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          appointment.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
                          'text-red-600 dark:text-red-400'
                        }`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-blue-500' :
                            appointment.status === 'pending' ? 'bg-yellow-500' :
                            appointment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appointment Status</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-foreground capitalize">
                            {appointment.status.replace(/-/g, ' ')}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`px-2 py-0.5 text-xs font-medium ${
                              appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                              appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                              appointment.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                              'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
                            } border-0`}
                          >
                            {appointment.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <rect width="8" height="2" x="8" y="12" rx="1"></rect>
                            <rect width="8" height="2" x="8" y="16" rx="1"></rect>
                            <path d="M10 6h1v4"></path>
                            <path d="M14 6h1v4"></path>
                            <path d="M10 9h1v4"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-foreground/90">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Amount:</span>
                  <span>₹{Number(((liveAppointment as any)?.amount ?? appointment.amount) || 0).toFixed(2)}</span>
                </div>
                
                {appointment.discount && appointment.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount:</span>
                    <span>-₹{appointment.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-medium pt-2 border-t mt-2">
                  <span>Total Amount:</span>
                  <span>₹{Number(totalAmount || (liveAppointment as any)?.totalAmount || appointment.totalAmount || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span>₹{paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Remaining:</span>
                  <span>₹{remainingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="capitalize">
                    {(() => {
                      const status = (overridePayment?.paymentStatus ?? (liveAppointment as any)?.paymentStatus ?? 'pending') as string;
                      if (status === 'completed') return 'paid';
                      if (status === 'pending') return paidAmount > 0 ? `partial (₹${paidAmount.toFixed(2)})` : 'unpaid';
                      if (status === 'partial') return `partial (₹${paidAmount.toFixed(2)})`;
                      return status;
                    })()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <div className="flex flex-wrap gap-2">
                {/* Invoice Button */}
                <Button 
                  variant="outline"
                  className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  onClick={() => {
                    // TODO: Implement invoice generation
                    console.log('Generate invoice for', appointment._id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <rect width="8" height="2" x="8" y="12" rx="1"></rect>
                    <rect width="8" height="2" x="8" y="16" rx="1"></rect>
                    <path d="M10 6h1v4"></path>
                    <path d="M14 6h1v4"></path>
                    <path d="M10 9h1v4"></path>
                  </svg>
                  Invoice
                </Button>

                {/* Collect Payment Button */}
                {/* {remainingAmount > 0 && (
                  <Button 
                    variant="outline"
                    className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                    onClick={() => {
                      setPaymentAmount(remainingAmount);
                      setShowPaymentForm(true);
                    }}
                  >
                    <DollarSign className="h-4 w-4" />
                    Collect Payment
                  </Button>
                )} */}

                {renderActionButtons()}
              </div>
              </div>
            </TabsContent>

            {/* Client History Tab */}
            <TabsContent value="history" className="p-0">
              {/* History Filter Tabs */}
              <div className="border-b px-6">
                <div className="flex space-x-1 overflow-x-auto py-2">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'missed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveHistoryFilter(filter as any)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                        activeHistoryFilter === filter
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter !== 'all' && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary/10">
                          {clientHistory.filter(a => a.status === filter).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : clientHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium text-foreground">
                      No {activeHistoryFilter === 'all' ? '' : activeHistoryFilter} appointments found
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      {activeHistoryFilter === 'all'
                        ? `${appointment.clientName} doesn't have any appointments in our records.`
                        : `No ${activeHistoryFilter} appointments found for ${appointment.clientName}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientHistory.map((appt) => (
                      <div 
                        key={appt.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (onOpenAppointment) {
                            onOpenAppointment(appt.id);
                            setActiveTab('details');
                          } else {
                            // Fallback: update URL without navigation if handler not provided
                            if (typeof window !== 'undefined') {
                              window.history.replaceState({}, '', `/appointments/${appt.id}`);
                            }
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-foreground">
                              {appt.service}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(appt.date, 'MMM d, yyyy')} • {appt.startTime}
                            </p>
                          </div>
                          <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                            {appt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Payment Collection Dialog */}
      {/* <Dialog open={isCollectingPayment} onOpenChange={setIsCollectingPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0
                  }))}
                  className="pl-9"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select 
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData(prev => ({
                  ...prev,
                  paymentMethod: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input 
                placeholder="Add any payment notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full"
                onClick={handlePaymentSubmit}
              >
                Process Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cancellationReason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter the reason for cancellation"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason('');
              }}
              disabled={isStatusChanging}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmCancel}
              disabled={isStatusChanging || !cancellationReason.trim()}
              variant="destructive"
            >
              {isStatusChanging ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AppointmentDetailView;