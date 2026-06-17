"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { RevenueReportTable } from '../tables';

interface RevenueReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevenueReportDialog = ({ isOpen, onClose }: RevenueReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Revenue Report</DialogTitle>
          <DialogDescription>
            Complete overview of total platform revenue across vendors and suppliers.
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs font-mono text-muted-foreground border border-border/50">
              Formula: Total Revenue = Service Tax + Product Tax/GST + Product Platform Fee + Service Platform Fees + Subscription Amount + SMS Amount
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <RevenueReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
