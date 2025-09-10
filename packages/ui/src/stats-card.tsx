import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "./cn"

const statsCardVariants = cva(
  "relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl group overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-background/95 via-background/90 to-background/85 border-border/20 hover:border-primary/30 hover:shadow-primary/15",
        primary: "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/8 border-primary/30 hover:border-primary/50 hover:shadow-primary/25",
        success: "bg-gradient-to-br from-green-500/15 via-green-500/10 to-green-500/8 border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/25",
        warning: "bg-gradient-to-br from-yellow-500/15 via-yellow-500/10 to-yellow-500/8 border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-yellow-500/25",
        destructive: "bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/8 border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/25"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface StatsCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ElementType
  trend?: "up" | "down" | "neutral"
  animated?: boolean
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ 
    className, 
    variant, 
    title, 
    value, 
    change, 
    changeLabel, 
    icon: Icon, 
    trend = "neutral", 
    animated = true,
    ...props 
  }, ref) => {
    const getTrendIcon = () => {
      switch (trend) {
        case "up":
          return <TrendingUp className="h-4 w-4 text-green-500" />
        case "down":
          return <TrendingDown className="h-4 w-4 text-red-500" />
        default:
          return <Minus className="h-4 w-4 text-muted-foreground" />
      }
    }

    const getTrendColor = () => {
      switch (trend) {
        case "up":
          return "text-green-500"
        case "down":
          return "text-red-500"
        default:
          return "text-muted-foreground"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(statsCardVariants({ variant, className }))}
        {...props}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <h3 className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                {title}
              </h3>
            </div>
            
            {/* Trend Indicator */}
            {change !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                {getTrendIcon()}
                <span className={cn("text-xs font-bold", getTrendColor())}>
                  {change > 0 ? "+" : ""}{change}%
                </span>
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="mb-3">
            <p className={cn(
              "text-3xl font-bold text-foreground transition-all duration-500 group-hover:text-primary",
              animated && "group-hover:scale-105"
            )}>
              {value}
            </p>
          </div>
          
          {/* Change Label */}
          {changeLabel && (
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-500">
              {changeLabel}
            </p>
          )}
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-primary/15 to-primary/8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 group-hover:scale-125" />
        </div>
        
        {/* Glow Effect */}
        {animated && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-700 opacity-0 group-hover:opacity-100 blur-xl" />
        )}
      </div>
    )
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard, statsCardVariants }