
import { Card, CardContent } from "@repo/ui/card";
import { type IconType } from "react-icons";
import { cn } from "@repo/ui/cn";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  description?: string;
  icon: any;
  iconColor?: string;
}

export function StatCard({ title, value, change, subtitle, description, icon: Icon, iconColor }: StatCardProps) {
  const isPositive = change?.startsWith('+');
  const displaySubtitle = subtitle || description;
  
  return (
    <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-secondary-foreground">{value}</p>
            {displaySubtitle && (
              <p className="text-xs text-secondary-foreground/70 mt-1">{displaySubtitle}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full transition-colors">
            {typeof Icon === 'function' || (typeof Icon === 'object' && Icon?.displayName) ? (
              <Icon className={cn("h-6 w-6", iconColor || "text-secondary-foreground")} />
            ) : (
              <div className={cn("h-6 w-6", iconColor || "text-secondary-foreground")}>{Icon}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
