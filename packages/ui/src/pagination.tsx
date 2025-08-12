
"use client";

import * as React from "react";
import { cn } from "./cn";
import { Button, ButtonProps } from "./button";

const PaginationContext = React.createContext<{
  page: number;
  perPage: number;
  count: number;
}>({
  page: 1,
  perPage: 10,
  count: 0,
});

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <Button variant="outline">Previous</Button>
        <Button variant="outline">Next</Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">97</span> results
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <Button variant="outline" className="rounded-r-none">Previous</Button>
            <Button variant="outline" className="rounded-l-none">Next</Button>
          </nav>
        </div>
      </div>
    </div>
));
Pagination.displayName = "Pagination";

export { Pagination };
