"use client";

import { useState, useMemo, useCallback } from 'react';
import { AppointmentFormData } from './components/NewAppointmentForm';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Calendar, Clock3, X, CalendarDays } from 'lucide-react';
import NewAppointmentForm from './components/NewAppointmentForm';
import AppointmentCard from '@/app/calendar/components/AppointmentCard';
import { TimeSlotView } from './components/TimeSlotView';
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from '@repo/ui/cn';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectAllAppointments, 
  selectSelectedAppointment,
  useAppointmentActions 
} from '@repo/store/slices/appointmentSlice';
import AddBlockTime from '@/components/AddBlockTime';
import { reset, selectBlockedTimes } from '@repo/store/slices/blockTimeSlice';

type Appointment = {
  id: string;
  clientName: string;
  service: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
};

const staffMembers = ['All Staff', 'Jane Doe', 'John Smith', 'Emily White'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'time'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('All Staff');
  const [selectedDateForBlock, setSelectedDateForBlock] = useState<Date | null>(null);
  const router = useRouter();
  
  // Get appointments from Redux store
  const appointments = useSelector(selectAllAppointments);
  const selectedAppointment = useSelector(selectSelectedAppointment);
  const { selectAppointment } = useAppointmentActions();
  
  // Get blocked times for the selected staff member
  const blockedTimes = useSelector((state) => 
    selectBlockedTimes(state, { 
      staffName: selectedStaff === 'All Staff' ? null : selectedStaff,
      date: currentDate 
    })
  );
  
  const today = new Date();

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
    return appointments.filter(a => 
      a.date && new Date(a.date).toDateString() === today.toDateString() &&
      (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedStaff, today]);

  const selectedDateAppointments = useMemo(() => {
    return appointments.filter(a => 
      a.date && new Date(a.date).toDateString() === selectedDate.toDateString() &&
      (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, selectedStaff]);

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // If holding Ctrl/Cmd, open block time modal instead of navigating
    if (window.event && (window.event as KeyboardEvent).ctrlKey) {
      handleOpenBlockTimeModal(clickedDate);
      return;
    }
    
    // Otherwise, navigate to the day view
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    router.push(`/calendar/${dateString}`);
  };


  const dispatch = useDispatch();

  const handleNewAppointment = () => {
    selectAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenBlockTimeModal = useCallback((date: Date) => {
    setSelectedDateForBlock(date);
    dispatch(reset());
    setIsBlockTimeModalOpen(true);
  }, [dispatch]);

  const handleCloseBlockTimeModal = useCallback(() => {
    setIsBlockTimeModalOpen(false);
    setSelectedDateForBlock(null);
  }, []);

  const handleAppointmentClick = (appointment: Appointment) => {
    selectAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const handleFormSubmit = (formData: AppointmentFormData) => {
    // Ensure we have a valid date, defaulting to selectedDate if not provided
    const appointmentDate = formData.date || selectedDate;
    
    if (selectedAppointment) {
      // Update existing appointment
      updateExistingAppointment(selectedAppointment.id, {
        clientName: formData.clientName,
        service: formData.service,
        staffName: formData.staffName,
        date: appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        // Keep the existing status if it exists, otherwise default to 'pending'
        status: selectedAppointment.status || 'pending'
      });
    } else {
      // Add new appointment
      addNewAppointment({
        clientName: formData.clientName,
        service: formData.service,
        staffName: formData.staffName,
        date: appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        status: 'pending' // New appointments default to 'pending' status
      });
    }
    
    setIsModalOpen(false);
  };
  
  const handleDeleteAppointment = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      removeAppointment(id);
      setIsModalOpen(false);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColorLight = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderCalendar = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`day-${index}`} className="text-center font-medium p-3 bg-muted text-sm">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before month starts */}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-24 border-r border-b bg-muted/30"></div>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = today.toDateString() === date.toDateString();
          const isSelected = selectedDate.toDateString() === date.toDateString();
          const appointmentsForDay = appointments.filter(a =>
            a.date.toDateString() === date.toDateString() &&
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
              <div className={cn(
                  "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                  isToday 
                    ? 'bg-blue-600 text-white'
                    : isSelected 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700'
              )}>
                {day}
              </div>
              
              {/* Appointment and blocked time indicators */}
              <div className="flex flex-col gap-1 mt-1 w-full">
                {/* Blocked time indicator */}
                {blockedTimes.some(block => {
                  const blockDate = new Date(block.date);
                  return blockDate.getDate() === day && 
                         blockDate.getMonth() === currentDate.getMonth() &&
                         blockDate.getFullYear() === currentDate.getFullYear();
                }) && (
                  <div className="w-full text-center">
                    <span className="inline-block px-1 text-xs bg-amber-100 text-amber-800 rounded">
                      Blocked
                    </span>
                  </div>
                )}
                
                {/* Appointment dots */}
                <div className="flex flex-wrap justify-center gap-1">
                  {appointmentsForDay.slice(0, 3).map(appt => (
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
              {staffMembers.map(staff => (
                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              onClick={handleNewAppointment} 
              className="bg-blue-600 hover:bg-blue-700"
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
        {/* Left Side - Calendar */}
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
              {view === 'month' ? (
                renderCalendar()
              ) : (
                <TimeSlotView 
                  date={selectedDate} 
                  staffName={selectedStaff === 'All Staff' ? staffMembers[1] : selectedStaff}
                  onTimeSlotClick={(time) => {
                    // Handle time slot click if needed
                    console.log('Selected time:', time);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Schedule */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                <Calendar className="mr-2 h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <p className="text-sm text-gray-600">
                {today.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map(appointment => (
                    <div onClick={() => handleAppointmentClick(appointment)} key={appointment.id}>
                      <AppointmentCard appointment={appointment} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-sm">No appointments for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Dialog */}
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            if (!open) selectAppointment(null);
            setIsModalOpen(open);
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <NewAppointmentForm 
                  onSubmit={handleFormSubmit} 
                  defaultDate={selectedDate}
                  defaultValues={selectedAppointment}
                  onDelete={selectedAppointment ? () => handleDeleteAppointment(selectedAppointment.id) : undefined}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Block Time Modal */}
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
        </div>
      </div>
    </div>
  );
}