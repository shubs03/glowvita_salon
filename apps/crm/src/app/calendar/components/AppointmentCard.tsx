"use client";

import { Clock, User } from 'lucide-react';

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

interface AppointmentCardProps {
  appointment: Appointment;
}

const getServiceColor = (service: string) => {
  if (service.toLowerCase().includes('wedding')) {
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  } else if (service.toLowerCase().includes('home')) {
    return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
  } else {
    return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
  }
};

const getStatusConfig = (status: Appointment['status']) => {
  switch (status) {
    case 'confirmed': 
      return { 
        label: 'Confirmed',
        icon: '✓'
      };
    case 'completed': 
      return { 
        label: 'Completed',
        icon: '✓'
      };
    case 'pending': 
      return { 
        label: 'Pending',
        icon: '⏳'
      };
    case 'cancelled': 
      return { 
        label: 'Cancelled',
        icon: '✕'
      };
    default: 
      return { 
        label: 'Unknown',
        icon: '?'
      };
  }
};

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <div className={`p-3 rounded-lg cursor-pointer transition-shadow hover:shadow-md border ${getServiceColor(appointment.service)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getStatusConfig(appointment.status).icon}
            </span>
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {appointment.clientName}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {appointment.service}
          </p>
        </div>
        <span className="px-2 py-1 text-xs rounded-md font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          {getStatusConfig(appointment.status).label}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-500 mt-2">
        <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span>{appointment.startTime} - {appointment.endTime}</span>
      </div>
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <User className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span>{appointment.staffName}</span>
      </div>
    </div>
  );
}
