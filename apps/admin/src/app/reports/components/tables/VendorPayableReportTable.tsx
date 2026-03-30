"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, Users, UserPlus, ShoppingCart, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { useGetVendorPayableReportQuery } from '@repo/store/api';
import { SubscriptionData, CampaignData, VendorPayoutSettlementData, VendorPayoutSettlementProductData, VendorPayableProductData, VendorPayableSettlementData, FilterParams } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';
import { FilterModal } from '../common';
import { useReport } from '../hooks/useReport';

export const VendorPayableReportTable = () => {
  const {
    filters,
    isFilterModalOpen,
    currentPage,
    itemsPerPage,
    searchTerm,
    tableRef,
    setFilters,
    setIsFilterModalOpen,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    handleFilterChange,
    filterAndPaginateData,
    apiFilters
  } = useReport<VendorPayableSettlementData>(5);

  // Use the API hook to fetch vendor payable report data with filters
  // apiFilters is derived from filters + selectedRegion in useReport

  console.log("Vendor Payable Report API filters:", apiFilters);

  // Import the vendor payable report API hook to use for Vendor Payable data
  const { data, isLoading, isError, error } = useGetVendorPayableReportQuery(apiFilters);

  // Define data variables after API call
  const salesData = data?.vendorPayableReport || [];
  const cities = data?.cities || []; // Get cities from the data
  const vendorNames = data?.vendorNames || []; // Get vendor names from API response
  const aggregatedTotals = data?.aggregatedTotals;

  // Use the vendor list for filter options
  const businessNames = vendorNames;

  // Format the data to match Vendor Payable structure
  // No local mapping needed now as API returns matching names
  const VendorPayableData = salesData;

  // Filter and paginate data using the common hook
  const {
    filteredData,
    paginatedData,
    totalItems,
    totalPages,
    startIndex,
    endIndex
  } = filterAndPaginateData(
    VendorPayableData,
    (item: any) => [
      item["Payee Type"] || '',
      item["Payee Name"] || '',
      `${item["Service Gross Amount"] || 0}`,
      `${item["Service Platform Fee"] || 0}`,
      `${item["Service Tax (₹)"] || 0}`,
      `${item["Total"] || 0}`,
      `${item["Actually Collected"] || 0}`,
      `${item["Pending Amount"] || 0}`
    ]
  );

  if (isLoading) {
    return (
      <div>
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
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
                <TableHead>Payee Type</TableHead>
                <TableHead>Payee Name</TableHead>
                <TableHead>Service Gross Amount</TableHead>
                <TableHead>Service Platform Fee</TableHead>
                <TableHead>Service Tax</TableHead>
                <TableHead>Total Payable</TableHead>
                <TableHead>Actually Collected</TableHead>
                <TableHead>Pending</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching Vendor Payable report:", error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading Vendor Payable report data. Please try again later.
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
  if (VendorPayableData.length === 0) {
    return (
      <div>
        {/* Summary Card for Vendor Payable - show with 0 values when no data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Total Service Amount (Gross)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-lg font-bold">₹0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Total Payable (Accrued)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-lg font-bold">₹0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Actually Collected</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-lg font-bold">₹0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Pending Collections</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-lg font-bold">₹0.00</div>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'admin_pays_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'admin_pays_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'admin_pays_report')}>
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
          vendors={businessNames}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={false}
          showBusinessNameFilter={false}
          showVendorFilter={true}
        />

        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payee Type</TableHead>
                <TableHead>Payee Name</TableHead>
                <TableHead>Service Gross Amount</TableHead>
                <TableHead>Service Platform Fee</TableHead>
                <TableHead>Service Tax</TableHead>
                <TableHead>Total Payable</TableHead>
                <TableHead>Actually Collected</TableHead>
                <TableHead>Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No Vendor Payable data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'admin_pays_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'admin_pays_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'admin_pays_report')}>
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
        vendors={businessNames}
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={false}
        showBusinessNameFilter={false}
        showVendorFilter={true}
      />

      {/* Summary Card for Vendor Payable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Total Service Amount (Gross)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-purple-600">
              ₹{aggregatedTotals?.totalAmount?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Total Payable (Accrued)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-lg font-bold">
              ₹{aggregatedTotals?.total?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-green-600">Actually Collected</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-green-700">
              ₹{aggregatedTotals?.totalCollected?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-red-600">Pending Collections</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-red-700">
              ₹{aggregatedTotals?.totalPending?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payee Type</TableHead>
              <TableHead>Payee Name</TableHead>
              <TableHead>Service Gross Amount</TableHead>
              <TableHead>Service Platform Fee</TableHead>
              <TableHead>Service Tax</TableHead>
              <TableHead>Total Payable</TableHead>
              <TableHead>Actually Collected</TableHead>
              <TableHead>Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{item["Payee Type"]}</TableCell>
                <TableCell>{item["Payee Name"]}</TableCell>
                <TableCell>₹{item["Service Gross Amount"]?.toFixed(2)}</TableCell>
                <TableCell>₹{item["Service Platform Fee"]?.toFixed(2)}</TableCell>
                <TableCell>₹{item["Service Tax (₹)"]?.toFixed(2)}</TableCell>
                <TableCell className="font-bold text-blue-700">₹{item["Total"]?.toFixed(2)}</TableCell>
                <TableCell className="text-green-700 font-medium">₹{item["Actually Collected"]?.toFixed(2) || 0}</TableCell>
                <TableCell className={`font-semibold ${(item["Pending Amount"] || 0) > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                  ₹{item["Pending Amount"]?.toFixed(2) || 0}
                </TableCell>
              </TableRow>
            ))}
            {/* Aggregated Totals Row */}
            {salesData.length > 0 && aggregatedTotals && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>₹{aggregatedTotals.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>₹{aggregatedTotals.platformFee?.toFixed(2)}</TableCell>
                <TableCell>₹{aggregatedTotals.serviceTax?.toFixed(2)}</TableCell>
                <TableCell>₹{aggregatedTotals.total?.toFixed(2)}</TableCell>
                <TableCell>₹{aggregatedTotals.totalCollected?.toFixed(2)}</TableCell>
                <TableCell>₹{aggregatedTotals.totalPending?.toFixed(2)}</TableCell>
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
