import { Card, CardContent } from "@repo/ui/card";
import { Send, MessageSquare, Users } from 'lucide-react';

interface NotificationStats {
  total: number;
  pushSent: number;
  smsSent: number;
  mostTargeted: string;
}

interface NotificationStatsCardsProps {
  stats: NotificationStats;
}

const NotificationStatsCards = ({ stats }: NotificationStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Sent</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-primary/70 mt-1">Across all channels</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Send className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Push Sent</p>
              <p className="text-2xl font-bold text-secondary-foreground">{stats.pushSent}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Total push notifications</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <MessageSquare className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">SMS Sent</p>
              <p className="text-2xl font-bold text-secondary-foreground">{stats.smsSent}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Total SMS notifications</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <MessageSquare className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Most Targeted</p>
              <p className="text-lg font-bold text-secondary-foreground truncate">{stats.mostTargeted}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Most common audience</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationStatsCards;