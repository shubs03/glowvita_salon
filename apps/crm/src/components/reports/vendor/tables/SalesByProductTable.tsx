"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, ShoppingBag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { useGetSalesByProductReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface SalesByProductTableProps {
  product?: string;
  category?: string;
  brand?: string;
  status?: string;
  isActive?: boolean;
  onFiltersChange?: (filters: FilterParams) => void;
  triggerRefresh?: number;
}

const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('table');
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('table');
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.csv`);
};

const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('table');
  if (!table) return;
  const canvas = await html2canvas(table as HTMLElement);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const imgWidth = pdf.internal.pageSize.getWidth() - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  pdf.save(`${fileName}.pdf`);
};

const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('table');
  if (!table) return;
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
  document.execCommand('copy');
  window.getSelection()?.removeAllRanges();
  alert('Table copied to clipboard!');
};

const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('table');
  if (!table) return;
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Product Sales Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; font-size: 10px; } th, td { border: 1px solid #ddd; padding: 4px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const SalesByProductTable = ({ product, category, brand, status, isActive, onFiltersChange, triggerRefresh }: SalesByProductTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetSalesByProductReportQuery({
    product: product && product !== 'all' ? product : undefined,
    category: category && category !== 'all' ? category : undefined,
    brand: brand && brand !== 'all' ? brand : undefined,
    status: status && status !== 'all' ? status : undefined,
    isActive: isActive !== undefined ? isActive : undefined
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const handleExport = (format: string) => {
    const fileName = 'product_sales_report';
    switch (format) {
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => { refetch(); }, [refetch, product, category, brand, status, isActive, triggerRefresh]);

  const products = data?.data?.salesByProduct || [];

  const searchedProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p: any) =>
      Object.values(p).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const totalItems = searchedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = searchedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Aggregated Totals for Summary Cards
  const aggregatedTotals = useMemo(() => {
    return searchedProducts.reduce((acc, curr) => {
      acc.totalSales += curr.totalSales || 0;
      acc.unitsSold += curr.quantitySold || 0;
      acc.grossProfit += curr.grossProfit || 0;
      acc.taxAmount += curr.taxAmount || 0;
      return acc;
    }, { totalSales: 0, unitsSold: 0, grossProfit: 0, taxAmount: 0 });
  }, [searchedProducts]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Failed to load sales by product data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex justify-between items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('copy')}><Copy className="mr-2 h-4 w-4" /> Copy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('print')}><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={[]}
        initialFilters={filters}
        showProductFilter={true}
        showCategoryFilter={true}
        showBrandFilter={true}
        hideBookingTypeFilter={true}
        hideClientFilter={true}
        hideServiceFilter={true}
        hideStaffFilter={true}
      />

      {/* Formula Display */}
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
        <p className="text-sm font-medium text-primary">
          Formula: <span className="text-muted-foreground italic">Product Sales Total = Product Amount + Product Platform Fee + Product Tax</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Product Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{aggregatedTotals.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
            <div className="text-xs font-bold text-blue-500">Units</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedTotals.unitsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <div className="text-xs font-bold text-green-500">Profit</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{aggregatedTotals.grossProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Amount</CardTitle>
            <div className="text-xs font-bold text-orange-500">Tax</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{aggregatedTotals.taxAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty Sold</TableHead>
              <TableHead>Gross Sales</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Net Sales</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-xs">{item.productId}</TableCell>
                  <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                  <TableCell className="text-xs">{item.brand}</TableCell>
                  <TableCell className="text-xs">{item.category}</TableCell>
                  <TableCell className="text-xs">{item.quantitySold}</TableCell>
                  <TableCell className="text-xs">₹{item.grossSales?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">₹{item.discountAmount?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">₹{item.netSales?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">₹{item.taxAmount?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs font-bold">₹{item.totalSales?.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No product sales data available.</TableCell>
              </TableRow>
            )}
            {paginatedProducts.length > 0 && (
              <TableRow className="bg-muted font-bold text-primary">
                <TableCell colSpan={4}>TOTAL</TableCell>
                <TableCell>{paginatedProducts.reduce((sum, p: any) => sum + (p.quantitySold || 0), 0)}</TableCell>
                <TableCell>₹{paginatedProducts.reduce((sum, p: any) => sum + (p.grossSales || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedProducts.reduce((sum, p: any) => sum + (p.discountAmount || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedProducts.reduce((sum, p: any) => sum + (p.netSales || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedProducts.reduce((sum, p: any) => sum + (p.taxAmount || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedProducts.reduce((sum, p: any) => sum + (p.totalSales || 0), 0).toFixed(2)}</TableCell>
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
