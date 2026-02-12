"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { TotalBookingsReportTable } from '../tables';

interface TotalBookingsReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TotalBookingsReportDialog = ({ isOpen, onClose }: TotalBookingsReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Total Bookings Report</DialogTitle>
          <DialogDescription>
            Overview of all bookings across vendors.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <TotalBookingsReportTable />
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
