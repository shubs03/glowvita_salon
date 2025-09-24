
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
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  price: number;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
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
            <h4 className="font-semibold">{appointment.service}</h4>
            <p className="text-sm text-muted-foreground">with {appointment.staff}</p>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-sm flex items-center"><Calendar className="h-4 w-4 mr-2" /> {format(new Date(appointment.date), 'EEE, MMM d, yyyy')}</p>
          </div>
          <p className="text-lg font-bold text-primary">₹{appointment.price.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
