import * as React from "react"
import { cn } from "./cn"

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "online" | "offline" | "busy" | "away"
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, size = "md", animated = true, ...props }, ref) => {
    const statusConfig = {
      online: {
        color: "from-green-400 to-green-600",
        shadow: "shadow-green-500/30",
        label: "Online"
      },
      offline: {
        color: "from-gray-400 to-gray-600",
        shadow: "shadow-gray-500/30",
        label: "Offline"
      },
      busy: {
        color: "from-red-400 to-red-600",
        shadow: "shadow-red-500/30",
        label: "Busy"
      },
      away: {
        color: "from-yellow-400 to-yellow-600",
        shadow: "shadow-yellow-500/30",
        label: "Away"
      }
    }

    const sizeConfig = {
      sm: "w-2 h-2",
      md: "w-3 h-3", 
      lg: "w-4 h-4"
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center", className)}
        {...props}
      >
        <div className={cn(
          "rounded-full bg-gradient-to-r shadow-lg",
          config.color,
          config.shadow,
          sizeConfig[size],
          animated && "animate-pulse"
        )} />
        {animated && (
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r animate-ping opacity-75",
            config.color,
            sizeConfig[size]
          )} />
        )}
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator }