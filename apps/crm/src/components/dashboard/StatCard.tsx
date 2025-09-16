
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { type IconType } from "react-icons";
import { cn } from "@repo/ui/cn";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: IconType;
  iconColor?: string;
}

export function StatCard({ title, value, change, icon: Icon, iconColor }: StatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card className="relative group overflow-hidden bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-2xl border border-border/30 hover:border-primary/50 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.05] hover:-translate-y-2">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/4 via-transparent to-primary/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-all duration-500 group-hover:font-semibold">
          {title}
        </CardTitle>
        <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/8 to-primary/6 group-hover:from-primary/20 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-110 group-hover:rotate-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Icon className={cn("h-5 w-5 relative z-10 transition-all duration-500 group-hover:scale-125 drop-shadow-lg", iconColor || "text-primary")} />
          {/* Icon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 opacity-0 group-hover:opacity-60 blur-xl transition-all duration-700"></div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-all duration-500 mb-2 group-hover:scale-110 transform-gpu">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground group-hover:from-primary group-hover:via-primary/90 group-hover:to-primary/80 bg-clip-text text-transparent">
            {value}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse transition-all duration-500",
            isPositive ? "bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/40" : "bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/40"
          )}></div>
          <p className={cn(
            "text-xs font-semibold transition-all duration-500 group-hover:font-bold",
            isPositive ? "text-green-600 dark:text-green-400 group-hover:text-green-500" : "text-red-600 dark:text-red-400 group-hover:text-red-500"
          )}>
            {change} from last month
          </p>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute top-4 right-4 w-1 h-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-700" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-6 left-6 w-0.5 h-0.5 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-700" style={{animationDelay: '1s'}}></div>
      </CardContent>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{filter: 'blur(1px)'}}></div>
    </Card>
  );
}
