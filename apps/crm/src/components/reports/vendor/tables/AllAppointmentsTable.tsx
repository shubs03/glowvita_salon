"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, CalendarCheck, Globe, UserX, CreditCard, Scale } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { Badge } from "@repo/ui/badge";
import { useGetAllAppointmentsReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface AllAppointmentsTableProps {
  startDate?: string;
  endDate?: string;
  client?: string;
  service?: string;
  staff?: string;
  status?: string;
  bookingType?: string;
  onFiltersChange?: (filters: any) => void;
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
    printWindow.document.write('<html><head><title>Booking Summary Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; font-size: 8px; } th, td { border: 1px solid #ddd; padding: 4px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const AllAppointmentsTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: AllAppointmentsTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetAllAppointmentsReportQuery({
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
    const fileName = 'booking_summary_report';
    switch (format) {
      case 'copy': copyToClipboard(tableRef); break;
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => { refetch(); }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const appointments = data?.data?.allAppointments?.appointments || data?.data || [];
  const totalBookings = data?.data?.allAppointments?.total || appointments.length || 0;

  const searchedAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    return appointments.filter((appt: any) =>
      Object.values(appt).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [appointments, searchTerm]);

  const totalItems = searchedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppointments = searchedAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Aggregated Totals for Summary Cards
  const stats = useMemo(() => {
    const uniqueIds = new Set();
    let onlineCount = 0;
    let offlineCount = 0;
    let completedRevenue = 0;
    let totalBusiness = 0;

    appointments.forEach((appt: any) => {
      if (!uniqueIds.has(appt.id)) {
        uniqueIds.add(appt.id);
        const mode = (appt.mode || '').toLowerCase();
        if (mode === 'online') onlineCount++;
        else if (mode === 'offline') offlineCount++;

        if ((appt.status || '').toLowerCase() === 'completed') {
           totalBusiness += (appt.finalAmount || appt.totalAmount || 0);
        }
      }
      
      if ((appt.status || '').toLowerCase() === 'completed') {
        completedRevenue += (appt.amount || 0);
      }
    });

    return { onlineCount, offlineCount, completedRevenue, totalBusiness, uniqueCount: uniqueIds.size };
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
           {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Failed to load appointment data.</div>;
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
          Formula: <span className="text-muted-foreground italic">Total Final Amount = Base Amount + Platform Fee + Service Tax</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCount}</div>
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
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.completedRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.totalBusiness.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Amount</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead className="font-bold">Final</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((item: any) => {
                let ratio = (item.isMultiService && item.amount && item.totalAmount) ? item.amount / item.totalAmount : 1;
                if (!item.isMultiService) ratio = 1;
                
                const proportionalPlatformFee = (item.platformFee || 0) * ratio;
                const proportionalServiceTax = (item.serviceTax || 0) * ratio;
                const proportionalFinalAmount = (item.amount || item.totalAmount || 0) + (item.isMultiService ? (proportionalPlatformFee + proportionalServiceTax) : 0);
                
                const finalAmtToShow = item.isMultiService ? proportionalFinalAmount : (item.finalAmount || item.totalAmount || 0);

                return (
                  <TableRow key={`${item.id}-${item.multiServiceIndex || 0}`}>
                    <TableCell>{item.clientName || 'N/A'}</TableCell>
                    <TableCell>{item.serviceName || item.service?.name || 'N/A'}{item.isMultiService ? '*' : ''}</TableCell>
                    <TableCell>{item.staffName || item.staff?.fullName || 'N/A'}</TableCell>
                    <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}<br/>{item.startTime}</TableCell>
                    <TableCell>{item.duration || 'N/A'}m</TableCell>
                    <TableCell>₹{item.amount || 0}</TableCell>
                    <TableCell>₹{proportionalPlatformFee.toFixed(1)}</TableCell>
                    <TableCell>₹{proportionalServiceTax.toFixed(1)}</TableCell>
                    <TableCell className="font-bold">₹{finalAmtToShow.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${(item.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No bookings found.</TableCell>
              </TableRow>
            )}
            {paginatedAppointments.length > 0 && (
              <TableRow className="bg-muted font-bold text-primary">
                <TableCell colSpan={5}>TOTAL</TableCell>
                <TableCell>₹{paginatedAppointments.reduce((sum: number, a: any) => sum + (a.amount || 0), 0).toFixed(2)}</TableCell>
                <TableCell colSpan={2}></TableCell>
                <TableCell>₹{paginatedAppointments.reduce((sum: number, a: any) => sum + (a.finalAmount || a.totalAmount || 0), 0).toFixed(2)}</TableCell>
                <TableCell></TableCell>
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
