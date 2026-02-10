"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetCategoryWiseProductReportQuery } from '@repo/store/api';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from './exportUtils';

export const CategoryWiseProductTable = ({ product, category, brand, onFiltersChange, triggerRefresh }: any) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetCategoryWiseProductReportQuery({
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
      case 'excel': exportToExcel(tableRef, 'category_wise_product_report'); break;
      case 'csv': exportToCSV(tableRef, 'category_wise_product_report'); break;
      case 'pdf': exportToPDF(tableRef, 'category_wise_product_report'); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch, product, category, brand, triggerRefresh]);

  const categories = data?.data?.categories || [];

  const searchedCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter((category: any) =>
      Object.values(category).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [categories, searchTerm]);

  const totalItems = searchedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = searchedCategories.slice(startIndex, endIndex);

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
                <TableHead>Category Name</TableHead>
                <TableHead>Number of Products</TableHead>
                <TableHead>Active Products</TableHead>
                <TableHead>Average Price</TableHead>
                <TableHead>Average Sale Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
        <div className="text-center py-4 text-red-500">Failed to load category-wise product data. Please try again.</div>
      </div>
    );
  }

  if (paginatedCategories.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-gray-500">No category-wise product data available.</div>
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
              <TableHead>Category Name</TableHead>
              <TableHead>Number of Products</TableHead>
              <TableHead>Active Products</TableHead>
              <TableHead>Average Price</TableHead>
              <TableHead>Average Sale Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.categoryName}</TableCell>
                <TableCell>{item.numberOfProducts}</TableCell>
                <TableCell>{item.activeProducts}</TableCell>
                <TableCell>₹{typeof item.averagePrice === 'number' ? item.averagePrice.toFixed(2) : '0.00'}</TableCell>
                <TableCell>₹{typeof item.averageSalePrice === 'number' ? item.averageSalePrice.toFixed(2) : '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={totalItems} />
    </div>
  );
};
