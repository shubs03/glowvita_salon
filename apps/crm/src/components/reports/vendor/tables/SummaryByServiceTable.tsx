"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { useGetSummaryByServiceReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface SummaryByServiceTableProps {
  startDate?: string;
  endDate?: string;
  client?: string;
  service?: string;
  staff?: string;
  status?: string;
  bookingType?: string;
  onFiltersChange?: (filters: FilterParams) => void;
  triggerRefresh?: any;
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
    printWindow.document.write('<html><head><title>Appointment Summary by Service</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; font-size: 10px; } th, td { border: 1px solid #ddd; padding: 4px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const SummaryByServiceTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: SummaryByServiceTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetSummaryByServiceReportQuery({
    period: 'custom',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    client: client && client !== 'all' ? client : undefined,
    service: service && service !== 'all' ? service : undefined,
    staff: staff && staff !== 'all' ? staff : undefined,
    status: status && status !== 'all' ? status : undefined,
    bookingType: bookingType && bookingType !== 'all' ? bookingType : undefined
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const handleExport = (format: string) => {
    const fileName = 'summary_by_service';
    switch (format) {
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => { refetch(); }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const services = data?.data?.summaryByService || data?.data || [];
  const totalAppointments = services.reduce((sum: number, s: any) => sum + (s.count || 0), 0);
  const totalRevenue = services.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
  const avgDuration = services.length > 0 ? services.reduce((sum: number, s: any) => sum + (s.totalDuration || 0), 0) / totalAppointments : 0;
  const topService = services.length > 0 ? services[0].serviceName : 'N/A';

  const searchedServices = useMemo(() => {
    let result = services;
    if (searchTerm) {
      result = result.filter((s: any) =>
        Object.values(s).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return result;
  }, [services, searchTerm]);

  const totalItems = searchedServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedServices = searchedServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    return <div className="text-center py-4 text-red-500">Failed to load service summary data.</div>;
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
      />

      {/* Formula Display */}
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
        <p className="text-sm font-medium text-primary">
          Formula: <span className="text-muted-foreground italic">Service Share % = (Service Count / Total Appointments) * 100</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <div className="text-xs font-bold text-blue-500">Revenue</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration.toFixed(0)} mins</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topService}>{topService}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Service</TableHead>
              <TableHead>Total Appointments</TableHead>
              <TableHead>Total Sale</TableHead>
              <TableHead>Total Duration</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.length > 0 ? (
              paginatedServices.map((item: any, index: number) => {
                const count = item.count || item.appointmentCount || 0;
                const revenue = item.totalAmount || item.revenue || 0;
                const duration = item.totalDuration || item.averageDuration || 0;
                const percentage = totalAppointments > 0 ? (count / totalAppointments) * 100 : 0;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.serviceName || 'Unknown Service'}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>₹{typeof revenue === 'number' ? revenue.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>{typeof duration === 'number' ? duration.toFixed(0) : 0} mins</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2 text-xs font-medium">{percentage.toFixed(1)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No data available.</TableCell>
              </TableRow>
            )}
            {paginatedServices.length > 0 && (
              <TableRow className="bg-muted font-bold text-primary">
                <TableCell>TOTAL</TableCell>
                <TableCell>{paginatedServices.reduce((sum: number, s: any) => sum + (s.count || 0), 0)}</TableCell>
                <TableCell>₹{paginatedServices.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0).toFixed(2)}</TableCell>
                <TableCell>{paginatedServices.reduce((sum: number, s: any) => sum + (s.totalDuration || 0), 0).toFixed(0)} mins</TableCell>
                <TableCell>100%</TableCell>
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
