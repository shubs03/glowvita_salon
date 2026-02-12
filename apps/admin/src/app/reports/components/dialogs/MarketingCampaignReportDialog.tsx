"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { MarketingCampaignReportTable } from '../tables';

interface MarketingCampaignReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketingCampaignReportDialog = ({ isOpen, onClose }: MarketingCampaignReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Marketing Campaign Report</DialogTitle>
          <DialogDescription>
            Performance metrics for all marketing campaigns.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <MarketingCampaignReportTable />
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
