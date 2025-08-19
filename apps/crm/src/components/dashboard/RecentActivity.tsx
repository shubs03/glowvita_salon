
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

const activities = [
    { user: 'Liam Johnson', action: 'booked a new appointment for', subject: 'Classic Haircut' },
    { user: 'Olivia Smith', action: 'cancelled their appointment for', subject: 'Spa Day' },
    { user: 'Noah Williams', action: 'left a 5-star review for', subject: 'Beard Styling' },
    { user: 'Emma Brown', action: 'booked a new appointment for', subject: 'Gel Manicure' },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-semibold text-secondary-foreground">{activity.user.charAt(0)}</span>
                </div>
                <div className="grid gap-1">
                    <p className="text-sm font-medium">
                        {activity.user}
                        <span className="font-normal text-muted-foreground"> {activity.action} </span>
                        {activity.subject}
                    </p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
