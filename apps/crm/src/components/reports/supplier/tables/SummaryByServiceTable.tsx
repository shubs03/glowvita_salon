"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetSummaryByServiceReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

export const SummaryByServiceTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: any) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  // Use the RTK Query hook to fetch real data
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
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Service Summary' });
    XLSX.writeFile(wb, 'summary_by_service.xlsx');
  };

  const exportToCSV = () => {
    if (!tableRef.current) return;

    const table = tableRef.current.querySelector('table');
    if (!table) return;

    // Get table data
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Service Summary' });
    XLSX.writeFile(wb, 'summary_by_service.csv');
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
    pdf.save('summary_by_service.pdf');
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
      printWindow.document.write('<html><head><title>Appointment Summary by Service</title>');
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
  }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  // Extract services from the API response
  const services = data?.data?.summaryByService || data?.data || [];

  // Filter data based on search term
  const searchedServices = useMemo(() => {
    if (!searchTerm) return services;

    return services.filter((service: any) =>
      Object.values(service).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [services, searchTerm]);

  // Pagination logic
  const totalItems = searchedServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = searchedServices.slice(startIndex, endIndex);

  // Calculate total appointments for percentage calculation
  const totalAppointments = paginatedServices.reduce((sum: number, service: any) => sum + (service.count || service.appointmentCount || 0), 0);

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
          Failed to load service summary data. Please try again.
        </div>
      </div>
    );
  }

  if (paginatedServices.length === 0) {
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
          No sales by service data available.
        </div>
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
      />

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Total Appointments</TableHead>
              <TableHead>Total Sale</TableHead>
              <TableHead>Total Duration</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((item: any, index: number) => {
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
                      <span className="mr-2">{percentage.toFixed(1)}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
