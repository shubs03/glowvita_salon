import { Card, CardContent } from "@repo/ui/card";
import { Users, UserPlus } from 'lucide-react';
import { Staff } from '../page';

interface StaffStatsCardsProps {
  staffList: Staff[];
}

const StaffStatsCards = ({ staffList }: StaffStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Staff</p>
              <p className="text-2xl font-bold text-primary">{staffList.length}</p>
              <p className="text-xs text-primary/70 mt-1">Total team members</p>
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
              <p className="text-sm font-medium text-secondary-foreground mb-1">Active Staff</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {staffList.filter((s: Staff) => s.status === 'Active').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Currently active members</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <UserPlus className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffStatsCards;