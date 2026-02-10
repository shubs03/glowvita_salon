"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { ReferralReportTable } from '../tables/ReferralReportTable';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';

interface ReferralReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralReportDialog = ({ isOpen, onClose }: ReferralReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'referral_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
        break;
      case 'copy':
        copyToClipboard(tableRef);
        break;
      case 'print':
        printTable(tableRef);
        break;
      default:
        break;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Referral Report</DialogTitle>
          <DialogDescription>
            Comprehensive report showing all referral activities including who referred whom and bonus amounts.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <ReferralReportTable />
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
