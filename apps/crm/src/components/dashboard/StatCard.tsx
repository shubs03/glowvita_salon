
import { Card, CardContent } from "@repo/ui/card";
import { type IconType } from "react-icons";
import { cn } from "@repo/ui/cn";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: IconType;
  iconColor?: string;
}

export function StatCard({ title, value, change, subtitle, icon: Icon, iconColor }: StatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-secondary-foreground">{value}</p>
            <p className="text-xs text-secondary-foreground/70 mt-1">{subtitle}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full transition-colors">
            <Icon className={cn("h-6 w-6", iconColor || "text-secondary-foreground")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
