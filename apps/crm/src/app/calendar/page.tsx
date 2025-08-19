
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from '@repo/ui/cn';

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

const mockAppointments: Appointment[] = [
  { id: '1', clientName: 'Alice Johnson', service: 'Deluxe Haircut', staffName: 'Jane Doe', date: new Date(2024, 7, 12), startTime: '10:00', endTime: '11:00', status: 'confirmed' },
  { id: '2', clientName: 'Bob Williams', service: 'Manicure', staffName: 'Emily White', date: new Date(2024, 7, 12), startTime: '12:30', endTime: '13:30', status: 'completed' },
  { id: '3', clientName: 'Charlie Brown', service: 'Facial', staffName: 'Jane Doe', date: new Date(2024, 7, 15), startTime: '14:00', endTime: '15:00', status: 'pending' },
  { id: '4', clientName: 'Diana Prince', service: 'Color & Style', staffName: 'John Smith', date: new Date(2024, 7, 20), startTime: '09:00', endTime: '12:00', status: 'confirmed' },
  { id: '5', clientName: 'Ethan Hunt', service: 'Beard Trim', staffName: 'John Smith', date: new Date(2024, 8, 5), startTime: '16:00', endTime: '16:30', status: 'confirmed' },
];

const staffMembers = ['All Staff', 'Jane Doe', 'John Smith', 'Emily White'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('All Staff');

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

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(appointment.date);
    setIsModalOpen(true);
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

  const renderMonthView = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();

    return (
      <div className="grid grid-cols-7 border-t border-l">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-2 border-r border-b text-sm text-muted-foreground">{day}</div>
        ))}
        {blanks.map((_, i) => <div key={`blank-${i}`} className="border-r border-b"></div>)}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = today.toDateString() === date.toDateString();
          const appointmentsForDay = mockAppointments.filter(a => 
              a.date.toDateString() === date.toDateString() &&
              (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
          );

          return (
            <div 
              key={day} 
              className="h-32 border-r border-b p-1.5 flex flex-col cursor-pointer hover:bg-secondary/50 relative" 
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className={cn("font-medium text-sm", isToday && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center")}>{day}</span>
              <div className="flex-grow overflow-y-auto space-y-1 mt-1 no-scrollbar">
                {appointmentsForDay.map(appt => (
                  <div key={appt.id} onClick={(e) => { e.stopPropagation(); handleAppointmentClick(appt); }} 
                    className={cn("text-white text-xs rounded px-1.5 py-0.5 truncate", getStatusColor(appt.status))}>
                    {appt.clientName}
                  </div>
                ))}
              </div>
              {hoveredDay === day && appointmentsForDay.length > 0 && (
                <div className="absolute z-10 top-full left-0 mt-1 w-64 bg-background border rounded-lg shadow-lg p-3 text-sm">
                    <h4 className="font-bold mb-2">Appointments for {date.toLocaleDateString()}</h4>
                    <ul className="space-y-1">
                        {appointmentsForDay.map(appt => (
                            <li key={appt.id} className="flex items-center justify-between">
                                <span>{appt.clientName} ({appt.staffName})</span>
                                <span className="text-xs text-muted-foreground">{appt.startTime}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderWeekView = () => {
    // Simplified week view for demonstration
    return <div className="p-8 text-center text-muted-foreground">Weekly view is not yet implemented.</div>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Bookings Calendar</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
                <h2 className="text-xl font-semibold text-center w-48">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            </div>
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
                <Tabs defaultValue="month" onValueChange={(value) => setView(value as 'month' | 'week')}>
                    <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={() => { setSelectedAppointment(null); setSelectedDate(new Date()); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' ? renderMonthView() : renderWeekView()}
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedAppointment ? 'View/Edit Booking' : 'New Booking'}</DialogTitle>
                <DialogDescription>
                    {selectedAppointment 
                        ? `Details for booking on ${selectedDate?.toLocaleDateString()}` 
                        : `Create a new booking for ${selectedDate?.toLocaleDateString()}`
                    }
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input id="clientName" defaultValue={selectedAppointment?.clientName || ''} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="service">Service</Label>
                    <Select defaultValue={selectedAppointment?.service}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Deluxe Haircut">Deluxe Haircut</SelectItem>
                            <SelectItem value="Manicure">Manicure</SelectItem>
                            <SelectItem value="Facial">Facial</SelectItem>
                            <SelectItem value="Color & Style">Color & Style</SelectItem>
                            <SelectItem value="Beard Trim">Beard Trim</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" type="time" defaultValue={selectedAppointment?.startTime || '09:00'} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" type="time" defaultValue={selectedAppointment?.endTime || '10:00'} />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={selectedAppointment?.status || 'confirmed'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Any special requests or notes..." defaultValue={selectedAppointment?.notes || ''}/>
                </div>
            </div>
            <DialogFooter className="justify-between">
                {selectedAppointment && (
                     <Button variant="destructive" onClick={() => {/* handle delete */ setIsModalOpen(false)}}>Delete Booking</Button>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => {/* handle save */ setIsModalOpen(false)}}>
                    {selectedAppointment ? 'Save Changes' : 'Create Booking'}
                  </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
