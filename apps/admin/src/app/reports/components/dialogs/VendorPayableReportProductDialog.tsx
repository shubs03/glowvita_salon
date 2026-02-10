"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { VendorPayableReportProductTable } from '../tables';

interface VendorPayableReportProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorPayableReportProductDialog = ({ isOpen, onClose }: VendorPayableReportProductDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Vendor Payable to Admin Report - Product</DialogTitle>
          <DialogDescription>
            Amount vendor pays to admin for products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <VendorPayableReportProductTable />
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
