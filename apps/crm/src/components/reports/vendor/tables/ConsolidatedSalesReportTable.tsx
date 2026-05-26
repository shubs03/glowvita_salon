"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, IndianRupee } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { useGetVendorConsolidatedSalesReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface ConsolidatedSalesReportTableProps {
  startDate?: string;
  endDate?: string;
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
  const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
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
    printWindow.document.write('<html><head><title>Consolidated Sales Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; font-size: 10px; } th, td { border: 1px solid #ddd; padding: 4px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const ConsolidatedSalesReportTable = ({ startDate, endDate, onFiltersChange, triggerRefresh }: ConsolidatedSalesReportTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetVendorConsolidatedSalesReportQuery({
    period: startDate && endDate ? 'custom' : 'all',
    startDate,
    endDate
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const handleExport = (format: string) => {
    const fileName = 'consolidated_sales_report';
    switch (format) {
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => { refetch(); }, [refetch, startDate, endDate, triggerRefresh]);

  const salesData = data?.data?.salesReport || [];
  const totals = data?.data?.aggregatedTotals || {};

  const filteredData = useMemo(() => {
    if (!searchTerm) return salesData;
    return salesData.filter((item: any) =>
      Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [salesData, searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    return <div className="text-center py-4 text-red-500">Failed to load consolidated sales report.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalBusinessFormatted || '₹0.00'}</div>
            <p className="text-xs text-muted-foreground">Aggregated across all revenue streams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
            <div className="text-xs font-bold text-blue-500">Service</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.totalServiceAmount || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Revenue</CardTitle>
            <div className="text-xs font-bold text-green-500">Product</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.totalProductAmount || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <div className="text-xs font-bold text-orange-500">Fees</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{((totals.totalPlatformFees || 0) + (totals.totalProductPlatformFee || 0)).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
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
        showStatusFilter={false}
      />

      {/* Formula Display */}
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
        <p className="text-sm font-medium text-primary">
          Formula: <span className="text-muted-foreground italic">Total Business = Service + Product + Service Tax + Product Tax + Product Platform Fee + Service Platform Fees + Subscription + SMS</span>
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service Amount (₹)</TableHead>
              <TableHead>Product Amount (₹)</TableHead>
              <TableHead>Service Tax (₹)</TableHead>
              <TableHead>Product Tax (₹)</TableHead>
              <TableHead>Product Platform Fee (₹)</TableHead>
              <TableHead>Service Platform Fee (₹)</TableHead>
              <TableHead>Subscription (₹)</TableHead>
              <TableHead>SMS (₹)</TableHead>
              <TableHead className="font-bold">Total Business (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{row.Date}</TableCell>
                <TableCell>{row["Total Service Amount (₹)"]}</TableCell>
                <TableCell>{row["Total Product Amount (₹)"]}</TableCell>
                <TableCell>{row["Service Tax (₹)"]}</TableCell>
                <TableCell>{row["Product Tax/GST (₹)"]}</TableCell>
                <TableCell>{row["Product Platform Fee (₹)"]}</TableCell>
                <TableCell>{row["Service Platform Fees (₹)"]}</TableCell>
                <TableCell>{row["Subscription Amount (₹)"]}</TableCell>
                <TableCell>{row["SMS Amount (₹)"]}</TableCell>
                <TableCell className="font-bold">{row["Total Business (₹)"]}</TableCell>
              </TableRow>
            ))}
            {paginatedData.length > 0 && (
              <TableRow className="font-bold bg-muted/50">
                <TableCell>TOTAL</TableCell>
                <TableCell>₹{(totals.totalServiceAmount || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.totalProductAmount || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.totalServiceTax || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.totalProductTax || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.totalProductPlatformFee || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.totalPlatformFees || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.subscriptionAmount || 0).toFixed(2)}</TableCell>
                <TableCell>₹{(totals.smsAmount || 0).toFixed(2)}</TableCell>
                <TableCell className="font-bold text-primary">₹{(totals.totalBusiness || 0).toFixed(2)}</TableCell>
              </TableRow>
            )}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No data available for the selected period.</TableCell>
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
