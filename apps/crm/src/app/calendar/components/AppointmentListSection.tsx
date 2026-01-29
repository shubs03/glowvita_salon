"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';
import { Appointment } from './NewAppointmentForm';
import { glowvitaApi } from '@repo/store/api';
import { useAppDispatch } from '@repo/store/hooks';
import { setSelectedAppointment } from '@repo/store/slices/appointmentSlice';
import { toast } from 'sonner';
import { isSameDay } from 'date-fns';

interface AppointmentListSectionProps {
  appointments: Appointment[];
  currentDate: Date;
  isLoadingAppointments: boolean;
  handleEditAppointment: (appointment: Appointment) => void;
  handleDeleteAppointment: (id: string) => void;
}

export default function AppointmentListSection({
  appointments,
  currentDate,
  isLoadingAppointments,
  handleEditAppointment,
  handleDeleteAppointment
}: AppointmentListSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center text-xl font-bold text-foreground">
            All Appointments
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full">
            {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <div className="divide-y divide-gray-100">
          {isLoadingAppointments ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
              <p className="text-sm text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 transition-colors duration-200 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                onClick={() => {
                  const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
                  router.push(`/calendar/${formattedDate}?appointmentId=${appointment.id}`);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* First Column - Client Name and Service Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {appointment.clientName || 'No Name'}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {appointment.serviceName || 'No service specified'}
                    </p>
                  </div>
                                
                  {/* Second Column - Staff Name, Date and Time */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{appointment.staffName || 'No staff assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(appointment.date).toLocaleDateString()} • {appointment.startTime}-{appointment.endTime}
                      </span>
                      <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {appointment.duration}m
                      </span>
                    </div>
                  </div>
                                
                  {/* Third Column - Amount and Status */}
                  <div className="flex flex-col items-end min-w-0">
                    <p className="font-semibold text-foreground">
                      ₹{appointment.finalAmount?.toFixed(2) || appointment.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : appointment.status === 'no_show'
                              ? 'bg-gray-100 text-gray-800'
                              : appointment.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-4">No appointments found</p>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => {
                  dispatch(setSelectedAppointment(null));
                  // This will be handled by parent component
                }}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Appointment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}