"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { ConsolidatedSalesReportTable } from '../tables';

interface ConsolidatedSalesReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsolidatedSalesReportDialog = ({ isOpen, onClose }: ConsolidatedSalesReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consolidated Sales Report</DialogTitle>
          <DialogDescription>
            Complete overview of total platform revenue across vendors and suppliers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <ConsolidatedSalesReportTable />
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
