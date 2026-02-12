"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, ShoppingCart, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import {useGetSalesByBrandReportQuery } from '@repo/store/api';
import { FilterModal } from '../common/FilterModal';
import type { FilterParams, SalesByBrandData } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';

export const SalesByBrandReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  const apiFilters = filters;
  
  const { data, isLoading, isError, error } = useGetSalesByBrandReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const salesData = data?.salesByBrand || [];
  const cities = data?.cities || [];
  const businessNames = data?.businessNames || [];
  const brands = data?.brands || [];
  const aggregatedTotals = data?.aggregatedTotals;
  
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  
  useEffect(() => {
    if ((Object.keys(apiFilters).length === 0 || allBusinessNames.length === 0) && businessNames.length > 0) {
      setAllBusinessNames(businessNames);
    }
  }, [businessNames, apiFilters, allBusinessNames.length]);
  
  const formattedData: SalesByBrandData[] = salesData.map((item: any) => ({
    brandName: item.brandName || item._id,
    totalQuantitySold: item.totalQuantitySold || 0,
    totalRevenue: item.totalRevenue || '₹0.00'
  }));
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return formattedData;
    
    return formattedData.filter((brand: SalesByBrandData) => 
      Object.values(brand).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [formattedData, searchTerm]);
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div>
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
                <TableHead>Brand Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
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
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading sales by brand report data. Please try again later.
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-2 text-sm text-gray-500">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (formattedData.length === 0) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button><Download className="mr-2 h-4 w-4" />Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_brand_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_brand_report')}>
                  <FileText className="mr-2 h-4 w-4" />CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_brand_report')}>
                  <FileText className="mr-2 h-4 w-4" />PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(tableRef)}>
                  <Printer className="mr-2 h-4 w-4" />Print
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
          businessNames={allBusinessNames}
          brands={brands}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showCategoryFilter={false}
          showBrandFilter={true}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No sales by brand data available.
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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><Download className="mr-2 h-4 w-4" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_brand_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_brand_report')}>
                <FileText className="mr-2 h-4 w-4" />CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_brand_report')}>
                <FileText className="mr-2 h-4 w-4" />PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />Print
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
        businessNames={allBusinessNames}
        brands={brands}
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
        showCategoryFilter={false}
        showBrandFilter={true}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.totalQuantitySold || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Total Quantity Sold</TableHead>
              <TableHead>Total Revenue (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((brand: SalesByBrandData, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{brand.brandName}</TableCell>
                <TableCell>{brand.totalQuantitySold}</TableCell>
                <TableCell>{brand.totalRevenue}</TableCell>
              </TableRow>
            ))}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (parseInt(item.totalQuantitySold) || 0), 0)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, item: any) => sum + (parseFloat(item.totalRevenue.replace('₹', '')) || 0), 0).toFixed(2)}</TableCell>
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
