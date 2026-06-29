"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { SubscriptionReportTable } from '../tables';

interface SubscriptionReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionReportDialog = ({ isOpen, onClose }: SubscriptionReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Subscription Report</DialogTitle>
          <DialogDescription>
            Track purchases, renewals, expiries, and overall subscription revenue.
            <div className="mt-2 space-y-1 p-2 bg-muted/50 rounded-md text-xs font-mono text-muted-foreground border border-border/50">
              <div>Formula: Revenue = SUM(price) of ALL paid plans in history (Active + Scheduled + Expired)</div>
              <div>Active Plans = Currently running subscriptions</div>
              <div>Scheduled Plans = Future purchased subscriptions</div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SubscriptionReportTable />
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
