
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { FaPlus, FaCalendarAlt, FaCog, FaUsers } from "react-icons/fa";

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline">
            <FaPlus className="mr-2 h-4 w-4" />
            New Booking
        </Button>
        <Button variant="outline">
            <FaCalendarAlt className="mr-2 h-4 w-4" />
            Full Calendar
        </Button>
        <Button variant="outline">
            <FaUsers className="mr-2 h-4 w-4" />
            Clients
        </Button>
        <Button variant="outline">
            <FaCog className="mr-2 h-4 w-4" />
            Services
        </Button>
      </CardContent>
    </Card>
  );
}
