
"use client";

import { Card, CardContent } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

export interface Appointment {
  id: string;
  service: string;
  date: string | Date;
  staff: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Scheduled' | 'Pending';
  price: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
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
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">
              {appointment.serviceItems && appointment.serviceItems.length > 0
                ? appointment.serviceItems.map(item => item.serviceName).join(", ")
                : appointment.service}
            </h4>
            <p className="text-sm text-muted-foreground">
              with {appointment.serviceItems && appointment.serviceItems.length > 0
                ? Array.from(new Set(appointment.serviceItems.map(item => item.staffName))).join(", ")
                : appointment.staff}
            </p>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-sm flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-2" /> {format(new Date(appointment.date), 'EEE, MMM d, yyyy')}
            </p>
            {appointment.startTime && (
              <p className="text-sm flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" /> {appointment.startTime}
              </p>
            )}
          </div>
          <p className="text-lg font-bold text-primary">₹{appointment.price.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
