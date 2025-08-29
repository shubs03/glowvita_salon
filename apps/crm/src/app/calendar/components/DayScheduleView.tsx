"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { useState, useEffect } from 'react';
import NewAppointmentForm from './NewAppointmentForm';

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

interface DayScheduleViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onCreateAppointment?: (appointment: Omit<Appointment, 'id'>) => void;
  onDateChange?: (date: Date) => void;
}

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getStatusConfig = (status: Appointment['status']) => {
  switch (status) {
    case 'confirmed': 
      return { 
        label: 'Confirmed',
        icon: '✓',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      };
    case 'completed': 
      return { 
        label: 'Completed',
        icon: '✓',
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      };
    case 'pending': 
      return { 
        label: 'Pending',
        icon: '⏳',
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: '✕',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      };
    default: 
      return { 
        label: 'Unknown',
        icon: '?',
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      };
  }
};

const groupAppointmentsByStaff = (appointments: Appointment[]) => {
  const staffMap = new Map<string, Appointment[]>();
  
  appointments.forEach(appointment => {
    if (!staffMap.has(appointment.staffName)) {
      staffMap.set(appointment.staffName, []);
    }
    staffMap.get(appointment.staffName)?.push(appointment);
  });
  
  return Array.from(staffMap.entries()).sort(([nameA], [nameB]) => 
    nameA.localeCompare(nameB)
  );
};

// Employee color mapping
const employeeColors = [
  'text-blue-600 dark:text-blue-400',
  'text-green-600 dark:text-green-400',
  'text-purple-600 dark:text-purple-400',
  'text-pink-600 dark:text-pink-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-yellow-600 dark:text-yellow-400',
  'text-red-600 dark:text-red-400',
  'text-teal-600 dark:text-teal-400',
  'text-orange-600 dark:text-orange-400',
  'text-cyan-600 dark:text-cyan-400'
];

const getEmployeeColor = (name: string) => {
  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % employeeColors.length;
  return employeeColors[index];
};

// Employee background color mapping
const employeeBgColors = [
  'bg-blue-50 dark:bg-blue-900/20',
  'bg-green-50 dark:bg-green-900/20',
  'bg-purple-50 dark:bg-purple-900/20',
  'bg-pink-50 dark:bg-pink-900/20',
  'bg-indigo-50 dark:bg-indigo-900/20',
  'bg-yellow-50 dark:bg-yellow-900/20',
  'bg-red-50 dark:bg-red-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
  'bg-orange-50 dark:bg-orange-900/20',
  'bg-cyan-50 dark:bg-cyan-900/20'
];

const getEmployeeBgColor = (name: string) => {
  // Simple hash function to get consistent background color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % employeeBgColors.length;
  return employeeBgColors[index];
};

