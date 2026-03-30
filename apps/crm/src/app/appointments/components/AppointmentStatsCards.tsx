import { Card, CardContent } from "@repo/ui/card";
import { CalendarCheck, UserCheck, CheckCircle, CalendarX } from 'lucide-react';
import { Appointment } from '@repo/types';

interface AppointmentStatsCardsProps {
  appointments: Appointment[];
}

const AppointmentStatsCards = ({ appointments }: AppointmentStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Appointments</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{appointments.length}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">All scheduled appointments</p>
            </div>
            <div className="p-3 bg-secondary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30">
              <CalendarCheck className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Upcoming confirmed bookings</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <UserCheck className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Completed</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {appointments.filter(a => a.status === 'completed' || a.status === 'completed without payment').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Successfully completed</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <CheckCircle className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Cancelled by client or staff</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <CalendarX className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStatsCards;