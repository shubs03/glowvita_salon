
"use client";

import * as React from "react";
import { cn } from "./cn";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  totalItems: number;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems, ...props }, ref) => {
    
    const firstItemIndex = (currentPage - 1) * itemsPerPage + 1;
    const lastItemIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const generatePaginationNumbers = () => {
      const pageNumbers: (number | string)[] = [];
      const maxPagesToShow = 5;

      if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
          endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
        }
        if (currentPage >= totalPages - 2) {
          startPage = Math.max(2, totalPages - maxPagesToShow + 2);
        }

        if (startPage > 2) pageNumbers.push('...');
        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
        }
        if (endPage < totalPages - 1) pageNumbers.push('...');
        if (totalPages > 1) pageNumbers.push(totalPages);
      }
      return pageNumbers;
    };
    
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-between gap-4 md:flex-row", className)}
        {...props}
      >
        <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{firstItemIndex}</span> to{" "}
            <span className="font-medium text-foreground">{lastItemIndex}</span> of{" "}
            <span className="font-medium text-foreground">{totalItems}</span> results
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={`${itemsPerPage}`}
                    onValueChange={(value) => {
                        onItemsPerPageChange(Number(value));
                        onPageChange(1);
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                 <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                 <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    );
  }
);
Pagination.displayName = "Pagination";

export { Pagination };

