import { Card, CardContent } from "@repo/ui/card";
import { CalendarCheck, UserCheck, CheckCircle, CalendarX } from 'lucide-react';
import { Appointment } from '@repo/types';

interface AppointmentStatsCardsProps {
  appointments: Appointment[];
}

const isPayOnline = (appt: Appointment) => {
  const method = String((appt as any).paymentMethod || appt.payment?.paymentMethod || '').toLowerCase();
  return method.includes('online');
};

const AppointmentStatsCards = ({ appointments }: AppointmentStatsCardsProps) => {
  const totalPayOnline = appointments.filter(isPayOnline).length;
  const totalPayAtSalon = appointments.length - totalPayOnline;

  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const confirmedPayOnline = confirmedAppointments.filter(isPayOnline).length;
  const confirmedPayAtSalon = confirmedAppointments.length - confirmedPayOnline;

  const completedAppointments = appointments.filter(
    a => a.status === 'completed' || a.status === 'completed without payment'
  );
  const completedPayOnline = completedAppointments.filter(isPayOnline).length;
  const completedPayAtSalon = completedAppointments.length - completedPayOnline;

  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
  const cancelledPayOnline = cancelledAppointments.filter(isPayOnline).length;
  const cancelledPayAtSalon = cancelledAppointments.length - cancelledPayOnline;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Appointments</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{appointments.length}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">All scheduled appointments</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-secondary/10">
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Pay Online: {totalPayOnline}
                </span>
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  At Salon: {totalPayAtSalon}
                </span>
              </div>
            </div>
            <div className="p-3 bg-secondary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30 self-start">
              <CalendarCheck className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {confirmedAppointments.length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Upcoming confirmed bookings</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-secondary/10">
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Pay Online: {confirmedPayOnline}
                </span>
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  At Salon: {confirmedPayAtSalon}
                </span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30 self-start">
              <UserCheck className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Completed</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {completedAppointments.length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Successfully completed</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-secondary/10">
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Pay Online: {completedPayOnline}
                </span>
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  At Salon: {completedPayAtSalon}
                </span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30 self-start">
              <CheckCircle className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {cancelledAppointments.length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Cancelled by client or staff</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-secondary/10">
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Pay Online: {cancelledPayOnline}
                </span>
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  At Salon: {cancelledPayAtSalon}
                </span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30 self-start">
              <CalendarX className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStatsCards;