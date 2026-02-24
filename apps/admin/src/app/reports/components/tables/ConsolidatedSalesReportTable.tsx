"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Download, IndianRupee, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { Pagination } from "@repo/ui/pagination";
import { useGetConsolidatedSalesReportQuery } from '@repo/store/api';
import { useReport } from '../hooks/useReport';
import { FilterModal } from '../common/FilterModal';
import { FilterParams } from '../types';
import { copyToClipboard, exportToExcel, exportToCSV, exportToPDF, printTable } from '../utils/exportFunctions';

export const ConsolidatedSalesReportTable = () => {
  const {
    apiFilters,
    filters,
    handleFilterChange,
    isFilterModalOpen,
    setIsFilterModalOpen,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    tableRef,
    filterAndPaginateData
  } = useReport();

  const { data, isLoading, isError, error } = useGetConsolidatedSalesReportQuery(apiFilters);

  const salesData = data?.salesReport || [];
  const cities = data?.cities || [];

  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);

  useEffect(() => {
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

  const businessNames = allBusinessNames;

  const {
    paginatedData,
    totalItems,
    totalPages,
    startIndex
  } = filterAndPaginateData(salesData, (sale: any) =>
    Object.values(sale).map(v => v?.toString() || '')
  );

  if (isLoading) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {[...Array(6)].map((_, i) => (
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

        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Service Amount (₹)</TableHead>
                <TableHead>Total Product Amount (₹)</TableHead>
                <TableHead>Product Platform Fee (₹)</TableHead>
                <TableHead>Service Platform Fees (₹)</TableHead>
                <TableHead>Subscription Amount (₹)</TableHead>
                <TableHead>SMS Amount (₹)</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading consolidated sales report data. Please try again later.
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-2 text-sm text-gray-500">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
      </div>
    );
  }

  if (salesData.length === 0) {
    return (
      <div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Business</CardTitle>
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
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'consolidated_sales_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'consolidated_sales_report')}>
                  <FileText className="mr-2 h-4 w-4" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'consolidated_sales_report')}>
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(tableRef)}>
                  <Printer className="mr-2 h-4 w-4" /> Print
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
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Service Amount (₹)</TableHead>
                <TableHead>Total Product Amount (₹)</TableHead>
                <TableHead>Product Platform Fee (₹)</TableHead>
                <TableHead>Service Platform Fees (₹)</TableHead>
                <TableHead>Subscription Amount (₹)</TableHead>
                <TableHead>SMS Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No consolidated sales report data available.
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
          <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'consolidated_sales_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'consolidated_sales_report')}>
                <FileText className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'consolidated_sales_report')}>
                <FileText className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" /> Print
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.aggregatedTotals?.totalBusinessFormatted || '₹0.00')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Service Amount (₹)</TableHead>
              <TableHead>Total Product Amount (₹)</TableHead>
              <TableHead>Service Tax (₹)</TableHead>
              <TableHead>Product Tax/GST (₹)</TableHead>
              <TableHead>Product Platform Fee (₹)</TableHead>
              <TableHead>Service Platform Fees (₹)</TableHead>
              <TableHead>Subscription Amount (₹)</TableHead>
              <TableHead>SMS Amount (₹)</TableHead>
              <TableHead>Total Business (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendor: any, index: number) => {
              const serviceAmount = parseFloat(vendor["Total Service Amount (₹)"].replace(/[₹,]/g, '')) || 0;
              const productAmount = parseFloat(vendor["Total Product Amount (₹)"].replace(/[₹,]/g, '')) || 0;
              const serviceTax = parseFloat(vendor["Service Tax (₹)"].replace(/[₹,]/g, '')) || 0;
              const productTax = parseFloat(vendor["Product Tax/GST (₹)"].replace(/[₹,]/g, '')) || 0;
              const productPlatformFee = parseFloat(vendor["Product Platform Fee (₹)"].replace(/[₹,]/g, '')) || 0;
              const servicePlatformFees = vendor["Service Platform Fees (₹)"] !== '-' ? parseFloat(vendor["Service Platform Fees (₹)"]?.replace(/[₹,]/g, '')) || 0 : 0;
              const subscriptionAmount = parseFloat(vendor["Subscription Amount (₹)"].replace(/[₹,]/g, '')) || 0;
              const smsAmount = parseFloat(vendor["SMS Amount (₹)"].replace(/[₹,]/g, '')) || 0;

              const totalBusiness = serviceAmount + productAmount + serviceTax + productTax + productPlatformFee + servicePlatformFees + subscriptionAmount + smsAmount;

              return (
                <TableRow key={startIndex + index}>
                  <TableCell className="font-medium">{vendor["Business Name"]}</TableCell>
                  <TableCell>{vendor.Type}</TableCell>
                  <TableCell>{vendor.City}</TableCell>
                  <TableCell>{vendor["Total Service Amount (₹)"]}</TableCell>
                  <TableCell>{vendor["Total Product Amount (₹)"]}</TableCell>
                  <TableCell>{vendor["Service Tax (₹)"]}</TableCell>
                  <TableCell>{vendor["Product Tax/GST (₹)"]}</TableCell>
                  <TableCell>{vendor["Product Platform Fee (₹)"]}</TableCell>
                  <TableCell>{vendor["Service Platform Fees (₹)"]}</TableCell>
                  <TableCell>{vendor["Subscription Amount (₹)"]}</TableCell>
                  <TableCell>{vendor["SMS Amount (₹)"]}</TableCell>
                  <TableCell>₹{totalBusiness.toFixed(2)}</TableCell>
                </TableRow>
              )
            })}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Total Service Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Total Product Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Service Tax (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Product Tax/GST (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Product Platform Fee (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Service Platform Fees (₹)"] || '0';
                  if (rawValue === '-') return sum + 0;
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["Subscription Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const rawValue = item["SMS Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const serviceAmount = parseFloat(item["Total Service Amount (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const productAmount = parseFloat(item["Total Product Amount (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const serviceTax = parseFloat(item["Service Tax (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const productTax = parseFloat(item["Product Tax/GST (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const productPlatformFee = parseFloat(item["Product Platform Fee (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const servicePlatformFees = item["Service Platform Fees (₹)"] !== '-' ? parseFloat(item["Service Platform Fees (₹)"]?.replace(/[₹,]/g, '')) || 0 : 0;
                  const subscriptionAmount = parseFloat(item["Subscription Amount (₹)"]?.replace(/[₹,]/g, '')) || 0;
                  const smsAmount = parseFloat(item["SMS Amount (₹)"]?.replace(/[₹,]/g, '')) || 0;

                  const totalBusiness = serviceAmount + productAmount + serviceTax + productTax + productPlatformFee + servicePlatformFees + subscriptionAmount + smsAmount;
                  return sum + totalBusiness;
                }, 0).toFixed(2)}</TableCell>
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
