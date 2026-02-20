"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import AppointmentInvoice from "@/components/AppointmentInvoice";
import InvoiceUI from "@/components/InvoiceUI";
import { toast } from 'sonner';
import { useGetBillingRecordsQuery, useGetVendorProfileQuery, useGetAppointmentsQuery, useGetCurrentSupplierProfileQuery } from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Import components
import InvoiceHeader from "./components/InvoiceHeader";
import SummaryStats from "./components/SummaryStats";
import InvoiceFiltersToolbar from "./components/InvoiceFiltersToolbar";
import InvoicePaginationControls from "./components/InvoicePaginationControls";
import BillingTable from "./components/BillingTable";
import AppointmentTable from "./components/AppointmentTable";
import InvoiceModal from "./components/InvoiceModal";

// Import types and utils
import { Billing } from "./components/types";
import { prepareInvoiceData, prepareAppointmentInvoiceData } from "./components/utils";

// Dynamically import html2pdf to avoid SSR issues
let html2pdf: any;
if (typeof window !== 'undefined') {
  const lib = require('html2pdf.js');
  html2pdf = lib.default || lib;
}

export default function InvoiceManagementPage() {
  const { user, role: authRole } = useCrmAuth();
  const VENDOR_ID = user?._id || "";
  const userRole = (authRole || user?.role || "").toLowerCase();
  const isSupplier = userRole === 'supplier';

  // States
  const [billings, setBillings] = useState<Billing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedItemType, setSelectedItemType] = useState<'all' | 'Service' | 'Product'>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("billing");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Fetch billings
  const { data: billingsData, isLoading, isError, refetch } = useGetBillingRecordsQuery(
    { vendorId: VENDOR_ID },
    { skip: !VENDOR_ID }
  );

  // Fetch appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading, refetch: refetchAppointments } = useGetAppointmentsQuery(undefined, {
    skip: !VENDOR_ID || isSupplier
  });

  // Fetch vendor profile

  const { data: vendorProfile } = useGetVendorProfileQuery(undefined, {
    skip: !VENDOR_ID || isSupplier
  });

  const { data: supplierProfile } = useGetCurrentSupplierProfileQuery(undefined, {
    skip: !VENDOR_ID || !isSupplier
  });

  // Use the appropriate profile based on role
  const currentProfile = isSupplier ? supplierProfile : vendorProfile;

  // Debug profile
  useEffect(() => {
    if (currentProfile) {
      console.log('Current Profile Data:', currentProfile);
    }
  }, [currentProfile]);

  const VENDOR_NAME = isSupplier
    ? (supplierProfile?.data?.shopName || "Supplier")
    : (vendorProfile?.data?.name || "Salon");

  const vendorName = isSupplier
    ? (supplierProfile?.data?.shopName || "Your Supplier Business")
    : (vendorProfile?.data?.salonName ||
      vendorProfile?.data?.name ||
      vendorProfile?.data?.businessName ||
      vendorProfile?.name ||
      "Salon Name");

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Filter billings based on search criteria
  useEffect(() => {
    if (billingsData?.data) {
      let filtered = [...billingsData.data];

      if (searchTerm) {
        filtered = filtered.filter((billing: Billing) =>
          billing.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.clientInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (selectedPaymentMethod !== "all") {
        filtered = filtered.filter((billing: Billing) => billing.paymentMethod === selectedPaymentMethod);
      }

      if (selectedItemType !== "all") {
        filtered = filtered.filter((billing: Billing) =>
          billing.items.some(item => item.itemType === selectedItemType)
        );
      }

      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        filtered = filtered.filter((billing: Billing) => new Date(billing.createdAt) >= startDateObj);
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filtered = filtered.filter((billing: Billing) => new Date(billing.createdAt) <= endDateObj);
      }

      // Sort by date descending
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setBillings(filtered);
    }
  }, [billingsData, searchTerm, selectedPaymentMethod, selectedItemType, startDate, endDate]);

  // Filter appointments based on search criteria
  useEffect(() => {
    if (appointmentsData) {
      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.data || []);

      let filtered = appointmentsList.filter((app: any) =>
        (app.status === "completed" || app.status === "partially-completed" || app.status === "confirmed")
      );

      if (searchTerm) {
        filtered = filtered.filter((app: any) =>
          (app.clientName || app.client?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        filtered = filtered.filter((app: any) =>
          new Date(app.date) >= startDateObj
        );
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filtered = filtered.filter((app: any) =>
          new Date(app.date) <= endDateObj
        );
      }

      // Sort by invoice number descending (newest/highest invoice number first)
      filtered.sort((a: any, b: any) => {
        const invoiceA = a.invoiceNumber || '';
        const invoiceB = b.invoiceNumber || '';
        return invoiceB.localeCompare(invoiceA, undefined, { numeric: true, sensitivity: 'base' });
      });

      setAppointments(filtered);
    }
  }, [appointmentsData, searchTerm, startDate, endDate]);

  // Get unique payment methods for the payment method filter dropdown
  const uniquePaymentMethods: string[] = billingsData?.data ?
    billingsData.data
      .filter((b: Billing) => b.paymentMethod)
      .map((b: Billing) => b.paymentMethod)
      .filter((method: string, index: number, self: string[]) => self.indexOf(method) === index) : [];

  // Ensure "Net Banking" is always available as an option
  const paymentMethodsIncludingDefaults = uniquePaymentMethods.includes("Net Banking")
    ? uniquePaymentMethods
    : [...uniquePaymentMethods, "Net Banking"];

  // View invoice
  const viewInvoice = (billing: Billing) => {
    setSelectedBilling(billing);
    setIsInvoiceModalOpen(true);
  };

  // View appointment invoice
  const viewAppointmentInvoice = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Download invoice
  const downloadInvoice = async (billing: Billing) => {
    setSelectedBilling(billing);

    // Tiny delay to allow React to render the hidden div
    setTimeout(async () => {
      try {
        const invoiceData = prepareInvoiceData(billing);
        const invoiceElement = document.getElementById('invoice-to-pdf');

        if (invoiceElement) {
          const invoiceNumberStr = invoiceData.invoiceNumber.toString();
          const pdfOptions = {
            margin: 5,
            filename: `Invoice_${invoiceNumberStr}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.8 },
            html2canvas: { scale: 1.5, useCORS: true },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          try {
            await html2pdf().set(pdfOptions).from(invoiceElement).save();
            toast.success(`Invoice ${invoiceNumberStr} downloaded successfully`);
          } catch (error: any) {
            if (controller.signal.aborted) {
              toast.error('Download timed out. Please try again.');
            } else {
              toast.error('Failed to download invoice');
            }
            console.error('Download error:', error);
          } finally {
            clearTimeout(timeoutId);
          }
        } else {
          toast.error('Invoice element not found');
        }
      } catch (error: any) {
        toast.error(`Failed to download invoice ${billing.invoiceNumber}`);
        console.error('Download error:', error);
      }
    }, 100);
  };

  // Download appointment invoice
  const downloadAppointmentInvoice = async (appointment: any) => {
    setSelectedAppointment(appointment);

    // Tiny delay to allow React to render the hidden div
    setTimeout(async () => {
      try {
        const invoiceData = prepareAppointmentInvoiceData(appointment);
        const invoiceElement = document.getElementById('appointment-invoice-to-pdf');

        if (invoiceElement) {
          const invoiceNumberStr = invoiceData.invoiceNumber.toString();
          const pdfOptions = {
            margin: 5,
            filename: `Invoice_${invoiceNumberStr}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.8 },
            html2canvas: { scale: 1.5, useCORS: true },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          try {
            await html2pdf().set(pdfOptions).from(invoiceElement).save();
            toast.success(`Invoice ${invoiceNumberStr} downloaded successfully`);
          } catch (error: any) {
            if (controller.signal.aborted) {
              toast.error('Download timed out. Please try again.');
            } else {
              toast.error('Failed to download invoice');
            }
          } finally {
            clearTimeout(timeoutId);
          }
        } else {
          toast.error('Invoice element not found');
        }
      } catch (error: any) {
        toast.error(`Failed to download invoice ${appointment.invoiceNumber}`);
      }
    }, 100);
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSelectedBilling(null);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Pagination
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;

  const currentBillings = billings.slice(firstItemIndex, lastItemIndex);
  const currentAppointments = appointments.slice(firstItemIndex, lastItemIndex);

  const listToPaginate = activeTab === "billing" ? billings : appointments;
  const totalPages = Math.ceil(listToPaginate.length / itemsPerPage);

  if (isLoading || isAppointmentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>Error loading billing data. Please try again later.</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <InvoiceHeader />

        {/* Summary Stats - Combined Billing & Appointments */}
        <SummaryStats billings={billings} appointments={appointments} activeTab={activeTab} isSupplier={isSupplier} />

        <div className="">
          <div className="">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <InvoiceFiltersToolbar
                searchTerm={searchTerm}
                selectedPaymentMethod={selectedPaymentMethod}
                selectedItemType={selectedItemType}
                startDate={startDate}
                endDate={endDate}
                onSearchChange={setSearchTerm}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onItemTypeChange={setSelectedItemType}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClearDateFilters={clearDateFilters}
                paymentMethods={paymentMethodsIncludingDefaults}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                exportData={activeTab === 'billing' ? billings : appointments}
                isSupplier={isSupplier}
              />

              <div className="mt-6">
                <TabsContent value="billing" className="mt-0">
                  <BillingTable
                    billings={currentBillings}
                    onViewInvoice={viewInvoice}
                    onDownloadInvoice={downloadInvoice}
                  />
                </TabsContent>

                <TabsContent value="appointments" className="mt-0">
                  <AppointmentTable
                    appointments={currentAppointments}
                    onViewInvoice={viewAppointmentInvoice}
                    onDownloadInvoice={downloadAppointmentInvoice}
                  />
                </TabsContent>
              </div>

              {/* Pagination */}
              {listToPaginate.length > 0 && (
                <InvoicePaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={listToPaginate.length}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                />
              )}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Invoice Modal - handles both billing and appointment invoices */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen || isAppointmentModalOpen}
        onClose={() => {
          closeInvoiceModal();
          closeAppointmentModal();
        }}
        selectedBilling={selectedBilling}
        selectedAppointment={selectedAppointment}
        vendorName={vendorName}
        vendorProfile={currentProfile}
        onDownloadBilling={downloadInvoice}
        onDownloadAppointment={downloadAppointmentInvoice}
      />

      {/* Hidden PDF generation area */}
      <div className="print-area-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {selectedBilling && (
          <div id="invoice-to-pdf">
            <InvoiceUI
              invoiceData={prepareInvoiceData(selectedBilling)}
              vendorName={vendorName}
              vendorProfile={currentProfile}
              taxRate={selectedBilling.taxRate}
              isOrderSaved={selectedBilling.paymentStatus === "Paid"}
              onEmailClick={() => { }}
              onPrintClick={() => { }}
              onDownloadClick={() => { }}
              onRebookClick={() => { }}
            />
          </div>
        )}
        {selectedAppointment && (
          <div id="appointment-invoice-to-pdf">
            <AppointmentInvoice
              invoiceData={prepareAppointmentInvoiceData(selectedAppointment)}
              vendorName={vendorName}
              vendorProfile={currentProfile}
              taxRate={selectedAppointment.taxRate || 0}
              isOrderSaved={true}
              onEmailClick={() => { }}
              onRebookClick={() => { }}
            />
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden !important;
          }
          
          /* Only show the printable invoice section and its children */
          #invoice-to-pdf,
          #invoice-to-pdf *,
          #appointment-invoice-to-pdf,
          #appointment-invoice-to-pdf * {
            visibility: visible !important;
          }
          
          /* Ensure the printable section is positioned at the top left and fills the page */
          #invoice-to-pdf,
          #appointment-invoice-to-pdf {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 5mm !important;
            background: white !important;
            z-index: 2147483647 !important;
          }

          /* Hide UI elements that shouldn't be printed */
          .print\:hidden {
            display: none !important;
          }

          @page {
            margin: 0;
            size: auto;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
