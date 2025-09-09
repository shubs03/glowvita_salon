"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ChevronLeft, Plus, Clock, User, Calendar as CalendarIcon, Clock3, X, CalendarDays, Eye, Pencil, MoreVertical, CheckCircle2, XCircle, ChevronRight, ChevronDown } from 'lucide-react';
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
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
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
      refetchOnMountOrArgChange: true,
    }
  );

  const [createAppointment, { isLoading: isCreating }] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = glowvitaApi.useDeleteAppointmentMutation();
  const [updateAppointmentStatus, { isLoading: isUpdatingStatus }] = glowvitaApi.useUpdateAppointmentStatusMutation();

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

  const handleFormSubmit = useCallback(
    async (appointmentData: Appointment) => {
      try {
        if (isEditing && selectedAppointment?.id) {
          await updateAppointment({
            id: selectedAppointment.id,
            ...appointmentData,
          }).unwrap();
          toast.success('Appointment updated successfully');
        } else {
          await createAppointment(appointmentData).unwrap();
          toast.success('Appointment created successfully');
        }
        setIsModalOpen(false);
        setIsEditing(false);
        dispatch(setSelectedAppointment(null));
        await refetch();
      } catch (error: any) {
        console.error('Failed to save appointment:', error);
        toast.error(
          `Failed to ${isEditing ? 'update' : 'create'} appointment: ${
            error?.data?.message || error.message || 'Unknown error'
          }`
        );
      }
    },
    [createAppointment, updateAppointment, dispatch, selectedAppointment, isEditing, refetch]
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

  const handleCancelAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setCancelReason(''); // Reset cancel reason
    setShowCancelDialog(true);
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

  const AppointmentMenu = ({ appointment, onView, onEdit }: { appointment: any, onView: () => void, onEdit: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const handleStatusChange = async (newStatus: string) => {
      if (newStatus === 'cancelled') {
        handleCancelAppointment(appointment.id);
        setIsOpen(false);
        setShowStatusMenu(false);
      } else {
        try {
          await handleUpdateAppointmentStatus(appointment.id, newStatus, '');
          setIsOpen(false);
          setShowStatusMenu(false);
        } catch (error: any) {
          console.error('Failed to update status:', error);
          toast.error(`Failed to update status: ${error?.data?.message || error.message || 'Unknown error'}`);
        }
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
              
              {/* Change Status Option - Now available for all statuses */}
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
                      {validStatuses
                        .filter((status) => status !== appointment.status)
                        .map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(status);
                            }}
                            disabled={isUpdatingStatus}
                            className={cn(
                              'w-full text-left px-4 py-2 text-sm flex items-center transition-colors',
                              status === 'cancelled' 
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
                Rescheduled/Edit Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CancelAppointmentDialog = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (showCancelDialog && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [showCancelDialog]);

    const handleSubmit = async () => {
      if (!cancelReason.trim()) {
        toast.error('Please provide a cancellation reason');
        return;
      }
      if (!selectedAppointmentId) {
        toast.error('No appointment selected');
        return;
      }
      setIsSubmitting(true);
      try {
        await handleUpdateAppointmentStatus(selectedAppointmentId, 'cancelled', cancelReason);
        setShowCancelDialog(false);
        setCancelReason('');
        setSelectedAppointmentId(null);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      if (!isSubmitting) {
        setShowCancelDialog(false);
        setCancelReason('');
        setSelectedAppointmentId(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Cancel Appointment
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to cancel this appointment? Please provide a reason for cancellation.
          </p>
          
          <div className="mb-4">
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Reason *
            </label>
            <input
              ref={textareaRef}
              type="text"
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {cancelReason.length}/100 characters
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!cancelReason.trim() || isSubmitting}
              className={cn(
                "px-4 py-2 text-white",
                cancelReason.trim() && !isSubmitting
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
                    >
                      <div className="absolute right-2 top-2">
                        <AppointmentMenu
                          appointment={appointment}
                          onView={() => {
                            const dateStr = appointment?.date?.toISOString().split('T')[0];
                            if (dateStr) {
                              router.push(`/calendar/${dateStr}?appointmentId=${appointment.id}`);
                            }
                          }}
                          onEdit={() => {
                            dispatch(setSelectedAppointment(appointment));
                            setIsEditing(true);
                            setIsModalOpen(true);
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-start pr-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {appointment.clientName || 'No Name'}
                            </h4>
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              )}
                            >
                              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Scheduled'}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-800">
                              {appointment.serviceName || 'No service specified'}
                            </span>
                            {appointment.duration && (
                              <>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-gray-500 flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {appointment.duration} min
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{appointment.staffName || 'No staff assigned'}</span>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                              <p className="line-clamp-2">
                                {appointment.notes.includes('Appointment cancelled:') 
                                  ? appointment.notes.split('Appointment cancelled:')[1].trim() 
                                  : appointment.notes.split(' - ').pop()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            ${appointment.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
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
      
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <NewAppointmentForm
              onSubmit={handleFormSubmit}
              onSuccess={handleCloseModal}
              onCancel={handleCloseModal}
              onDelete={isEditing && selectedAppointment?.id ? () => handleDeleteAppointment(selectedAppointment.id!) : undefined}
              defaultDate={selectedDate}
              defaultValues={selectedAppointment || undefined}
              isEditing={isEditing}
            />
          </div>
        </DialogContent>
      </Dialog>
      
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
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {showCancelDialog && <CancelAppointmentDialog />}
    </div>
  );
}