import { Card, CardContent } from "@repo/ui/card";
import { CalendarCheck, UserCheck, CheckCircle, CalendarX } from 'lucide-react';
import { Appointment } from '@repo/types';

interface AppointmentStatsCardsProps {
  appointments: Appointment[];
}

const AppointmentStatsCards = ({ appointments }: AppointmentStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-primary">{appointments.length}</p>
              <p className="text-xs text-primary/70 mt-1">All scheduled appointments</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Upcoming confirmed bookings</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <UserCheck className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Completed</p>
              <p className="text-2xl font-bold text-primary">
                {appointments.filter(a => a.status === 'completed' || a.status === 'completed without payment').length}
              </p>
              <p className="text-xs text-primary/70 mt-1">Successfully completed</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Cancelled by client or staff</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CalendarX className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStatsCards;