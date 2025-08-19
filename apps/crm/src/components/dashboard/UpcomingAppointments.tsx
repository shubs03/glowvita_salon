
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";

const appointments = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', service: 'Deluxe Haircut', time: '11:00 AM' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', service: 'Manicure', time: '12:30 PM' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', service: 'Facial', time: '2:00 PM' },
  { name: 'William Kim', email: 'will@email.com', service: 'Beard Trim', time: '3:15 PM' },
  { name: 'Sophia Garcia', email: 'sophia.g@email.com', service: 'Color & Style', time: '4:00 PM' },
];

export function UpcomingAppointments() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>You have {appointments.length} appointments today.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {appointments.slice(0, 4).map((appt, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <div className="font-medium">{appt.name}</div>
                        <div className="text-sm text-muted-foreground">{appt.email}</div>
                    </TableCell>
                    <TableCell>{appt.service}</TableCell>
                    <TableCell className="text-right font-medium">{appt.time}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
