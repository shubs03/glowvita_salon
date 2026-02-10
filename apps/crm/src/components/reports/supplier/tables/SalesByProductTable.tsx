"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetSalesByProductReportQuery } from '@repo/store/api';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from './exportUtils';

export const SalesByProductTable = ({ product, category, brand, onFiltersChange, triggerRefresh }: any) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetSalesByProductReportQuery({
    product: product && product !== 'all' ? product : undefined,
    category: category && category !== 'all' ? category : undefined,
    brand: brand && brand !== 'all' ? brand : undefined
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
      case 'excel': exportToExcel(tableRef, 'sales_by_product'); break;
      case 'csv': exportToCSV(tableRef, 'sales_by_product'); break;
      case 'pdf': exportToPDF(tableRef, 'sales_by_product'); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch, product, category, brand, triggerRefresh]);

  const products = useMemo(() => {
    const allProducts = data?.data?.products || [];
    return allProducts.filter((product: any) => product.status === 'delivered');
  }, [data]);

  const searchedProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product: any) =>
      Object.values(product).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const totals = useMemo(() => {
    return searchedProducts.reduce((acc: any, item: any) => ({
      quantitySold: acc.quantitySold + (item.quantitySold || 0),
      grossSales: acc.grossSales + (item.grossSales || 0),
      discountAmount: acc.discountAmount + (item.discountAmount || 0),
      netSales: acc.netSales + (item.netSales || 0),
      taxAmount: acc.taxAmount + (item.taxAmount || 0),
      totalSales: acc.totalSales + (item.totalSales || 0)
    }), {
      quantitySold: 0,
      grossSales: 0,
      discountAmount: 0,
      netSales: 0,
      taxAmount: 0,
      totalSales: 0
    });
  }, [searchedProducts]);

  const totalItems = searchedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = searchedProducts.slice(startIndex, endIndex);

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
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Product Category</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Gross Sales</TableHead>
                <TableHead>Discount Amount</TableHead>
                <TableHead>Net Sales</TableHead>
                <TableHead>Tax Amount</TableHead>
                <TableHead>Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
        <div className="text-center py-4 text-red-500">Failed to load sales by product data. Please try again.</div>
      </div>
    );
  }

  if (paginatedProducts.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-gray-500">No sales by product data available.</div>
        <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showProductFilter={true} showCategoryFilter={true} showBrandFilter={true} hideBookingTypeFilter={true} hideClientFilter={true} hideServiceFilter={true} hideStaffFilter={true} />
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

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showProductFilter={true} showCategoryFilter={true} showBrandFilter={true} hideBookingTypeFilter={true} hideClientFilter={true} hideServiceFilter={true} hideStaffFilter={true} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead>Quantity Sold</TableHead>
              <TableHead>Gross Sales</TableHead>
              <TableHead>Discount Amount</TableHead>
              <TableHead>Net Sales</TableHead>
              <TableHead>Tax Amount</TableHead>
              <TableHead>Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.productId}</TableCell>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.productCategory}</TableCell>
                <TableCell>{item.quantitySold}</TableCell>
                <TableCell>₹{typeof item.grossSales === 'number' ? item.grossSales.toFixed(2) : '0.00'}</TableCell>
                <TableCell>₹{typeof item.discountAmount === 'number' ? item.discountAmount.toFixed(2) : '0.00'}</TableCell>
                <TableCell>₹{typeof item.netSales === 'number' ? item.netSales.toFixed(2) : '0.00'}</TableCell>
                <TableCell>₹{typeof item.taxAmount === 'number' ? item.taxAmount.toFixed(2) : '0.00'}</TableCell>
                <TableCell>₹{typeof item.totalSales === 'number' ? item.totalSales.toFixed(2) : '0.00'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted/50">
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell>{totals.quantitySold}</TableCell>
              <TableCell>₹{totals.grossSales.toFixed(2)}</TableCell>
              <TableCell>₹{totals.discountAmount.toFixed(2)}</TableCell>
              <TableCell>₹{totals.netSales.toFixed(2)}</TableCell>
              <TableCell>₹{totals.taxAmount.toFixed(2)}</TableCell>
              <TableCell>₹{totals.totalSales.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={totalItems} />
    </div>
  );
};
