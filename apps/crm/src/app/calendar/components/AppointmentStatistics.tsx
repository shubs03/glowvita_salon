import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

interface AppointmentStatisticsProps {
  appointments: any[];
}

export default function AppointmentStatistics({ appointments }: AppointmentStatisticsProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <div className="p-1.5 bg-primary/10 rounded-md mr-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
          </div>
          Stats
        </CardTitle>
      </CardHeader>
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
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Completed</span>
              </div>
              <span className="text-xs font-medium text-green-600">
                {appointments.filter((a: any) => a.status === 'completed').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Scheduled</span>
              </div>
              <span className="text-xs font-medium text-yellow-600">
                {appointments.filter((a: any) => a.status === 'scheduled').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-destructive mr-1.5"></div>
                <span className="text-muted-foreground text-xs">Cancelled</span>
              </div>
              <span className="text-xs font-medium text-destructive">
                {appointments.filter((a: any) => a.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}