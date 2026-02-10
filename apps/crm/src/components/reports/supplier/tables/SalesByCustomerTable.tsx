"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetSalesByCustomerReportQuery } from '@repo/store/api';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from './exportUtils';

export const SalesByCustomerTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: any) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetSalesByCustomerReportQuery({
    period: startDate && endDate ? 'custom' : 'all',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    client: client && client !== 'all' ? client : undefined,
    service: service && service !== 'all' ? service : undefined,
    staff: staff && staff !== 'all' ? staff : undefined,
    bookingType: bookingType && bookingType !== 'all' ? bookingType : undefined
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel': exportToExcel(tableRef, 'sales_by_customer'); break;
      case 'csv': exportToCSV(tableRef, 'sales_by_customer'); break;
      case 'pdf': exportToPDF(tableRef, 'sales_by_customer'); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const customers = data?.data?.salesByCustomer || [];

  const searchedCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter((customer: any) =>
      Object.values(customer).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [customers, searchTerm]);

  const totalItems = searchedCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = searchedCustomers.slice(startIndex, endIndex);

  const totalSales = paginatedCustomers.reduce((sum: number, customer: any) => sum + (customer.totalSales || 0), 0);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button><Download className="mr-2 h-4 w-4" />Export</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('copy')}><Copy className="mr-2 h-4 w-4" />Copy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="mr-2 h-4 w-4" />CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service Sold</TableHead>
                <TableHead>Gross Sale</TableHead>
                <TableHead>Discounts</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead>Net Sale</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-red-500">Failed to load sales by customer data. Please try again.</div>
      </div>
    );
  }

  if (paginatedCustomers.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-gray-500">No sales by customer data available.</div>
        <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showStatusFilter={false} hideClientFilter={false} hideServiceFilter={false} hideStaffFilter={false} hideBookingTypeFilter={false} />
      </div>
    );
  }

  return (
    <div ref={tableRef}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button><Download className="mr-2 h-4 w-4" />Export</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('copy')}><Copy className="mr-2 h-4 w-4" />Copy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="mr-2 h-4 w-4" />CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('print')}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showStatusFilter={false} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service Sold</TableHead>
              <TableHead>Gross Sale</TableHead>
              <TableHead>Discounts</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Net Sale</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((item: any, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.customer || 'Unknown Customer'}</TableCell>
                  <TableCell>{item.serviceSold || 0}</TableCell>
                  <TableCell>₹{typeof item.grossSale === 'number' ? item.grossSale.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.discounts === 'number' ? item.discounts.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.offers === 'number' ? item.offers.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.netSale === 'number' ? item.netSale.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.tax === 'number' ? item.tax.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.totalSales === 'number' ? item.totalSales.toFixed(2) : '0.00'}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-bold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell>{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.serviceSold || 0), 0)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.grossSale || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.discounts || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.offers || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.netSale || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.tax || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedCustomers.reduce((sum: number, item: any) => sum + (item.totalSales || 0), 0).toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={totalItems} />
    </div>
  );
};
