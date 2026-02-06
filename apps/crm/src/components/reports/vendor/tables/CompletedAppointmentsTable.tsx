"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Pagination } from "@repo/ui/pagination";
import { Badge } from "@repo/ui/badge";
import { Download, Eye, DollarSign, Users, UserPlus, ShoppingCart, Search, Calendar, Copy, FileText, FileSpreadsheet, Printer, Filter, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { useGetCompletedAppointmentsReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface CompletedAppointmentsTableProps {
  startDate?: string;
  endDate?: string;
  client?: string;
  service?: string;
  staff?: string;
  bookingType?: string;
  onFiltersChange?: (filters: FilterParams) => void;
  triggerRefresh?: any;
}

export const CompletedAppointmentsTable = ({ startDate, endDate, client, service, staff, bookingType, onFiltersChange, triggerRefresh }: CompletedAppointmentsTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  // Use the RTK Query hook to fetch real data
  const { data, isLoading, isError, refetch } = useGetCompletedAppointmentsReportQuery({
    period: 'custom',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    client: client && client !== 'all' ? client : undefined,
    service: service && service !== 'all' ? service : undefined,
    staff: staff && staff !== 'all' ? staff : undefined,
    bookingType: bookingType && bookingType !== 'all' ? bookingType : undefined
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change

    // Notify parent component about filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Export functions
  const exportToExcel = () => {
    if (!tableRef.current) return;

    const table = tableRef.current.querySelector('table');
    if (!table) return;

    // Get table data
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Completed Appointments' });
    XLSX.writeFile(wb, 'completed_appointments.xlsx');
  };

  const exportToCSV = () => {
    if (!tableRef.current) return;

    const table = tableRef.current.querySelector('table');
    if (!table) return;

    // Get table data
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Completed Appointments' });
    XLSX.writeFile(wb, 'completed_appointments.csv');
  };

  const exportToPDF = async () => {
    if (!tableRef.current) return;

    // Use html2canvas to capture the table
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF();
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('completed_appointments.pdf');
  };

  const copyToClipboard = () => {
    if (!tableRef.current) return;

    const table = tableRef.current.querySelector('table');
    if (!table) return;

    // Get table HTML
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();

    // Show success message (you might want to implement a toast notification)
    alert('Table copied to clipboard!');
  };

  const printTable = () => {
    if (!tableRef.current) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Completed Appointments</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(tableRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'copy':
        copyToClipboard();
        break;
      case 'print':
        printTable();
        break;
      default:
        break;
    }
  };

  // Trigger refetch when filter values change or when explicitly triggered
  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, client, service, staff, bookingType, triggerRefresh]);

  // Extract appointments from the API response (already filtered by backend)
  const filteredAppointments = data?.data?.complete?.appointments || data?.data || [];

  // Filter data based on search term
  const searchedAppointments = useMemo(() => {
    if (!searchTerm) return filteredAppointments;

    return filteredAppointments.filter((appointment: any) =>
      Object.values(appointment).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredAppointments, searchTerm]);

  // Pagination logic
  const totalItems = searchedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = searchedAppointments.slice(startIndex, endIndex);

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
                <DropdownMenuItem onClick={() => handleExport('copy')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
        <div className="text-center py-4 text-red-500">
          Failed to load completed appointments data. Please try again.
        </div>
      </div>
    );
  }

  if (paginatedAppointments.length === 0) {
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
        <div className="text-center py-4 text-gray-500">
          No completed appointments data available.
        </div>
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={[]}
          initialFilters={filters}
          showStatusFilter={false}
          hideClientFilter={false}
          hideServiceFilter={false}
          hideStaffFilter={false}
          hideBookingTypeFilter={false}
        />
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
              <DropdownMenuItem onClick={() => handleExport('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('print')}>
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
        cities={[]}
        initialFilters={filters}
        showStatusFilter={false}
        hideClientFilter={false}
        hideServiceFilter={false}
        hideStaffFilter={false}
        hideBookingTypeFilter={false}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg p-4 bg-primary/10">
          <p className="text-sm text-gray-600">Total Completed</p>
          <p className="text-2xl font-bold">{
            // Count unique appointments, treating multi-service appointments as one
            Array.from(new Set<string>(paginatedAppointments.map((appt: any) => appt._id || appt.id))).length
          }</p>
        </div>
        <div className="border rounded-lg p-4 bg-primary/5">
          <p className="text-sm text-gray-600">Online Completed</p>
          <p className="text-2xl font-bold">{
            // Count unique online appointments
            Array.from(
              new Set<string>(
                paginatedAppointments
                  .filter((appt: any) => (appt.mode || '').toLowerCase() === 'online')
                  .map((appt: any) => appt._id || appt.id)
              )
            ).length
          }</p>
        </div>
        <div className="border rounded-lg p-4 bg-secondary/20">
          <p className="text-sm text-gray-600">Offline Completed</p>
          <p className="text-2xl font-bold">{
            // Count unique offline appointments
            Array.from(
              new Set<string>(
                paginatedAppointments
                  .filter((appt: any) => (appt.mode || '').toLowerCase() === 'offline')
                  .map((appt: any) => appt._id || appt.id)
              )
            ).length
          }</p>
        </div>
        <div className="border rounded-lg p-4 bg-secondary/10">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">₹{
            // Calculate revenue from all appointments (already filtered as completed)
            // For multi-service appointments, sum the base amounts of all services
            paginatedAppointments.reduce((sum: number, appt: any) => sum + (appt.amount || 0), 0)
          }</p>
        </div>
      </div>

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Scheduled On</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Amount</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Service Tax</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead>Status</TableHead>



            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((item: any) => {
              // Format dates
              const scheduledDate = item.date ? new Date(item.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'N/A';

              const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'N/A';

              // Format time range
              const timeRange = item.startTime && item.endTime ?
                `${item.startTime} - ${item.endTime}` : 'N/A';

              // Format service name for multi-service appointments
              let serviceName = item.serviceName || item.service?.name || 'N/A';
              if (item.isMultiService && item.multiServiceTotal) {
                serviceName = `${serviceName}(${item.multiServiceIndex + 1}/${item.multiServiceTotal})`;
              }

              // Format status with asterisk for multi-service appointments
              const statusText = item.isMultiService ? `${item.status}*` : item.status || 'N/A';

              return (
                <TableRow key={`${item.id}-${item.multiServiceIndex || 0}`}>
                  <TableCell>{item.clientName || 'N/A'}</TableCell>
                  <TableCell>{serviceName}</TableCell>
                  <TableCell>{item.staffName || item.staff?.fullName || 'N/A'}</TableCell>
                  <TableCell>{scheduledDate}</TableCell>
                  <TableCell>{createdDate}</TableCell>
                  <TableCell>{timeRange}</TableCell>
                  <TableCell>{item.duration || item.totalDuration || 'N/A'} mins</TableCell>
                  <TableCell>₹{item.amount || 0}</TableCell>
                  <TableCell>₹{item.platformFee || 0}</TableCell>
                  <TableCell>₹{item.serviceTax || 0}</TableCell>
                  <TableCell>₹{item.finalAmount || item.totalAmount || 0}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${(item.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      (item.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        (item.status || '').toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                          (item.status || '').toLowerCase() === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            (item.status || '').toLowerCase() === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                      }`}>
                      {statusText}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Total Row */}
            <TableRow className="font-bold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell colSpan={6}></TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.platformFee || 0), 0)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.serviceTax || 0), 0)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.finalAmount || item.totalAmount || 0), 0)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
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
