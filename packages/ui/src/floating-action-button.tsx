import React from "react";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./cn"

const floatingActionButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group shadow-2xl backdrop-blur-xl",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground hover:shadow-primary/40 hover:scale-110 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-1000 hover:before:translate-x-[100%]",
        destructive: "bg-gradient-to-r from-destructive via-destructive/95 to-destructive/90 text-destructive-foreground hover:shadow-destructive/40 hover:scale-110",
        outline: "border-2 border-primary bg-gradient-to-r from-background/80 to-background/90 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-primary/40",
        secondary: "bg-gradient-to-r from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground hover:shadow-secondary/40 hover:scale-110",
        ghost: "hover:bg-gradient-to-r hover:from-accent/15 hover:to-accent/10 hover:text-accent-foreground hover:scale-110",
        glow: "bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground hover:shadow-primary/60 hover:scale-110 shadow-lg shadow-primary/30 animate-glow",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-10 w-10",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatingActionButtonVariants> {
  asChild?: boolean
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(floatingActionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {children}
        </div>
        {/* Rotating border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-spin" />
        
        {/* Pulse effect for glow variant */}
        {variant === "glow" && (
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-full opacity-30 group-hover:opacity-60 animate-pulse blur-sm" />
        )}
      </Comp>
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton, floatingActionButtonVariants }
