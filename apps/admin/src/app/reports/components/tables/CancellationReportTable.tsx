"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { Pagination } from "@repo/ui/pagination";
import { useGetCancellationReportQuery } from '@repo/store/api';
import { VendorCancellationStat, FilterParams } from '../types';
import { FilterModal } from '../common';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';

export const CancellationReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch cancellation report data with filters
  const apiFilters = filters;
  
  console.log("Cancellation API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetCancellationReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Cancellation filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Debug: Log the actual data structure
  console.log('Cancellation raw data:', data);
  
  // Define data variables after API call
  // The API returns an object with vendorCancellations array
  const rawData = data && Array.isArray(data.vendorCancellations) ? data.vendorCancellations : [];
  const cities = data?.cities || [];
  const vendors = data?.vendors || [];
  
  // Handle case where data structure is unexpected
  if (!data || !Array.isArray(data.vendorCancellations)) {
    console.warn('Cancellation data structure is unexpected:', data);
  }
  
  // Transform and aggregate the raw data by vendor
  const aggregatedData: Record<string, VendorCancellationStat> = rawData.reduce((acc: Record<string, VendorCancellationStat>, item: any) => {
    const vendor = item.vendor || item.businessName || 'Unknown Vendor';
    const city = item.city || 'Unknown City';
    const key = `${vendor}-${city}`;
    
    if (!acc[key]) {
      acc[key] = {
        vendorId: '',
        vendor,
        city,
        totalCancellations: 0,
        onlineCancellations: 0,
        offlineCancellations: 0
      };
    }
    
    acc[key].totalCancellations += item.totalCancellations || 1;
    acc[key].onlineCancellations += item.onlineCancellations || 0;
    acc[key].offlineCancellations += item.offlineCancellations || 0;
    return acc;
  }, {});
  
  const finalCancellationData: VendorCancellationStat[] = Object.values(aggregatedData);
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return finalCancellationData;
    
    return finalCancellationData.filter((item: VendorCancellationStat) => 
      Object.values(item).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [finalCancellationData, searchTerm]);
  
  // Debug: Log the processed data
  console.log('Processed cancellation data:', finalCancellationData);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (isLoading) {
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Cancellations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
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
    console.error("Error fetching cancellation report:", error);
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
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading cancellation report data. Please try again later.
          {/* Display error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-2 text-sm text-gray-500">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Show table structure even when there's no data
  if (finalCancellationData.length === 0) {
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
          vendors={vendors}
          showVendorFilter={true}
          initialFilters={filters}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Cancellations</TableHead>
                <TableHead>Online Cancellations</TableHead>
                <TableHead>Offline Cancellations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No cancellation data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
      
      {/* Total Cancellations Card */}
      <div className="flex justify-start mb-6">
        <Card className="w-fit min-w-[200px]">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium">Total Cancellations</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{data?.totalCancelled || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={cities}
        vendors={vendors}
        showVendorFilter={true}
        initialFilters={filters}
      />
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Cancellations</TableHead>
              <TableHead>Online Cancellations</TableHead>
              <TableHead>Offline Cancellations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendorData: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{vendorData.vendor}</TableCell>
                <TableCell>{vendorData.city}</TableCell>
                <TableCell>{vendorData.totalCancellations}</TableCell>
                <TableCell>{vendorData.onlineCancellations}</TableCell>
                <TableCell>{vendorData.offlineCancellations}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.totalCancellations || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.onlineCancellations || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.offlineCancellations || 0), 0)}</TableCell>
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
