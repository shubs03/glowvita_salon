
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Button } from "@repo/ui/button";

const appointments = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', service: 'Deluxe Haircut', time: '11:00 AM' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', service: 'Manicure', time: '12:30 PM' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', service: 'Facial', time: '2:00 PM' },
  { name: 'William Kim', email: 'will@email.com', service: 'Beard Trim', time: '3:15 PM' },
];

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>You have {appointments.length} appointments today.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appt, index) => (
          <div key={index} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={`https://placehold.co/36x36.png?text=${appt.name.charAt(0)}`} alt="Avatar" />
              <AvatarFallback>{appt.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{appt.name}</p>
              <p className="text-sm text-muted-foreground">{appt.service}</p>
            </div>
            <div className="font-medium">{appt.time}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
