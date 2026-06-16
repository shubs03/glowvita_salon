"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Badge } from "@repo/ui/badge";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, UserX, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { useGetCancelledAppointmentsReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface CancelledAppointmentsTableProps {
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
    printWindow.document.write('<html><head><title>Cancelled Appointments Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; font-size: 8px; } th, td { border: 1px solid #ddd; padding: 4px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const CancelledAppointmentsTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: CancelledAppointmentsTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetCancelledAppointmentsReportQuery({
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
    const fileName = 'cancelled_appointments_report';
    switch (format) {
      case 'copy': copyToClipboard(tableRef); break;
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => { refetch(); }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const appointments = data?.data?.cancellations?.cancellations || data?.data || [];

  // Build appointmentId -> true total base amount map
  // by summing each service row's `amount` per appointment id.
  const appointmentBaseTotals = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((appt: any) => {
      const key = String(appt.id || appt._id);
      map.set(key, (map.get(key) || 0) + (appt.amount || 0));
    });
    return map;
  }, [appointments]);

  const finalFilteredAppointments = useMemo(() => {
    let result = appointments;
    if (searchTerm) {
      result = result.filter((a: any) =>
        Object.values(a).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return result;
  }, [appointments, searchTerm]);

  const totalItems = finalFilteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppointments = finalFilteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => {
    const uniqueIds = new Set();
    let onlineCount = 0;
    let offlineCount = 0;
    let revenueLoss = 0;

    appointments.forEach((appt: any) => {
      if (!uniqueIds.has(appt.id)) {
        uniqueIds.add(appt.id);
        const mode = (appt.mode || '').toLowerCase();
        if (mode === 'online') onlineCount++;
        else if (mode === 'offline') offlineCount++;
        revenueLoss += (appt.amount || 0);
      }
    });

    return { onlineCount, offlineCount, revenueLoss, totalCount: uniqueIds.size };
  }, [appointments]);

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
    return <div className="text-center py-4 text-red-500">Failed to load cancelled appointments data.</div>;
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
        showStatusFilter={true}
      />

      {/* Formula Display */}
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
        <p className="text-sm font-medium text-primary">
          Formula: <span className="text-muted-foreground italic">Revenue Loss = Base Amount + Platform Fee + Service Tax</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onlineCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.offlineCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenueLoss.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Service</TableHead>
              <TableHead className="text-xs">Staff</TableHead>
              <TableHead className="text-xs">Scheduled</TableHead>
              <TableHead className="text-xs">Cancelled On</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Fee</TableHead>
              <TableHead className="text-xs">Tax</TableHead>
              <TableHead className="text-xs font-bold">Final Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((item: any) => {
                // Proportional fee/tax allocation using pre-computed true total base
                const baseAmount = item.amount || 0;
                const trueTotalBase = appointmentBaseTotals.get(String(item.id || item._id)) || baseAmount || 1;
                const ratio = (item.isMultiService && trueTotalBase > 0) ? baseAmount / trueTotalBase : 1;
                const proportionalFee = (item.platformFee || 0) * ratio;
                const proportionalTax = (item.serviceTax || 0) * ratio;
                const proportionalFinal = baseAmount + proportionalFee + proportionalTax;

                // Service label with (index/total) for multi-service rows
                const baseName = item.serviceName || 'N/A';
                const serviceLabel = (item.isMultiService && item.multiServiceTotal > 1)
                  ? `${baseName} (${(item.multiServiceIndex ?? 0) + 1}/${item.multiServiceTotal})`
                  : baseName;

                return (
                  <TableRow key={`${item.id}-${item.multiServiceIndex ?? 0}`}>
                    <TableCell className="text-xs py-2 font-medium">{item.clientName || 'N/A'}</TableCell>
                    <TableCell className="text-xs py-2">{serviceLabel}</TableCell>
                    <TableCell className="text-xs py-2">{item.staffName || 'N/A'}</TableCell>
                    <TableCell className="text-[10px] py-2">{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-[10px] py-2">{item.cancelledDate ? new Date(item.cancelledDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-xs py-2">₹{baseAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-[10px] py-2">₹{proportionalFee.toFixed(2)}</TableCell>
                    <TableCell className="text-[10px] py-2">₹{proportionalTax.toFixed(2)}</TableCell>
                    <TableCell className="text-xs py-2 font-bold text-red-600">₹{proportionalFinal.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No cancelled appointments found.</TableCell>
              </TableRow>
            )}
            {paginatedAppointments.length > 0 && (() => {
              let totalBase = 0, totalFee = 0, totalTax = 0, totalFinal = 0;
              paginatedAppointments.forEach((item: any) => {
                const base = item.amount || 0;
                const trueTotalBase = appointmentBaseTotals.get(String(item.id || item._id)) || base || 1;
                const r = (item.isMultiService && trueTotalBase > 0) ? base / trueTotalBase : 1;
                const fee = (item.platformFee || 0) * r;
                const tax = (item.serviceTax || 0) * r;
                totalBase  += base;
                totalFee   += fee;
                totalTax   += tax;
                totalFinal += base + fee + tax;
              });
              return (
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={5}>TOTAL LOSS</TableCell>
                  <TableCell className="text-xs">₹{totalBase.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">₹{totalFee.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">₹{totalTax.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-red-600">₹{totalFinal.toFixed(2)}</TableCell>
                </TableRow>
              );
            })()}
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
