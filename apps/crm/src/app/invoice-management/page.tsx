"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Label } from "@repo/ui/label";
import { Search, Calendar, User, Package, Scissors, Eye, Download, Trash2 } from "lucide-react";
import { Pagination } from "@repo/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import AppointmentInvoice from "@/components/AppointmentInvoice";
import InvoiceUI from "@/components/InvoiceUI";
import { toast } from 'sonner';
import { useGetBillingRecordsQuery, useGetVendorProfileQuery, useDeleteBillingMutation, useGetAppointmentsQuery } from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Dynamically import html2pdf to avoid SSR issues
let html2pdf: any;
if (typeof window !== 'undefined') {
  const lib = require('html2pdf.js');
  html2pdf = lib.default || lib;
}

// Billing interface
interface BillingItem {
  itemId: string;
  itemType: 'Service' | 'Product';
  name: string;
  description: string;
  category: {
    categoryId: string;
    categoryName: string;
  };
  categoryId: string;
  categoryName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  duration?: number;
  stock?: number;
  discount?: number;
  discountType?: 'flat' | 'percentage';
  staffMember?: {
    id: string;
    name: string;
  };
  id: string;
}

interface ClientInfo {
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address: string;
}

interface Billing {
  _id: string;
  vendorId: string;
  invoiceNumber: string;
  clientId: string;
  clientInfo: ClientInfo;
  items: BillingItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  balance: number;
  paymentMethod: string;
  paymentStatus: string;
  billingType: string;
  createdAt: string;
  updatedAt: string;
}

// InvoiceData interface
interface InvoiceData {
  invoiceNumber: string | number;
  date: string;
  time: string;
  client: any;
  status: string;
  items: any[];
  subtotal: number;
  originalSubtotal?: number;
  discount?: number;
  tax: number;
  platformFee: number;
  total: number;
  balance: number;
  paymentMethod: string | null;
}

