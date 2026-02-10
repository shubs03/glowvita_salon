"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { VendorPayoutSettlementReportProductTable } from '../tables';

interface VendorPayoutSettlementReportProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorPayoutSettlementReportProductDialog = ({ isOpen, onClose }: VendorPayoutSettlementReportProductDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Payout Settlement Report - Product</DialogTitle>
          <DialogDescription>
            Amount admin pays to vendor for products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <VendorPayoutSettlementReportProductTable />
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
