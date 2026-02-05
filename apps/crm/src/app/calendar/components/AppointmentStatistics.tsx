import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

interface AppointmentStatisticsProps {
  appointments: any[];
}

export default function AppointmentStatistics({ appointments }: AppointmentStatisticsProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground text-sm font-medium">Total</span>
            <span className="font-semibold text-foreground">
              {appointments.length}
            </span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Confirmed</span>
              </div>
              <span className="text-xs font-medium text-primary">
                {appointments.filter((a: any) => a.status === 'confirmed').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-secondary mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Completed</span>
              </div>
              <span className="text-xs font-medium text-secondary-foreground">
                {appointments.filter((a: any) => a.status === 'completed').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary/70 mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Scheduled</span>
              </div>
              <span className="text-xs font-medium text-primary/80">
                {appointments.filter((a: any) => a.status === 'scheduled').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary/30 mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Cancelled</span>
              </div>
              <span className="text-xs font-medium text-primary/50">
                {appointments.filter((a: any) => a.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}