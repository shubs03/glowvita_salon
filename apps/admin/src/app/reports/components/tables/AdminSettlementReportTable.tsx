"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, Users, UserPlus, ShoppingCart, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { useGetConsolidatedSalesReportQuery } from '@repo/store/api';
import { SubscriptionData, CampaignData, VendorPayoutSettlementData, VendorPayoutSettlementProductData, VendorPayableProductData, FilterParams } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';
import { FilterModal } from '../common';
import { useReport } from '../hooks/useReport';

export const AdminSettlementReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch consolidated sales report data with filters
  const apiFilters = filters;
  
  console.log("Admin Settlement Report API filters:", apiFilters);
  
  // Import the consolidated sales report API hook to use for admin settlement data
  const { data, isLoading, isError, error } = useGetConsolidatedSalesReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Admin Settlement Report filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Define data variables after API call
  const salesData = data?.salesReport || [];
  const cities = data?.cities || []; // Get cities from the data
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Store complete list of business names
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  
  // Extract business names from data when there are no filters applied
  // This assumes that when no filters are applied, we get the complete dataset
  useEffect(() => {
    // Only update the complete list if no filters are applied or if the list is empty
    if ((Object.keys(apiFilters).length === 0 || allBusinessNames.length === 0) && salesData.length > 0) {
      const nameMap: { [key: string]: boolean } = {};
      const names: string[] = [];
      
      salesData.forEach((item: any) => {
        const name = item['Business Name'];
        if (name && name !== 'N/A' && !nameMap[name]) {
          nameMap[name] = true;
          names.push(name);
        }
      });
      setAllBusinessNames(names);
    }
  }, [salesData, apiFilters, allBusinessNames.length]);
  
  // Use the complete list for filter options
  const businessNames = allBusinessNames;
  
  // Format the data to match Admin Settlement structure
  const adminSettlementData = salesData.map((item: any) => {
    // Extract numeric values from the formatted strings
    const servicePlatformFee = item["Service Platform Fees (₹)"] !== '-' ? parseFloat(item["Service Platform Fees (₹)"].replace(/[₹,]/g, '')) || 0 : 0;
    const productPlatformFee = parseFloat(item["Product Platform Fee (₹)"].replace(/[₹,]/g, '')) || 0;
    const serviceTax = parseFloat(item["Service Tax (₹)"].replace(/[₹,]/g, '')) || 0;
    const productTax = parseFloat(item["Product Tax/GST (₹)"].replace(/[₹,]/g, '')) || 0;
    const subscriptionAmount = parseFloat(item["Subscription Amount (₹)"].replace(/[₹,]/g, '')) || 0;
    const smsAmount = parseFloat(item["SMS Amount (₹)"].replace(/[₹,]/g, '')) || 0;
    
    // Calculate total IN (Vendor Payout)
    const totalIn = servicePlatformFee + productPlatformFee + serviceTax + productTax + subscriptionAmount + smsAmount;
    
    // Calculate vendor/supplier payables (Vendor Payable out)
    const serviceGrossAmount = parseFloat(item["Total Service Amount (₹)"].replace(/[₹,]/g, '')) || 0;
    const productGrossAmount = parseFloat(item["Total Product Amount (₹)"].replace(/[₹,]/g, '')) || 0;
    
    // Calculate platform fees for vendor/supplier payables
    const servicePlatformFeeForPayout = item.Type.toLowerCase() === 'vendor' ? servicePlatformFee : 0;
    const productPlatformFeeForPayout = productPlatformFee;
    
    // Calculate GST for vendor/supplier payables
    const serviceGst = item.Type.toLowerCase() === 'vendor' ? servicePlatformFeeForPayout * 0.18 : 0;
    const productGst = productPlatformFeeForPayout * 0.18;
    
    // Calculate vendor payable (only for vendors)
    const vendorPayable = item.Type.toLowerCase() === 'vendor' ? 
      (serviceGrossAmount - servicePlatformFeeForPayout - serviceGst) + 
      (productGrossAmount - productPlatformFeeForPayout - productGst) : 0;
    
    // Calculate supplier payable (only for suppliers)
    const supplierPayable = item.Type.toLowerCase() === 'supplier' ? 
      (productGrossAmount - productPlatformFeeForPayout - productGst) : 0;
    
    // Calculate total OUT (vendor + supplier payables)
    const totalOut = vendorPayable + supplierPayable;
    
    // Calculate net balance (IN - OUT)
    const netBalance = totalIn - totalOut;
    
    return {
      date: new Date().toISOString().split('T')[0], // Use current date as placeholder since API doesn't provide specific dates
      entity: item["Business Name"],
      servicePF: servicePlatformFee,
      productPF: productPlatformFee,
      subscription: subscriptionAmount,
      sms: smsAmount,
      totalIn,
      vendorPayable,
      supplierPayable,
      totalOut,
      netBalance
    };
  });
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return adminSettlementData;
    
    return adminSettlementData.filter((item: any) =>
      Object.values(item).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [adminSettlementData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div>
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Service PF (IN)</TableHead>
                <TableHead>Product PF (IN)</TableHead>
                <TableHead>Subscription (IN)</TableHead>
                <TableHead>SMS (IN)</TableHead>
                <TableHead>Total IN</TableHead>
                <TableHead>Vendor Payable (OUT)</TableHead>
                <TableHead>Supplier Payable (OUT)</TableHead>
                <TableHead>Total OUT</TableHead>
                <TableHead>Net Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching admin settlement report:", error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading admin settlement report data. Please try again later.
        {/* Display error details in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-2 text-sm text-gray-500">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
      </div>
    );
  }
  
  // Show table structure even when there's no data
  if (adminSettlementData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendor Payout (IN)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendor Payable (OUT)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search term changes
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'admin_settlement_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'admin_settlement_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'admin_settlement_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(tableRef)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <FilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={cities}
          businessNames={businessNames}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Service PF (IN)</TableHead>
                <TableHead>Product PF (IN)</TableHead>
                <TableHead>Subscription (IN)</TableHead>
                <TableHead>SMS (IN)</TableHead>
                <TableHead>Total IN</TableHead>
                <TableHead>Vendor Payable (OUT)</TableHead>
                <TableHead>Supplier Payable (OUT)</TableHead>
                <TableHead>Total OUT</TableHead>
                <TableHead>Net Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  No admin settlement data available.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when search term changes
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'admin_settlement_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'admin_settlement_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'admin_settlement_report')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={cities}
        businessNames={businessNames}
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Payout (IN)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{adminSettlementData.reduce((sum: number, item: any) => sum + (item.totalIn || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Payable (OUT)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{adminSettlementData.reduce((sum: number, item: any) => sum + (item.totalOut || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{adminSettlementData.reduce((sum: number, item: any) => sum + (item.netBalance || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Service PF (IN)</TableHead>
              <TableHead>Product PF (IN)</TableHead>
              <TableHead>Subscription (IN)</TableHead>
              <TableHead>SMS (IN)</TableHead>
              <TableHead>Total IN</TableHead>
              <TableHead>Vendor Payable (OUT)</TableHead>
              <TableHead>Supplier Payable (OUT)</TableHead>
              <TableHead>Total OUT</TableHead>
              <TableHead>Net Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium">{item.entity}</TableCell>
                <TableCell>₹{item.servicePF.toFixed(2)}</TableCell>
                <TableCell>₹{item.productPF.toFixed(2)}</TableCell>
                <TableCell>₹{item.subscription.toFixed(2)}</TableCell>
                <TableCell>₹{item.sms.toFixed(2)}</TableCell>
                <TableCell>₹{item.totalIn.toFixed(2)}</TableCell>
                <TableCell>₹{item.vendorPayable.toFixed(2)}</TableCell>
                <TableCell>₹{item.supplierPayable.toFixed(2)}</TableCell>
                <TableCell>₹{item.totalOut.toFixed(2)}</TableCell>
                <TableCell>₹{item.netBalance.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.servicePF || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.productPF || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.subscription || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.sms || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.totalIn || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.vendorPayable || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.supplierPayable || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.totalOut || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.netBalance || 0), 0).toFixed(2)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        className="mt-4"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={totalItems}
      />
    </div>
  );
};
