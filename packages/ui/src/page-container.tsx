import * as React from "react";
import { cn } from "./cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth = "full", padding = "lg", children, ...props }, ref) => {
    const maxWidths = {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-8xl",
      full: "max-w-none"
    };

    const paddings = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-4 sm:p-6 lg:p-8"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          maxWidths[maxWidth],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageContainer.displayName = "PageContainer";

const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}
    {...props}
  />
));
PageHeader.displayName = "PageHeader";

const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-2xl font-bold tracking-tight text-foreground", className)}
    {...props}
  />
));
PageTitle.displayName = "PageTitle";

const PageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground", className)}
    {...props}
  />
));
PageDescription.displayName = "PageDescription";

export {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
};