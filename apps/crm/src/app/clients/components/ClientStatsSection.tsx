import { Card, CardContent } from "@repo/ui/card";
import { Users, UserPlus, ShoppingBag, UserX, Calendar, IndianRupee } from 'lucide-react';
import { Client } from '../types';

interface ClientStatsSectionProps {
  offlineClients: Client[];
  onlineClients: Client[];
  appointments: any[];
  inactiveClients: Client[];
  totalsById: Map<string, number>;
  bookingsById: Map<string, number>;
  currentSegment: "offline" | "online";
}

export default function ClientStatsSection({
  offlineClients,
  onlineClients,
  appointments,
  inactiveClients,
  totalsById,
  bookingsById,
  currentSegment
}: ClientStatsSectionProps) {
  const activeClientsArray = currentSegment === 'online' ? onlineClients : offlineClients;
  const activeClientIds = new Set(activeClientsArray.map(c => String(c._id)));

  const totalClients = activeClientsArray.length;

  const activeInactiveCount = activeClientsArray.filter((c: Client) => c.status === 'Inactive').length;

  const totalBookings = Array.from(bookingsById.entries())
    .filter(([id]) => activeClientIds.has(id))
    .reduce((sum, [_, val]) => sum + val, 0);

  const segmentRevenue = Array.from(totalsById.entries())
    .filter(([id]) => activeClientIds.has(id))
    .reduce((sum, [_, val]) => sum + val, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-primary">{totalClients}</p>
              <p className="text-xs text-primary/70 mt-1">Total client base</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-secondary-foreground">{totalClients - activeInactiveCount}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Currently active</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <UserPlus className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-secondary-foreground">{totalBookings}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">All time bookings</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Calendar className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                ₹{segmentRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Lifetime revenue</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <IndianRupee className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}