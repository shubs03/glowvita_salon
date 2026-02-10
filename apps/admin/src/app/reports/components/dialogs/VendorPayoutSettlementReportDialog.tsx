"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { VendorPayoutSettlementReportTable } from '../tables';

interface VendorPayoutSettlementReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorPayoutSettlementReportDialog = ({ isOpen, onClose }: VendorPayoutSettlementReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Payout Settlement Report-service</DialogTitle>
          <DialogDescription>
            Amount admin pays to vendor for services.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <VendorPayoutSettlementReportTable />
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
