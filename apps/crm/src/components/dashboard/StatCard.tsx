
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, icon: Icon, iconColor }: StatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs text-muted-foreground", isPositive ? "text-green-600" : "text-red-600")}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
