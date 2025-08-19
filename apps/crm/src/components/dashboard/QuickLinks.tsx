
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Plus, Calendar, Settings, Users } from "lucide-react";

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
        </Button>
        <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Full Calendar
        </Button>
        <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Clients
        </Button>
        <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Services
        </Button>
      </CardContent>
    </Card>
  );
}