export default function DayScheduleView({ 
  selectedDate, 
  appointments = [], 
  onAppointmentClick: onAppointmentClickProp,
  onCreateAppointment,
  onDateChange
}: DayScheduleViewProps) {
  // Ensure selectedDate is a valid Date object
  const safeSelectedDate = selectedDate && !isNaN(selectedDate.getTime()) 
    ? selectedDate 
    : new Date();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date>();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (!onDateChange) return;
    const newDate = new Date(safeSelectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    onDateChange(newDate);
  };

  const handleNewAppointment = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date selected for new appointment');
      return;
    }
    setNewAppointmentDate(date);
    setIsNewAppointmentOpen(true);
  };

  const handleCreateAppointment = (date: Date) => {
    handleNewAppointment(date);
  };

  const handleFormSubmit = (values: Omit<Appointment, 'id'>) => {
    if (onCreateAppointment) {
      const appointmentDate = newAppointmentDate && !isNaN(newAppointmentDate.getTime())
        ? newAppointmentDate
        : new Date();
      
      onCreateAppointment({
        ...values,
        date: appointmentDate,
      });
    }
    setIsNewAppointmentOpen(false);
  };

  const handleCreateNewAppointment = (appointment: Omit<Appointment, 'id'>) => {
    handleFormSubmit(appointment);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onAppointmentClickProp?.(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = (status: Appointment['status']) => {
    if (selectedAppointment) {
      onAppointmentClickProp?.({ ...selectedAppointment, status });
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  const handleCollectPayment = (amount: number, paymentMethod: string) => {
    if (selectedAppointment) {
      console.log('Payment collected:', { amount, paymentMethod, appointmentId: selectedAppointment.id });
      handleUpdateStatus('completed');
    }
  };

  const visibleAppointments = appointments.filter(a => a.status !== 'cancelled');
  const sortedAppointments = [...visibleAppointments].sort((a, b) => {
    if (a.isBlocked && !b.isBlocked) return -1;
    if (!a.isBlocked && b.isBlocked) return 1;
    return 0;
  });
  const staffAppointments = groupAppointmentsByStaff(sortedAppointments);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
  
  const isCurrentDate = isToday(safeSelectedDate);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTopPosition = (currentMinutes - 8 * 60) * (80 / 60) + 64; // 64px for header height

  const renderAppointment = (appointment: Appointment, index: number, staffIndex: number) => {
    if (appointment.isBlocked) {
      const startTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${appointment.startTime}`);
      const endTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${appointment.endTime}`);
      
      return (
        <div 
          key={`blocked-${index}`}
          className="absolute left-0 right-0 mx-1 p-2 rounded border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs"
          style={{
            top: `${(timeToMinutes(appointment.startTime) - 8 * 60) * (80 / 60)}px`,
            height: `${(timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)) * (80 / 60)}px`,
          }}
        >
          <div className="font-medium">Blocked: {appointment.description || 'Not Available'}</div>
          <div className="text-xs opacity-75">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </div>
        </div>
      );
    }
    
    const top = (timeToMinutes(appointment.startTime) - 8 * 60) * (80 / 60);
    const height = (timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)) * (80 / 60);
    const statusConfig = getStatusConfig(appointment.status);
    const employeeColor = getEmployeeColor(staffAppointments[staffIndex][0]);
    
    return (
      <div
        key={appointment.id}
        className={`absolute p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border overflow-hidden ${
          appointment.service.toLowerCase().includes('wedding') 
            ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200 dark:border-red-800' 
            : appointment.service.toLowerCase().includes('home') 
              ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-800' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-800'
        }`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: '4px',
          right: '4px',
        }}
        onClick={() => handleAppointmentClick(appointment)}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 dark:text-white truncate">{appointment.clientName}</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{appointment.service}</div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${statusConfig.className}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{appointment.startTime} - {appointment.endTime}</span>
        </div>
        <div className="flex items-center mt-1">
          <User className={`w-3 h-3 mr-1 flex-shrink-0 ${employeeColor}`} />
          <span className={`text-xs font-medium truncate ${employeeColor}`}>{staffAppointments[staffIndex][0]}</span>
        </div>
        {appointment.notes && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {appointment.notes}
          </div>
        )}
      </div>
    );
  };

  if (staffAppointments.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col h-full w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDateChange('prev')}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDateChange('next')}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-md"
                  onClick={() => handleCreateAppointment(selectedDate)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
      
      {/* Add CSS to hide scrollbars */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
            </div>
          </div>
          <div className="flex items-center justify-center flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
                <Calendar className="w-24 h-24 text-blue-500 dark:text-blue-400 relative z-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No appointments scheduled for this day</h3>
            
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col h-full w-full">
        {/* Top header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('prev')}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('next')}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-md"
              onClick={() => handleCreateAppointment(selectedDate)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
        
        {/* Calendar grid container */}
        <div className="flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col relative overflow-hidden">
          {/* Fixed header row */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-20">
            {/* Fixed time header */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 p-3 font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
              Time
            </div>
            {/* Scrollable staff headers */}
            <div 
              className="flex overflow-x-auto overflow-y-hidden scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={(e) => {
                // Sync scroll with content area
                const contentScroll = document.getElementById('staff-content-scroll');
                if (contentScroll) {
                  contentScroll.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              id="staff-header-scroll"
            >
              {staffAppointments.map(([staffName]) => {
                const bgColor = getEmployeeBgColor(staffName);
                const textColor = getEmployeeColor(staffName);
                return (
                  <div 
                    key={staffName} 
                    className={`min-w-[250px] p-3 font-medium border-r border-gray-200 dark:border-gray-700 ${bgColor} flex-shrink-0`}
                  >
                    <div className="flex items-center">
                      <User className={`w-4 h-4 mr-2 ${textColor}`} />
                      <span className={`font-semibold ${textColor}`}>{staffName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto relative">
            <div className="flex h-full">
              {/* Fixed time column */}
              <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 sticky left-0 z-10">
                {hours.map(hour => (
                  <div 
                    key={`time-${hour}`}
                    className="h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Scrollable staff columns container */}
              <div 
                className="flex overflow-x-auto min-h-full scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  // Sync scroll with header
                  const headerScroll = document.getElementById('staff-header-scroll');
                  if (headerScroll) {
                    headerScroll.scrollLeft = e.currentTarget.scrollLeft;
                  }
                }}
                id="staff-content-scroll"
              >
                {staffAppointments.map(([staffName], staffIndex) => (
                  <div key={staffName} className="min-w-[250px] border-r border-gray-200 dark:border-gray-700 relative flex-shrink-0">
                    {/* Hour lines */}
                    {hours.map(hour => (
                      <div 
                        key={`${staffName}-${hour}`}
                        className="h-20 border-b border-gray-100 dark:border-gray-800 relative"
                      >
                        <div className="absolute top-1/2 w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                      </div>
                    ))}
                    
                    {/* Appointments for this staff */}
                    {staffAppointments
                      .find(([name]) => name === staffName)?.[1]
                      .map(appointment => {
                        const top = (timeToMinutes(appointment.startTime) - 8 * 60) * (80 / 60);
                        const height = (timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)) * (80 / 60);
                        const statusConfig = getStatusConfig(appointment.status);
                        const employeeColor = getEmployeeColor(staffName);
                        
                        return (
                          <div
                            key={appointment.id}
                            className={`absolute p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border overflow-hidden ${
                              appointment.service.toLowerCase().includes('wedding') 
                                ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200 dark:border-red-800' 
                                : appointment.service.toLowerCase().includes('home') 
                                  ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-800' 
                                  : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-800'
                            }`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: '4px',
                              right: '4px',
                            }}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-900 dark:text-white truncate">{appointment.clientName}</div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{appointment.service}</div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${statusConfig.className}`}>
                                {statusConfig.icon} {statusConfig.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{appointment.startTime} - {appointment.endTime}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <User className={`w-3 h-3 mr-1 flex-shrink-0 ${employeeColor}`} />
                              <span className={`text-xs font-medium truncate ${employeeColor}`}>{staffName}</span>
                            </div>
                            {appointment.notes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {appointment.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Current time indicator */}
            {isCurrentDate && currentTopPosition >= 64 && currentTopPosition <= 1104 && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ top: `${currentTopPosition - 64}px` }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-lg"></div>
                  <div className="h-0.5 bg-red-500 flex-1 shadow-sm"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              New Appointment for {newAppointmentDate && format(newAppointmentDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <NewAppointmentForm 
            onSubmit={handleFormSubmit}
            defaultDate={newAppointmentDate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}