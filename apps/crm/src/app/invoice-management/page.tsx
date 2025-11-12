"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Label } from "@repo/ui/label";
import { Search, Calendar, User, Package, Scissors, Eye, Download, Trash2 } from "lucide-react";
import InvoiceUI from "@/components/InvoiceUI";
import { toast } from 'sonner';
import { useGetBillingRecordsQuery, useGetVendorProfileQuery, useDeleteBillingMutation } from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import html2pdf from 'html2pdf.js';
import { Pagination } from "@repo/ui/pagination";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedItemType, setSelectedItemType] = useState<"all" | "Service" | "Product">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billings, setBillings] = useState<Billing[]>([]);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Fetch billings
  const { data: billingsData, isLoading, isError, refetch } = useGetBillingRecordsQuery(
    { vendorId: VENDOR_ID },
    { skip: !VENDOR_ID }
  );
  
  // Fetch vendor profile
  const { data: vendorProfile } = useGetVendorProfileQuery(undefined, {
    skip: !VENDOR_ID
  });
  
  // Delete billing mutation
  const [deleteBilling] = useDeleteBillingMutation();
  
  // Get vendor name from profile
  const vendorName = vendorProfile?.data?.businessName || vendorProfile?.data?.shopName || "Your Salon";

  // Filter billings based on search criteria
  useEffect(() => {
    if (billingsData?.data) {
      let filtered: Billing[] = [...billingsData.data];
      
      // Apply search term filter (search in client name, invoice number)
      if (searchTerm) {
        filtered = filtered.filter((billing: Billing) => 
          billing.clientInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply payment method filter
      if (selectedPaymentMethod && selectedPaymentMethod !== "all") {
        filtered = filtered.filter((billing: Billing) => billing.paymentMethod === selectedPaymentMethod);
      }
      
      // Apply item type filter
      if (selectedItemType !== "all") {
        filtered = filtered.filter((billing: Billing) => 
          billing.items.some((item: BillingItem) => item.itemType === selectedItemType)
        );
      }
      
      // Apply date range filter
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0); // Set to start of day
        filtered = filtered.filter((billing: Billing) => 
          new Date(billing.createdAt) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // Set to end of day
        filtered = filtered.filter((billing: Billing) => 
          new Date(billing.createdAt) <= endDateObj
        );
      }
      
      setBillings(filtered);
    }
  }, [billingsData, searchTerm, selectedPaymentMethod, selectedItemType, startDate, endDate]);

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
      .filter((method, index, self) => self.indexOf(method) === index) : [];
  
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

  // Download invoice
  const downloadInvoice = async (billing: Billing) => {
    try {
      // Prepare invoice data
      const invoiceData = prepareInvoiceData(billing);
      
      // Generate PDF from InvoiceUI component
      const invoiceElement = document.getElementById('invoice-to-pdf');
      if (invoiceElement) {
        // Convert invoice number to string for filename
        const invoiceNumberStr = invoiceData.invoiceNumber.toString();
        
        const pdfOptions = {
          margin: 5,
          filename: `Invoice_${invoiceNumberStr}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.8 },
          html2canvas: { scale: 1.5, useCORS: true },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        // Generate and download PDF automatically with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
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
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSelectedBilling(null);
  };

  // Delete billing record
  const deleteBillingRecord = async (billing: Billing) => {
    try {
      await deleteBilling(billing._id).unwrap();
      toast.success(`Invoice ${billing.invoiceNumber} deleted successfully`);
      refetch(); // Refresh the data
    } catch (error: any) {
      toast.error(`Failed to delete invoice ${billing.invoiceNumber}`);
      console.error('Delete error:', error);
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
  const currentItems = billings.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(billings.length / itemsPerPage);

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

  if (isLoading) {
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

        {/* Billing Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billings.length}</div>
              <p className="text-xs text-muted-foreground">Overall billing records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{billings.reduce((sum, billing) => sum + billing.totalAmount, 0).toFixed(2)}
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
                {billings.filter((b: Billing) => b.items.some((i: BillingItem) => i.itemType === 'Service')).length}
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
        
        <Card className="backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <CardTitle className="text-2xl mb-2">
                  Billing Records
                </CardTitle>
                <CardDescription className="text-base">
                  Filter billing records by various criteria
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
            <>
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
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <div>No billing records found</div>
                            <div className="text-sm mt-1">Try adjusting your filters</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((billing: Billing) => (
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
                                  onClick={() => deleteBillingRecord(billing)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
                {currentItems.map((billing: Billing, index) => (
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
                              onClick={() => deleteBillingRecord(billing)}
                              className="rounded-lg"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {billings.length > 0 && (
                <Pagination
                  className="mt-8"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={billings.length}
                />
              )}
            </>
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
                onEmailClick={() => {}}
                onPrintClick={() => {}}
                onDownloadClick={() => {}}
                onRebookClick={() => {}}
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
      
      {/* Hidden PDF generation area */}
      <div className="hidden">
        {selectedBilling && (
          <div id="invoice-to-pdf">
            <InvoiceUI
              invoiceData={prepareInvoiceData(selectedBilling)}
              vendorName={vendorName}
              vendorProfile={vendorProfile}
              taxRate={selectedBilling.taxRate}
              isOrderSaved={selectedBilling.paymentStatus === "Paid"}
              onEmailClick={() => {}}
              onPrintClick={() => {}}
              onDownloadClick={() => {}}
              onRebookClick={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
