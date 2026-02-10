"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetCancelledAppointmentsReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

export const CancelledAppointmentsTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: any) => {
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
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const exportToExcel = () => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Cancelled Appointments' });
    XLSX.writeFile(wb, 'cancelled_appointments.xlsx');
  };

  const exportToCSV = () => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Cancelled Appointments' });
    XLSX.writeFile(wb, 'cancelled_appointments.csv');
  };

  const exportToPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('cancelled_appointments.pdf');
  };

  const copyToClipboard = () => {
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

  const printTable = () => {
    if (!tableRef.current) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Cancelled Appointments</title></head><body>');
      printWindow.document.write(tableRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel': exportToExcel(); break;
      case 'csv': exportToCSV(); break;
      case 'pdf': exportToPDF(); break;
      case 'copy': copyToClipboard(); break;
      case 'print': printTable(); break;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const filteredAppointments = data?.data?.cancellations?.cancellations || data?.data || [];

  const searchedAppointments = useMemo(() => {
    if (!searchTerm) return filteredAppointments;
    return filteredAppointments.filter((appointment: any) =>
      Object.values(appointment).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredAppointments, searchTerm]);

  const totalItems = searchedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = searchedAppointments.slice(startIndex, endIndex);

  const onlineAppointmentIds = new Set();
  const offlineAppointmentIds = new Set();

  paginatedAppointments.forEach((appt: any) => {
    const mode = appt.mode || '';
    if (mode.toLowerCase() === 'online') {
      onlineAppointmentIds.add(appt.id);
    } else if (mode.toLowerCase() === 'offline') {
      offlineAppointmentIds.add(appt.id);
    }
  });

  const uniqueAppointmentIds = new Set(paginatedAppointments.map((appt: any) => appt.id));
  const totalCancelled = uniqueAppointmentIds.size;
  const onlineCancelled = onlineAppointmentIds.size;
  const offlineCancelled = offlineAppointmentIds.size;
  const totalRevenueLoss = Array.from(uniqueAppointmentIds as Set<string>).reduce((sum: number, id: string) => {
    const appointment = paginatedAppointments.find((appt: any) => appt.id === id);
    return sum + (appointment?.amount || 0);
  }, 0);

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
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-red-500">Failed to load cancelled appointments data. Please try again.</div>
      </div>
    );
  }

  if (paginatedAppointments.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
        <div className="text-center py-4 text-gray-500">No cancelled appointments data available.</div>
        <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showStatusFilter={true} hideClientFilter={false} hideServiceFilter={false} hideStaffFilter={false} hideBookingTypeFilter={false} />
      </div>
    );
  }

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

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Total Cancelled</p>
          <p className="text-2xl font-bold">{totalCancelled}</p>
        </div>
        <div className="border rounded-lg p-4 bg-green-50">
          <p className="text-sm text-gray-600">Online Cancelled</p>
          <p className="text-2xl font-bold">{onlineCancelled}</p>
        </div>
        <div className="border rounded-lg p-4 bg-orange-50">
          <p className="text-sm text-gray-600">Offline Cancelled</p>
          <p className="text-2xl font-bold">{offlineCancelled}</p>
        </div>
        <div className="border rounded-lg p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Revenue Loss</p>
          <p className="text-2xl font-bold">₹{totalRevenueLoss.toFixed(2)}</p>
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
              <TableHead>Cancelled By</TableHead>
              <TableHead>Cancelled On</TableHead>
              <TableHead>Base Amount</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Service Tax</TableHead>
              <TableHead>Final Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((item: any) => {
              const convertToDate = (dateValue: any): Date | null => {
                if (!dateValue) return null;
                if (dateValue instanceof Date) return dateValue;
                if (typeof dateValue === 'object' && dateValue.$date) return new Date(dateValue.$date);
                if (typeof dateValue === 'string') return new Date(dateValue);
                if (typeof dateValue === 'number') return new Date(dateValue);
                return null;
              };

              const scheduledDateValue = convertToDate(item.scheduledDate);
              const scheduledDate = scheduledDateValue ? scheduledDateValue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
              const createdDateValue = convertToDate(item.createdAt);
              const createdDate = createdDateValue ? createdDateValue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
              const timeRange = item.startTime ? `${item.startTime} - ${item.endTime || item.startTime}` : 'N/A';
              const cancelledOnValue = convertToDate(item.cancelledDate);
              const cancelledOn = cancelledOnValue ? cancelledOnValue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

              let cancelledBy = 'N/A';
              if (item.reason && item.reason.toLowerCase().includes('automatically cancelled')) {
                cancelledBy = 'Not Attended';
              } else if (item.mode === 'online' && item.clientName) {
                cancelledBy = 'User';
              } else {
                cancelledBy = 'Vendor';
              }

              let serviceName = item.serviceName || item.service?.name || 'N/A';
              if (item.isMultiService && item.multiServiceTotal) {
                serviceName = `${serviceName}(${item.multiServiceIndex + 1}/${item.multiServiceTotal})`;
              }

              return (
                <TableRow key={`${item.id}-${item.multiServiceIndex || 0}`}>
                  <TableCell>{item.clientName || 'N/A'}</TableCell>
                  <TableCell>{serviceName}</TableCell>
                  <TableCell>{item.staffName || item.staff?.fullName || 'N/A'}</TableCell>
                  <TableCell>{scheduledDate}</TableCell>
                  <TableCell>{createdDate}</TableCell>
                  <TableCell>{timeRange}</TableCell>
                  <TableCell>{cancelledBy}</TableCell>
                  <TableCell>{cancelledOn}</TableCell>
                  <TableCell>₹{item.amount || 0}</TableCell>
                  <TableCell>₹{item.platformFee || 0}</TableCell>
                  <TableCell>₹{item.serviceTax || 0}</TableCell>
                  <TableCell>₹{item.finalAmount || item.totalAmount || 0}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-bold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell colSpan={7}></TableCell>
              <TableCell>₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.amount || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.platformFee || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.serviceTax || 0), 0).toFixed(2)}</TableCell>
              <TableCell>₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.finalAmount || item.totalAmount || 0), 0).toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={totalItems} />
    </div>
  );
};