export default function InvoiceManagementPage() {
  const { user } = useCrmAuth();
  const VENDOR_ID = user?._id || "";

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
    skip: !VENDOR_ID
  });

  // Fetch vendor profile
  const { data: vendorProfile } = useGetVendorProfileQuery(undefined, {
    skip: !VENDOR_ID
  });

  // Debug vendor profile
  useEffect(() => {
    if (vendorProfile) {
      console.log('Vendor Profile Data:', vendorProfile);
      console.log('Salon Name:', vendorProfile?.data?.salonName);
      console.log('Name:', vendorProfile?.data?.name);
    }
  }, [vendorProfile]);

  const VENDOR_NAME = vendorProfile?.data?.name || "Salon";
  const vendorName = vendorProfile?.data?.salonName ||
    vendorProfile?.data?.name ||
    vendorProfile?.data?.businessName ||
    vendorProfile?.name ||
    "Salon Name";

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Delete billing mutation
  const [deleteBilling] = useDeleteBillingMutation();

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
      filtered.sort((a: any, b : any) => {
        const invoiceA = a.invoiceNumber || '';
        const invoiceB = b.invoiceNumber || '';
        return invoiceB.localeCompare(invoiceA, undefined, { numeric: true, sensitivity: 'base' });
      });

      setAppointments(filtered);
    }
  }, [appointmentsData, searchTerm, startDate, endDate]);

  // Get unique clients for the client filter dropdown
  const uniqueClients: ClientInfo[] = billingsData?.data ?
    Array.from(
      new Map(
        billingsData.data
          .filter((b: Billing) => b.clientInfo)
          .map((b: Billing) => [b.clientId, b.clientInfo])
      ).values()
    ) as ClientInfo[] : [];

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

  // Get item type for display
  const getItemTypeDisplay = (itemType: 'Service' | 'Product') => {
    return itemType === 'Service' ? (
      <span className="inline-flex items-center text-blue-600">
        <Scissors className="w-4 h-4 mr-1" />
        Service
      </span>
    ) : (
      <span className="inline-flex items-center text-green-600">
        <Package className="w-4 h-4 mr-1" />
        Product
      </span>
    );
  };

  // Format date (show only date without time)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

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

  // Delete billing record
  const deleteBillingRecord = async (billing: Billing) => {
    try {
      if (confirm(`Are you sure you want to delete invoice ${billing.invoiceNumber}?`)) {
        await deleteBilling(billing._id).unwrap();
        toast.success(`Invoice ${billing.invoiceNumber} deleted successfully`);
        refetch();
      }
    } catch (error: any) {
      toast.error("Failed to delete invoice");
      console.error("Delete error:", error);
    }
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

  // Prepare invoice data for InvoiceUI component
  const prepareInvoiceData = (billing: Billing): InvoiceData => {
    // Use the original invoice number as is
    const invoiceNumber = billing.invoiceNumber;

    // Create a new object with the correct types
    const invoiceData: InvoiceData = {
      invoiceNumber: invoiceNumber, // Keep as string to preserve original value
      date: new Date(billing.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date(billing.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      client: billing.clientInfo,
      status: billing.paymentStatus,
      items: billing.items,
      subtotal: billing.subtotal,
      originalSubtotal: billing.subtotal,
      discount: billing.items.reduce((total, item) => {
        if (item.discount) {
          if (item.discountType === 'percentage') {
            return total + (item.price * item.quantity * item.discount / 100);
          } else {
            return total + item.discount;
          }
        }
        return total;
      }, 0),
      tax: billing.taxAmount,
      platformFee: billing.platformFee,
      total: billing.totalAmount,
      balance: billing.balance,
      paymentMethod: billing.paymentMethod
    };

    return invoiceData;
  };

  // Prepare appointment invoice data for AppointmentInvoice component
  const prepareAppointmentInvoiceData = (appointment: any): any => {
    return {
      invoiceNumber: appointment.invoiceNumber || "N/A",
      date: new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: appointment.startTime || "",
      client: {
        fullName: appointment.clientName || appointment.client?.fullName || "N/A",
        phone: appointment.clientPhone || appointment.client?.phone || "",
        email: appointment.clientEmail || appointment.client?.email || "",
      },
      status: appointment.status,
      items: [
        ...(appointment.serviceItems || []).map((item: any) => ({
          name: item.serviceName,
          price: item.amount,
          quantity: 1,
          totalPrice: item.amount,
          type: 'service'
        })),
        ...(appointment.addOns || []).map((addon: any) => ({
          name: addon.name,
          price: addon.price,
          quantity: 1,
          totalPrice: addon.price,
          type: 'addon'
        }))
      ],
      subtotal: appointment.amount || appointment.totalAmount,
      originalSubtotal: appointment.totalAmount,
      discount: appointment.discountAmount || 0,
      tax: appointment.serviceTax || 0,
      platformFee: appointment.platformFee || 0,
      total: appointment.finalAmount || appointment.totalAmount,
      balance: appointment.amountRemaining || 0,
      paymentMethod: appointment.paymentMethod || "N/A",
      couponCode: appointment.couponCode
    };
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Track and manage all your invoices in one place
          </p>
        </div>

        {/* Summary Stats - Combined Billing & Appointments */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billings.length + appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {billings.length} billing + {appointments.length} appointments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(
                  billings.reduce((sum, billing) => sum + billing.totalAmount, 0) +
                  appointments.reduce((sum, app) => sum + (app.finalAmount || app.totalAmount || 0), 0)
                ).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From all transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billings.filter((b: Billing) => b.items.some((i: BillingItem) => i.itemType === 'Service')).length +
                  appointments.length}
              </div>
              <p className="text-xs text-muted-foreground">Service transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billings.filter((b: Billing) => b.items.some((i: BillingItem) => i.itemType === 'Product')).length}
              </div>
              <p className="text-xs text-muted-foreground">Product transactions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="billing">Counter Billing ({billings.length})</TabsTrigger>
            <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {activeTab === "billing" ? "Billing Records" : "Appointment Invoices"}
                </CardTitle>
                <CardDescription className="text-base">
                  {activeTab === "billing"
                    ? "Filter billing records by various criteria"
                    : "Filter appointment invoices by various criteria"}
                </CardDescription>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search invoices, clients..."
                    className="w-full lg:w-80 pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="All Payment Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Methods</SelectItem>
                    {paymentMethodsIncludingDefaults.map((method: string) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeTab === 'billing' && (
                  <Select value={selectedItemType} onValueChange={(value) => setSelectedItemType(value as any)}>
                    <SelectTrigger className="w-full lg:w-[200px]">
                      <SelectValue placeholder="All Item Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Item Types</SelectItem>
                      <SelectItem value="Service">
                        <div className="flex items-center">
                          <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                          Services
                        </div>
                      </SelectItem>
                      <SelectItem value="Product">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-green-600" />
                          Products
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {/* Date Range Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    placeholder="Start Date"
                    className="w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    placeholder="End Date"
                    className="w-full"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <Button variant="outline" onClick={clearDateFilters} className="self-end mb-1">
                  Clear Dates
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="billing">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto rounded-2xl border border-border/50">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                        <TableRow className="border-border/50">
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentBillings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              <div>No billing records found</div>
                              <div className="text-sm mt-1">Try adjusting your filters</div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentBillings.map((billing: Billing) => (
                            <TableRow key={billing._id}>
                              <TableCell>
                                <div className="font-medium">{billing.invoiceNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                  {billing.billingType}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  {formatDate(billing.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{billing.clientInfo.fullName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {billing.clientInfo.phone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {billing.items.slice(0, 2).map((item: BillingItem, index: number) => (
                                    <div key={index} className="text-sm flex items-center">
                                      <span className="inline-flex items-center text-sm">
                                        {getItemTypeDisplay(item.itemType)}
                                      </span>
                                      <span className="ml-1">: {item.name}</span>
                                      <span className="ml-2 text-sm">(x{item.quantity})</span>
                                    </div>
                                  ))}
                                  {billing.items.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{billing.items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">{formatCurrency(billing.totalAmount)}</div>
                                <div className="text-sm text-muted-foreground">
                                  Paid by {billing.paymentMethod}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewInvoice(billing)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadInvoice(billing)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentBillings.map((billing: Billing, index) => (
                    <Card
                      key={billing._id}
                      className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-0">
                        {/* Card Header */}
                        <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-sm font-bold text-primary">{billing.invoiceNumber}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(billing.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-2 py-1 rounded-full text-xs font-medium">
                              {billing.paymentStatus}
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-4">
                          {/* Client Info */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="font-medium">{billing.clientInfo.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {billing.clientInfo.email}
                              </p>
                            </div>
                          </div>

                          {/* Items and Price */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Items:</span>
                              <span>{billing.items.length}</span>
                            </div>
                            {/* Display individual items */}
                            <div className="space-y-1">
                              {billing.items.slice(0, 2).map((item: BillingItem, index: number) => (
                                <div key={index} className="text-sm flex items-center">
                                  <span className="inline-flex items-center text-sm">
                                    {getItemTypeDisplay(item.itemType)}
                                  </span>
                                  <span className="ml-1">: {item.name}</span>
                                  <span className="ml-2 text-sm">(x{item.quantity})</span>
                                </div>
                              ))}
                              {billing.items.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{billing.items.length - 2} more items
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Payment Status:</span>
                              <span>{billing.paymentStatus}</span>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-border/20">
                            <div>
                              <p className="text-xl font-bold text-primary">₹{billing.totalAmount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Total Amount</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewInvoice(billing)}
                                className="rounded-lg"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadInvoice(billing)}
                                className="rounded-lg"
                              >
                                <Download className="mr-1 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="appointments">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto rounded-2xl border border-border/50">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                        <TableRow className="border-border/50">
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              <div>No appointment invoices found</div>
                              <div className="text-sm mt-1">Try adjusting your filters</div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentAppointments.map((app: any) => (
                            <TableRow key={app._id}>
                              <TableCell>
                                <div className="font-medium">{app.invoiceNumber || "N/A"}</div>
                                <div className="text-xs text-muted-foreground uppercase">
                                  {app.status}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  {formatDate(app.date)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {app.startTime}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{app.clientName || app.client?.fullName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {app.clientPhone || app.client?.phone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {app.serviceItems && app.serviceItems.length > 0 ? (
                                    <>
                                      {app.serviceItems.slice(0, 2).map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm flex items-center">
                                          <Scissors className="w-4 h-4 mr-1 text-blue-600" />
                                          {item.serviceName}
                                        </div>
                                      ))}
                                      {app.serviceItems.length > 2 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{app.serviceItems.length - 2} more services
                                        </div>
                                      )}
                                    </>
                                  ) : app.serviceName ? (
                                    <div className="text-sm flex items-center">
                                      <Scissors className="w-4 h-4 mr-1 text-blue-600" />
                                      {app.serviceName}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">No services</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">{formatCurrency(app.finalAmount || app.totalAmount)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {app.paymentMethod}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewAppointmentInvoice(app)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadAppointmentInvoice(app)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentAppointments.map((app: any, index: number) => (
                    <Card
                      key={app._id}
                      className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-sm font-bold text-primary">{app.invoiceNumber || "N/A"}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(app.date).toLocaleDateString()} | {app.startTime}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-2 py-1 rounded-full text-xs font-medium uppercase">
                              {app.status}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="flex-1">
                            <p className="font-medium">{app.clientName || app.client?.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {app.clientPhone || app.client?.phone}
                            </p>
                          </div>

                          <div className="space-y-1">
                            {app.serviceItems && app.serviceItems.length > 0 ? (
                              <>
                                {app.serviceItems.slice(0, 2).map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm flex items-center">
                                    <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                                    {item.serviceName}
                                  </div>
                                ))}
                                {app.serviceItems.length > 2 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    +{app.serviceItems.length - 2} more
                                  </div>
                                )}
                              </>
                            ) : app.serviceName ? (
                              <div className="text-sm flex items-center">
                                <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                                {app.serviceName}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">No services</div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border/20">
                            <div>
                              <p className="text-xl font-bold text-primary">₹{(app.finalAmount || app.totalAmount).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Total Amount</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewAppointmentInvoice(app)}
                                className="rounded-lg"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadAppointmentInvoice(app)}
                                className="rounded-lg"
                              >
                                <Download className="mr-1 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {listToPaginate.length > 0 && (
              <Pagination
                className="mt-8"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={listToPaginate.length}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Invoice Details</h3>
              <button
                onClick={closeInvoiceModal}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
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
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => downloadInvoice(selectedBilling)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={closeInvoiceModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Invoice Modal */}
      {isAppointmentModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Appointment Invoice Details</h3>
              <button
                onClick={closeAppointmentModal}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              <div id="appointment-invoice-content">
                <AppointmentInvoice
                  invoiceData={prepareAppointmentInvoiceData(selectedAppointment)}
                  vendorName={vendorName}
                  vendorProfile={vendorProfile}
                  taxRate={selectedAppointment.taxRate || 0}
                  isOrderSaved={true}
                  onEmailClick={() => { }}
                  onRebookClick={() => { }}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => downloadAppointmentInvoice(selectedAppointment)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={closeAppointmentModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF generation area */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {selectedBilling && (
          <div id="invoice-to-pdf">
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
          </div>
        )}
        {selectedAppointment && (
          <div id="appointment-invoice-to-pdf">
            <AppointmentInvoice
              invoiceData={prepareAppointmentInvoiceData(selectedAppointment)}
              vendorName={vendorName}
              vendorProfile={vendorProfile}
              taxRate={selectedAppointment.taxRate || 0}
              isOrderSaved={true}
              onEmailClick={() => { }}
              onRebookClick={() => { }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
