"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Download, Printer } from "lucide-react";
import InvoiceUI from "@/components/InvoiceUI";
import AppointmentInvoice from "@/components/AppointmentInvoice";
import { Billing } from './types';
import { prepareInvoiceData, prepareAppointmentInvoiceData } from './utils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBilling: Billing | null;
  selectedAppointment: any | null;
  vendorName: string;
  vendorProfile: any;
  onDownloadBilling: (billing: Billing) => void;
  onDownloadAppointment: (appointment: any) => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  selectedBilling,
  selectedAppointment,
  vendorName,
  vendorProfile,
  onDownloadBilling,
  onDownloadAppointment
}: InvoiceModalProps) {
  const isBilling = !!selectedBilling;
  const isAppointment = !!selectedAppointment;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <style jsx>{`
          .modal-content::-webkit-scrollbar {
            display: none;
          }
          .modal-content {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <DialogHeader className="p-6 pb-4 bg-muted flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            {isBilling ? "Invoice Details" : "Appointment Invoice Details"}
          </DialogTitle>
          <DialogDescription>
            {isBilling && selectedBilling && `Invoice #${selectedBilling.invoiceNumber}`}
            {isAppointment && selectedAppointment && `Invoice #${selectedAppointment.invoiceNumber || "N/A"}`}
          </DialogDescription>
        </DialogHeader>
        <div className="modal-content overflow-y-auto flex-1 p-6 pt-4">
          {isBilling && selectedBilling && (
            <InvoiceUI
              invoiceData={prepareInvoiceData(selectedBilling)}
              vendorName={vendorName}
              vendorProfile={vendorProfile}
              taxRate={selectedBilling.taxRate}
              isOrderSaved={selectedBilling.paymentStatus === "Paid"}
              onEmailClick={() => { }}
              onPrintClick={() => { }}
              onDownloadClick={() => { }}
              onRebookClick={() => { }}
            />
          )}

          {isAppointment && selectedAppointment && (
            <AppointmentInvoice
              invoiceData={prepareAppointmentInvoiceData(selectedAppointment)}
              vendorName={vendorName}
              vendorProfile={vendorProfile}
              taxRate={selectedAppointment.taxRate || 0}
              isOrderSaved={true}
              onEmailClick={() => { }}
              onRebookClick={() => { }}
            />
          )}
        </div>

        <div className="p-6 pt-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {isBilling && selectedBilling && (
              <Button variant="outline" onClick={() => onDownloadBilling(selectedBilling)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {isAppointment && selectedAppointment && (
              <Button variant="outline" onClick={() => onDownloadAppointment(selectedAppointment)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
