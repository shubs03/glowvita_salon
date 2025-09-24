
"use client";

import { Card, CardContent } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, Scissors, UserCheck } from 'lucide-react';
import { cn } from '@repo/ui/cn';

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
  onSelect: () => void;
  isSelected: boolean;
}

export function AppointmentCard({ appointment, onSelect, isSelected }: AppointmentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Confirmed': return { color: 'blue', text: 'Upcoming' };
      case 'Completed': return { color: 'green', text: 'Completed' };
      case 'Cancelled': return { color: 'red', text: 'Cancelled' };
      default: return { color: 'gray', text: 'Scheduled' };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "bg-primary/5 border-primary shadow-lg" 
          : "bg-card hover:border-border hover:bg-secondary/50"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-base leading-tight pr-4">{appointment.service}</h4>
        <div className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5",
            `bg-${statusConfig.color}-100 text-${statusConfig.color}-800`
        )}>
           <div className={`w-2 h-2 rounded-full bg-${statusConfig.color}-500`}></div>
           {statusConfig.text}
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(appointment.date), 'EEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          <span>with {appointment.staff}</span>
        </div>
      </div>
    </button>
  );
}

