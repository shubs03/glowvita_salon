"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { SellingServicesReportTable } from '../tables/SellingServicesReportTable';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';

interface SellingServicesReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellingServicesReportDialog = ({ isOpen, onClose }: SellingServicesReportDialogProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'selling_services_report';
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
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selling Services</DialogTitle>
          <DialogDescription>
            Overview of services sold and their performance metrics.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SellingServicesReportTable />
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
