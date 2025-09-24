
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Trash } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { AppointmentCard } from '../../../components/profile/AppointmentCard';

const pastAppointments = [
  {
    id: "APP-024",
    service: "Signature Facial",
    date: "2024-08-15T16:00:00Z",
    staff: "Emily White",
    status: "Completed",
    price: 150.0,
  },
  {
    id: "APP-023",
    service: "Haircut & Style",
    date: "2024-07-20T10:00:00Z",
    staff: "Jessica Miller",
    status: "Completed",
    price: 75.0,
  },
  {
    id: "APP-022",
    service: "Hot Stone Massage",
    date: "2024-06-25T13:00:00Z",
    staff: "Michael Chen",
    status: "Cancelled",
    price: 130.0,
  },
];

export default function AppointmentsPage() {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    const handleCancelClick = (appointment) => {
        setAppointmentToCancel(appointment);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        console.log("Cancelling appointment:", appointmentToCancel?.id);
        setIsCancelModalOpen(false);
        setAppointmentToCancel(null);
    };

  const isAppointmentCancellable = (appointmentDate: string) => {
    const now = new Date();
    const apptDate = new Date(appointmentDate);
    const hoursDifference = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference > 24;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Calendar} title="Upcoming" value={2} change="Next in 3 days" />
        <StatCard icon={CheckCircle} title="Completed" value={pastAppointments.filter(a => a.status === 'Completed').length} change="All time" />
        <StatCard icon={X} title="Cancelled" value={pastAppointments.filter(a => a.status === 'Cancelled').length} change="All time" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>View your upcoming and past appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...pastAppointments].map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.service}</TableCell>
                  <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                  <TableCell>{appt.staff}</TableCell>
                  <TableCell>₹{appt.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={appt.status === "Completed" ? "default" : "secondary"}>
                      {appt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAppointmentCancellable(appt.date) && appt.status === 'Confirmed' ? (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelClick(appt)}>
                        <Trash className="h-4 w-4 mr-1" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled className="text-gray-400">
                        <Trash className="h-4 w-4 mr-1" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment for {appointmentToCancel?.service}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>Yes, Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
