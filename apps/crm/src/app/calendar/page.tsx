"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Label } from '@repo/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ChevronLeft, Plus, Clock, User, Calendar as CalendarIcon, Clock3, X, CalendarDays, Eye, Pencil, MoreVertical, CheckCircle2, XCircle, ChevronRight, ChevronDown, Scissors } from 'lucide-react';
import NewAppointmentForm, { Appointment } from './components/NewAppointmentForm';
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from '@repo/ui/cn';
import { useSelector, useDispatch } from 'react-redux';
import { useAppDispatch } from '@repo/store/hooks';
import { selectSelectedAppointment, setSelectedAppointment } from '@repo/store/slices/appointmentSlice';
import AddBlockTime from '@/components/AddBlockTime';
import { reset, selectBlockedTimes } from '@repo/store/slices/blockTimeSlice';
import { glowvitaApi } from '@repo/store/api';
import { startOfDay, endOfDay, isSameDay } from 'date-fns';

// Define valid statuses from the AppointmentModel
const validStatuses = ['confirmed','cancelled'];
const staffMembers = ['All Staff'];

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  selectedAppointment: any;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onCancel,
  isSubmitting,
  selectedAppointment,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason) return;
    await onCancel(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="cancelReason" className="text-sm font-medium">
              Reason
            </label>
            <textarea
              id="cancelReason"
              className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter the reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'time'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('All Staff');
  const [selectedDateForBlock, setSelectedDateForBlock] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // RTK Query hooks for appointments with proper cache invalidation
  const { data: appointmentsData, isLoading: isLoadingAppointments, refetch } = glowvitaApi.useGetAppointmentsQuery(
    {
      startDate: startOfDay(new Date()).toISOString(),
      endDate: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)).toISOString(),
    },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const { data: staffData = [], isLoading: isLoadingStaff } = glowvitaApi.useGetStaffQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const selectedStaffId = useMemo(() => {
    if (!selectedStaff || selectedStaff === 'All Staff') return null;
    return staffData.find(staff => staff.fullName === selectedStaff)?._id || null;
  }, [selectedStaff, staffData]);

  const [createAppointment, { isLoading: isCreating }] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = glowvitaApi.useDeleteAppointmentMutation();
  const [updateAppointmentStatus] = glowvitaApi.useUpdateAppointmentStatusMutation();

  const selectedAppointment = useSelector(selectSelectedAppointment);
  const blockedTimes = useSelector((state) =>
    selectBlockedTimes(state, {
      staffName: selectedStaff === 'All Staff' ? null : selectedStaff,
      date: currentDate,
    })
  );

  const today = new Date();

  // Transform API data
  const appointments: Appointment[] = useMemo(() => {
    if (!appointmentsData || !Array.isArray(appointmentsData)) return [];
    return appointmentsData.map((appt: any) => ({
      id: appt._id || appt.id,
      client: appt.client || appt.clientName,
      clientName: appt.clientName || appt.client,
      service: appt.service,
      serviceName: appt.serviceName,
      staff: appt.staff,
      staffName: appt.staffName,
      date: new Date(appt.date),
      startTime: appt.startTime,
      endTime: appt.endTime,
      duration: appt.duration,
      notes: appt.notes || '',
      status: appt.status || 'scheduled',
      paymentStatus: appt.paymentStatus || 'pending',
      amount: appt.amount || 0,
      discount: appt.discount || 0,
      tax: appt.tax || 0,
      totalAmount: appt.totalAmount || appt.amount || 0,
    }));
  }, [appointmentsData]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          isSameDay(a.date, today) &&
          (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedStaff, today]);

  const selectedDateAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          isSameDay(a.date, selectedDate) &&
          (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, selectedStaff]);

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (window.event && (window.event as KeyboardEvent).ctrlKey) {
      handleOpenBlockTimeModal(clickedDate);
      return;
    }
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    router.push(`/calendar/${dateString}`);
  };

  const handleNewAppointment = useCallback(() => {
    dispatch(setSelectedAppointment(null));
    setIsEditing(false);
    setIsModalOpen(true);
  }, [dispatch]);

  const handleOpenBlockTimeModal = useCallback((date: Date) => {
    setSelectedDateForBlock(date);
    dispatch(reset());
    setIsBlockTimeModalOpen(true);
  }, [dispatch]);

  const handleCloseBlockTimeModal = useCallback(() => {
    setIsBlockTimeModalOpen(false);
    setSelectedDateForBlock(null);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    dispatch(setSelectedAppointment(appointment));
    setIsEditing(true);
    setIsModalOpen(true);
  }, [dispatch]);

  const handleFormSubmit = useCallback(
    async (appointmentData: Appointment) => {
      try {
        if (isEditing && selectedAppointment) {
          // For updates, use the original ID
          const updateData = {
            ...appointmentData,
            id: selectedAppointment.id || selectedAppointment._id,
            _id: selectedAppointment._id || selectedAppointment.id,
          };
          await updateAppointment(updateData).unwrap();
          toast.success('Appointment updated successfully');
        } else {
          // For new appointments
          await createAppointment(appointmentData).unwrap();
          toast.success('Appointment created successfully');
        }
        
        // Close modal and reset state
        setIsModalOpen(false);
        setIsEditing(false);
        dispatch(setSelectedAppointment(null));
        
        // Refresh the appointments list
        await refetch();
      } catch (error: any) {
        console.error('Error saving appointment:', error);
        toast.error(
          `Failed to ${isEditing ? 'update' : 'create'} appointment: ${
            error?.data?.message || error.message || 'Unknown error'
          }`
        );
      }
    },
    [createAppointment, updateAppointment, dispatch, isEditing, selectedAppointment, refetch]
  );

  const handleDeleteAppointment = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this appointment?')) {
        try {
          await deleteAppointment(id).unwrap();
          setIsModalOpen(false);
          setIsEditing(false);
          dispatch(setSelectedAppointment(null));
          toast.success('Appointment deleted successfully');
          await refetch();
        } catch (error: any) {
          console.error('Failed to delete appointment:', error);
          toast.error(
            `Failed to delete appointment: ${error?.data?.message || error.message || 'Unknown error'}`
          );
        }
      }
    },
    [deleteAppointment, dispatch, refetch]
  );

  const handleCancelAppointment = async (reason: string) => {
    const appointment = selectedAppointment;
    if (!appointment || (!appointment._id && !appointment.id)) {
      toast.error('No appointment selected');
      return;
    }
    
    try {
      setIsCancelling(true);
      
      // Use either _id or id, whichever is available
      const appointmentId = appointment._id || appointment.id;
      
      await updateAppointmentStatus({
        id: appointmentId,
        status: 'cancelled',
        cancellationReason: reason
      }).unwrap();
      
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      await refetch();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error(error?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
      dispatch(setSelectedAppointment(null));
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string, reason: string = '') => {
    try {
      await updateAppointmentStatus({
        id,
        status,
        cancellationReason: status === 'cancelled' ? reason : undefined
      }).unwrap();
      toast.success('Appointment status updated successfully');
      await refetch();
    } catch (error: any) {
      console.error('Failed to update appointment:', error);
      toast.error(`Failed to update status: ${error?.data?.message || error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const confirmCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    if (!selectedAppointmentId) {
      toast.error('No appointment selected');
      return;
    }
    try {
      await handleUpdateAppointmentStatus(selectedAppointmentId, 'cancelled', cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedAppointmentId(null);
    } catch (error: any) {
      console.error('Failed to cancel appointment:', error);
      toast.error(`Failed to cancel appointment: ${error?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'scheduled':
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'missed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const renderCalendar = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`day-${index}`} className="text-center font-medium p-3 bg-muted text-sm">
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-24 border-r border-b bg-muted/30"></div>
        ))}
        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = isSameDay(today, date);
          const isSelected = isSameDay(selectedDate, date);
          const appointmentsForDay = appointments.filter(
            (a) =>
              isSameDay(a.date, date) &&
              (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
          );

          return (
            <div
              key={day}
              className={cn(
                "h-32 border-r border-b border-gray-200 p-2 flex flex-col items-center cursor-pointer transition-colors",
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              )}
              onClick={() => handleDayClick(day)}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                  isToday
                    ? 'bg-blue-600 text-white'
                    : isSelected
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700'
                )}
              >
                {day}
              </div>
              <div className="flex flex-col gap-1 mt-1 w-full">
                {blockedTimes.some(
                  (block) => {
                    const blockDate = new Date(block.date);
                    return (
                      blockDate.getDate() === day &&
                      blockDate.getMonth() === currentDate.getMonth() &&
                      blockDate.getFullYear() === currentDate.getFullYear()
                    );
                  }
                ) && (
                  <div className="w-full text-center">
                    <span className="inline-block px-1 text-xs bg-amber-100 text-amber-800 rounded">
                      Blocked
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-1">
                  {appointmentsForDay.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className={`w-2 h-2 rounded-full ${getStatusColor(appt.status)}`}
                      title={`${appt.clientName} - ${appt.service}`}
                    />
                  ))}
                  {appointmentsForDay.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{appointmentsForDay.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    dispatch(setSelectedAppointment(null));
  };

  const AppointmentMenu = ({ appointment, onView, onEdit, onDelete, onCancel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setShowStatusMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = async (status: string) => {
      if (status === 'cancelled') {
        dispatch(setSelectedAppointment(appointment));
        setShowCancelDialog(true);
        setShowStatusMenu(false);
        setIsOpen(false);
        return;
      }

      try {
        setIsUpdatingStatus(true);
        const appointmentId = appointment._id || appointment.id;
        await updateAppointmentStatus({
          id: appointmentId,
          status,
        }).unwrap();
        toast.success(`Appointment marked as ${status}`);
        setShowStatusMenu(false);
        setIsOpen(false);
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update appointment status');
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setShowStatusMenu(false);
          }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </button>
              
              <div className="relative">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusMenu(!showStatusMenu);
                  }}
                >
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Change Status</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showStatusMenu && (
                  <div className="absolute left-0 right-0 mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1">
                      {['confirmed','cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(status);
                          }}
                          disabled={isUpdatingStatus}
                          className={cn(
                            'w-full text-left px-4 py-2 text-sm flex items-center transition-colors',
                            status === 'cancelled' || status === 'no-show'
                              ? 'text-red-600 hover:bg-red-50' 
                              : status === 'completed'
                              ? 'text-green-600 hover:bg-green-50'
                              : status === 'confirmed'
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-yellow-600 hover:bg-yellow-50',
                            isUpdatingStatus && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {status === 'cancelled' ? (
                            <XCircle className="mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                          {isUpdatingStatus && status === appointment.status && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Reschedule/Edit Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const checkAndMarkMissedAppointments = async () => {
      if (!appointmentsData?.data) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      const appointmentsToUpdate = appointmentsData.data.filter(appointment => {
        // Skip if already marked as completed, cancelled, or missed
        if (['completed', 'cancelled', 'missed'].includes(appointment.status)) {
          return false;
        }

        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);

        // Check if appointment date is before today
        return appointmentDate < today;
      });

      // Update all eligible appointments in parallel
      if (appointmentsToUpdate.length > 0) {
        try {
          await Promise.all(
            appointmentsToUpdate.map(appointment =>
              updateAppointmentStatus({
                id: appointment.id,
                status: 'missed',
                cancellationReason: 'Automatically marked as missed - appointment date has passed'
              }).unwrap()
            )
          );
          // Refetch to update the UI
          refetch();
        } catch (error) {
          console.error('Error updating appointment statuses:', error);
        }
      }
    };

    // Run the check when the component mounts and when appointments data changes
    checkAndMarkMissedAppointments();
  }, [appointmentsData, updateAppointmentStatus, refetch]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Calendar</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
              ))}
              {staffData.map((staff) => (
                <SelectItem key={staff.fullName} value={staff.fullName}>{staff.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={handleNewAppointment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
            <Button
              onClick={() => handleOpenBlockTimeModal(new Date())}
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            >
              <Clock3 className="mr-2 h-4 w-4" /> Block Time
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold min-w-[200px] text-center">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <Button variant="outline" size="icon" onClick={handleNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                </div>
                <Tabs defaultValue="month" onValueChange={(value) => setView(value as 'month' | 'time')}>
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="time">Time Slots</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading appointments...</div>
                </div>
              ) : (
                renderCalendar()
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                  <CalendarIcon className="mr-2 h-5 w-5 text-indigo-600" />
                  Today's Schedule
                </CardTitle>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {todaysAppointments.length} {todaysAppointments.length === 1 ? 'appointment' : 'appointments'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto p-4">
                {isLoadingAppointments ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                    <p className="text-sm text-gray-500">Loading today's appointments...</p>
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all duration-200",
                        "hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50/50",
                        "cursor-pointer bg-white"
                      )}
                      onClick={() => {
                        const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
                        router.push(`/calendar/${formattedDate}?appointmentId=${appointment.id}`);
                      }}
                    >
                      <div className="absolute right-2 top-2">
                        <AppointmentMenu
                          appointment={appointment}
                          onView={() => {
                            const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
                            router.push(`/calendar/${formattedDate}?appointmentId=${appointment.id}`);
                          }}
                          onEdit={() => handleEditAppointment(appointment)}
                        />
                      </div>
                      
                      <div className="flex items-start justify-between">
                        {/* Time and Status */}
                        <div className="flex items-center">
                          <div className="text-center mr-4">
                            <p className="text-sm font-medium text-gray-500">Time</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {appointment.startTime} - {appointment.endTime}
                            </p>
                          </div>
                          <div className="h-12 w-px bg-gray-200 mx-2"></div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : appointment.status === 'missed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              )}
                            >
                              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Scheduled'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500">Total</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${appointment.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-base font-medium text-gray-900">
                          {appointment.clientName || 'No Name'}
                        </h4>
                        <div className="mt-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Scissors className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{appointment.serviceName || 'No service specified'}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{appointment.staffName || 'No staff assigned'}</span>
                          </div>
                          {appointment.duration && (
                            <div className="flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                              <span>{appointment.duration} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium text-gray-700">Notes: </span>
                            {appointment.notes.includes('Appointment cancelled:') 
                              ? appointment.notes.split('Appointment cancelled:')[1].trim() 
                              : appointment.notes.split(' - ').pop()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No appointments scheduled for today</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        dispatch(setSelectedAppointment(null));
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> New Appointment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Appointment' : 'New Appointment'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the appointment details' : 'Create a new appointment'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <NewAppointmentForm
                defaultValues={selectedAppointment || undefined}
                isEditing={isEditing}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  dispatch(setSelectedAppointment(null));
                }}
                onSuccess={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  dispatch(setSelectedAppointment(null));
                }}
                onDelete={isEditing ? async (id) => {
                  if (window.confirm('Are you sure you want to delete this appointment?')) {
                    try {
                      await deleteAppointment(id).unwrap();
                      toast.success('Appointment deleted successfully');
                      setIsModalOpen(false);
                      setIsEditing(false);
                      dispatch(setSelectedAppointment(null));
                      await refetch();
                    } catch (error) {
                      console.error('Error deleting appointment:', error);
                      toast.error('Failed to delete appointment');
                    }
                  }
                } : undefined}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={isBlockTimeModalOpen} onOpenChange={setIsBlockTimeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Block Time</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <AddBlockTime
              open={isBlockTimeModalOpen}
              onClose={handleCloseBlockTimeModal}
              initialDate={selectedDateForBlock?.toISOString().split('T')[0]}
              staffMembers={staffData}
              defaultStaffId={selectedStaffId}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <CancelAppointmentDialog 
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onCancel={(reason) => handleCancelAppointment(reason)}
        isSubmitting={isCancelling}
        selectedAppointment={selectedAppointment}
      />
    </div>
  );
}