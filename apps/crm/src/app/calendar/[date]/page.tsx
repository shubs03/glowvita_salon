"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import DayScheduleView from '../components/DayScheduleView';
import { Card } from '@repo/ui/card';
import { ChevronLeft } from 'lucide-react';
import { AppointmentDetailView } from '../../../components/AppointmentDetailView';
import AddBlockTime from '../../../components/AddBlockTime';
import { selectAllAppointments, useAppointmentActions } from '@repo/store/slices/appointmentSlice';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  isBlocked?: boolean;
  description?: string;
  [key: string]: any; // Allow additional properties
}

import { reset, selectBlockedTimes } from '@repo/store/slices/blockTimeSlice';

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
}

export default function DailySchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { date: dateString } = params;
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const allAppointments = useSelector(selectAllAppointments);
  const { updateExistingAppointment } = useAppointmentActions();
  const dispatch = useDispatch();
  
  if (!dateString || typeof dateString !== 'string') {
    return <div>Invalid date</div>;
  }

  // Parse YYYY-MM-DD date string (local time)
  const [year, month, day] = dateString.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  
  // Get blocked times for the selected date
  const blockedTimes = useSelector((state: any) => 
    selectBlockedTimes(state, { 
      staffName: 'All Staff', // Show all blocked times for now
      date: selectedDate.toISOString().split('T')[0]
    })
  );
  
  // Convert blocked times to the format expected by DayScheduleView
  const blockedSlots = blockedTimes.map((block: any) => ({
    id: `block-${block.id}`,
    clientName: block.staffMember,
    service: block.description || 'Blocked Time',
    staffName: block.staffMember,
    date: selectedDate,
    startTime: block.startTime,
    endTime: block.endTime,
    status: 'cancelled',
    isBlocked: true,
    description: block.description
  }));
  
  // Convert Redux appointments to the expected format
  const appointments = allAppointments.map((appt: any) => ({
    ...appt,
    date: new Date(appt.date), // Ensure date is a Date object
    isBlocked: false // Mark regular appointments as not blocked
  }));
  
  // Validate the date
  if (isNaN(selectedDate.getTime()) || 
      selectedDate.getFullYear() !== year || 
      selectedDate.getMonth() !== month - 1 || 
      selectedDate.getDate() !== day) {
    return <div>Invalid date format. Please use YYYY-MM-DD format</div>;
  }
  const dailyAppointments = appointments
    .filter((appt: Appointment) => {
      const apptDate = new Date(appt.date);
      return (
        apptDate.getFullYear() === selectedDate.getFullYear() &&
        apptDate.getMonth() === selectedDate.getMonth() &&
        apptDate.getDate() === selectedDate.getDate()
      );
    })
    .map((appt: Appointment) => ({
      ...appt,
      isBlocked: false // Mark regular appointments as not blocked
    }));
    
  // Combine appointments and blocked times
  const allEvents = [...dailyAppointments, ...blockedSlots];

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    if (selectedAppointment) {
      const updatedAppointment = {
        ...selectedAppointment,
        status: status as Appointment['status']
      };
      // Update in Redux store
      updateExistingAppointment(selectedAppointment.id, {
        status: status as Appointment['status']
      });
      setSelectedAppointment(updatedAppointment);
    }
  }, [selectedAppointment, updateExistingAppointment]);

  const handleBackClick = () => {
    router.push('/calendar');
  };

  const handleOpenBlockTimeModal = () => {
    dispatch(reset());
    setShowBlockTimeModal(true);
  };

  const handleCloseBlockTimeModal = () => {
    setShowBlockTimeModal(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackClick}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          Schedule for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h1>
        <div className="ml-auto">
          <Button onClick={handleOpenBlockTimeModal}>
            Block Time
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <DayScheduleView 
          selectedDate={selectedDate} 
          appointments={allEvents} 
          onAppointmentClick={(appt) => {
            // Only trigger click for non-blocked appointments
            if (!appt.isBlocked) {
              handleAppointmentClick(appt);
            }
          }}
        />
      </Card>

      {selectedAppointment && (
        <AppointmentDetailView
          appointment={selectedAppointment}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
        />
      )}

      <AddBlockTime 
        open={showBlockTimeModal} 
        onClose={handleCloseBlockTimeModal} 
        initialDate={dateString as string}
      />
    </div>
  );
}