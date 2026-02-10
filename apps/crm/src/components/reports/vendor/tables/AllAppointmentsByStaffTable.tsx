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
import { useGetAllAppointmentsReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface AllAppointmentsByStaffTableProps {
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

// Export functionality helper functions
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

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  // Use html2canvas to capture only the table
  const canvas = await html2canvas(table);
  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF();
  const imgWidth = pdf.internal.pageSize.getWidth() - 20; // Add some margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight); // Add margins
  pdf.save(`${fileName}.pdf`);
};

const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
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

const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>All Appointments by Staff</title>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(tableRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const AllAppointmentsByStaffTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: AllAppointmentsByStaffTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  // Use the RTK Query hook to fetch real data
  const { data, isLoading, isError, refetch } = useGetAllAppointmentsReportQuery({
    period: startDate && endDate ? 'custom' : 'all',
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
    setCurrentPage(1); // Reset to first page when filters change

    // Notify parent component about filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Export functions
  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, 'all_appointments_by_staff');
        break;
      case 'csv':
        exportToCSV(tableRef, 'all_appointments_by_staff');
        break;
      case 'pdf':
        exportToPDF(tableRef, 'all_appointments_by_staff');
        break;
      case 'copy':
        copyToClipboard(tableRef);
        break;
      case 'print':
        printTable(tableRef);
        break;
      default:
        break;
    }
  };

  // Trigger refetch when filter values change or when explicitly triggered
  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  // Aggregate appointments by staff
  const staffSummary = useMemo(() => {
    // Check if data exists and has the expected structure
    if (!data || !data.data || !data.data.allAppointments || !Array.isArray(data.data.allAppointments.appointments)) return [];

    // Create a map to store staff data
    const staffMap = new Map();

    // Process each appointment
    data.data.allAppointments.appointments.forEach((appointment: any) => {
      const staffName = appointment.staffName || 'Unassigned';

      // Get or create staff entry
      if (!staffMap.has(staffName)) {
        staffMap.set(staffName, {
          staffName,
          totalAppointments: 0,
          totalDuration: 0,
          totalSale: 0
        });
      }

      const staffEntry = staffMap.get(staffName);

      // Increment appointment count
      staffEntry.totalAppointments += 1;

      // Add duration (in minutes)
      if (appointment.duration) {
        staffEntry.totalDuration += appointment.duration;
      }

      // Add sale amount (use finalAmount if available, otherwise totalAmount, otherwise amount)
      const saleAmount = appointment.finalAmount || appointment.totalAmount || appointment.amount || 0;
      staffEntry.totalSale += saleAmount;
    });

    // Convert map to array
    return Array.from(staffMap.values());
  }, [data]);

  // Filter data based on search term
  const searchedStaff = useMemo(() => {
    if (!searchTerm) return staffSummary;

    return staffSummary.filter((staff: any) =>
      staff.staffName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffSummary, searchTerm]);

  // Pagination logic
  const totalItems = searchedStaff.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = searchedStaff.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead>Total Duration</TableHead>
                <TableHead>Total Sale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
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
            <Input
              type="search"
              placeholder="Search staff..."
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
                  <Printer className="mr-2 h-4 w-4" />
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
        <div className="text-center py-10">
          <div className="text-red-500 font-semibold">Error loading data</div>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={[]}
          initialFilters={filters}
          showStatusFilter={true}
        />
      </div>
    );
  }

  return (
    <div ref={tableRef}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search staff..."
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Total Appointments</TableHead>
              <TableHead>Total Duration</TableHead>
              <TableHead>Total Sale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStaff.length > 0 ? (
              paginatedStaff.map((staff: any, index: number) => (
                <TableRow key={`${staff.staffName}-${index}`}>
                  <TableCell className="font-medium">{staff.staffName}</TableCell>
                  <TableCell>{staff.totalAppointments}</TableCell>
                  <TableCell>
                    {/* Convert minutes to hours and minutes */}
                    {staff.totalDuration >= 60
                      ? `${Math.floor(staff.totalDuration / 60)} hr ${staff.totalDuration % 60} min`
                      : `${staff.totalDuration} min`}
                  </TableCell>
                  <TableCell>₹{staff.totalSale.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No appointments by staff data available.
                </TableCell>
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
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={[]}
        initialFilters={filters}
        showStatusFilter={true}
      />
    </div>
  );
};
