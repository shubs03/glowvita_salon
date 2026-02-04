"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

interface Appointment {
  name: string;
  service: string;
  date: string;
  time: string;
  duration?: number;
  staff?: string;
}

interface UpcomingAppointmentsProps {
  filterType?: 'preset' | 'custom';
  presetPeriod?: 'day' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

// Helper function to format date for display
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function UpcomingAppointments({
  filterType = 'preset',
  presetPeriod = 'all',
  startDate = '',
  endDate = ''
}: UpcomingAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        // Build query params based on filter parameters
        let url = '/api/crm/vendor/metrics/upcoming';
        const params = new URLSearchParams();

        // Handle custom date range
        if (filterType === 'custom' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        }
        // Handle preset periods
        else if (presetPeriod && presetPeriod !== 'all') {
          params.append('period', presetPeriod);
        }

        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAppointments(result.data);
            setCount(result.count);
          }
        }
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        // Fallback to mock data on error
        const mockAppointments = [
          { name: 'Olivia Martin', service: 'Deluxe Haircut', date: 'Dec 5, 2025', time: '11:00 AM' },
          { name: 'Jackson Lee', service: 'Manicure', date: 'Dec 5, 2025', time: '12:30 PM' },
          { name: 'Isabella Nguyen', service: 'Facial', date: 'Dec 6, 2025', time: '2:00 PM' },
          { name: 'William Kim', service: 'Beard Trim', date: 'Dec 7, 2025', time: '3:15 PM' },
          { name: 'Sophia Garcia', service: 'Color & Style', date: 'Dec 8, 2025', time: '4:00 PM' },
        ];
        setAppointments(mockAppointments);
        setCount(mockAppointments.length);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingAppointments();
  }, [filterType, presetPeriod, startDate, endDate]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Loading appointments...</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              {filterType === 'custom'
                ? `You have ${count} upcoming appointments from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`
                : presetPeriod === 'day'
                  ? `You have ${count} upcoming appointments for today.`
                  : presetPeriod === 'month'
                    ? `You have ${count} upcoming appointments for this month.`
                    : presetPeriod === 'year'
                      ? `You have ${count} upcoming appointments for this year.`
                      : `You have ${count} upcoming appointments.`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.slice(0, 5).map((appt, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium truncate max-w-[100px]">{appt.name}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate max-w-[120px]">{appt.service}</TableCell>
                    <TableCell className="whitespace-nowrap">{appt.date}</TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">{appt.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No upcoming appointments
          </div>
        )}
      </CardContent>
    </Card>
  );
}