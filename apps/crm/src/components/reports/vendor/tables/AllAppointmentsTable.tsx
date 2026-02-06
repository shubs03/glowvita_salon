"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
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
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const exportToExcel = () => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Appointments' });
    XLSX.writeFile(wb, 'all_appointments.xlsx');
  };

  const exportToCSV = () => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Appointments' });
    XLSX.writeFile(wb, 'all_appointments.csv');
  };

  const exportToPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('all_appointments.pdf');
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
      printWindow.document.write('<html><head><title>All Appointments</title>');
      printWindow.document.write('</head><body >');
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

  const filteredAppointments = data?.data?.allAppointments?.appointments || data?.data || [];
  const totalAppointments = data?.data?.allAppointments?.total || filteredAppointments.length || 0;

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

  const onlineAppointments = onlineAppointmentIds.size;
  const offlineAppointments = offlineAppointmentIds.size;

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
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
            />
          </div>
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="text-center py-4 text-red-500">
          Failed to load appointment data. Please try again.
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
              setCurrentPage(1);
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
        showStatusFilter={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border rounded-lg p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="border rounded-lg p-4 bg-green-50">
          <p className="text-sm text-gray-600">Online Bookings</p>
          <p className="text-2xl font-bold">{onlineAppointments}</p>
        </div>
        <div className="border rounded-lg p-4 bg-orange-50">
          <p className="text-sm text-gray-600">Offline Bookings</p>
          <p className="text-2xl font-bold">{offlineAppointments}</p>
        </div>
        <div className="border rounded-lg p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">₹{
            paginatedAppointments
              .filter((appt: any) => (appt.status || '').toLowerCase() === 'completed')
              .reduce((sum: number, appt: any) => sum + (appt.amount || 0), 0)
          }</p>
        </div>
        <div className="border rounded-lg p-4 bg-cyan-50">
          <p className="text-sm text-gray-600">Total Business</p>
          <p className="text-2xl font-bold">₹{
            Array.from(new Set(paginatedAppointments
              .filter((appt: any) => (appt.status || '').toLowerCase() === 'completed')
              .map((appt: any) => appt.id)))
              .reduce((sum: number, id: any) => {
                const appt = paginatedAppointments.find((a: any) => a.id === id && (a.status || '').toLowerCase() === 'completed');
                return sum + (appt?.finalAmount || appt?.totalAmount || 0);
              }, 0)
          }</p>
        </div>
      </div>

      <div className="text-lg font-medium">
        Total appointments: {
          Array.from(new Set<string>(paginatedAppointments.map((appt: any) => appt.id))).length
        }
      </div>

      <div className="text-sm text-gray-500 italic">
        * Multi-service appointments are shown individually for each service. Status with * indicates multi-service appointment.
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
              let proportionalPlatformFee = item.platformFee || 0;
              let proportionalServiceTax = item.serviceTax || 0;
              let proportionalFinalAmount = item.finalAmount || item.totalAmount || 0;

              if (item.isMultiService) {
                const ratio = item.amount && item.totalAmount ? item.amount / item.totalAmount : 0;
                proportionalPlatformFee = (item.platformFee || 0) * ratio;
                proportionalServiceTax = (item.serviceTax || 0) * ratio;
                proportionalFinalAmount = (item.amount || 0) + proportionalPlatformFee + proportionalServiceTax;
              }

              const showAmounts = true;

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

              const timeRange = item.startTime && item.endTime ?
                `${item.startTime} - ${item.endTime}` : 'N/A';

              let serviceName = item.serviceName || item.service?.name || 'N/A';
              if (item.isMultiService && item.multiServiceTotal) {
                serviceName = `${serviceName}(${item.multiServiceIndex + 1}/${item.multiServiceTotal})`;
              }

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
                  <TableCell>{showAmounts ? `₹${proportionalPlatformFee.toFixed(2)}` : ''}</TableCell>
                  <TableCell>{showAmounts ? `₹${proportionalServiceTax.toFixed(2)}` : ''}</TableCell>
                  <TableCell>{showAmounts ? `₹${proportionalFinalAmount.toFixed(2)}` : ''}</TableCell>
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

            <TableRow className="font-bold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell colSpan={6}></TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => {
                  let proportionalPlatformFee = item.platformFee || 0;
                  if (item.isMultiService) {
                    const ratio = item.amount && item.totalAmount ? item.amount / item.totalAmount : 0;
                    proportionalPlatformFee = (item.platformFee || 0) * ratio;
                  }
                  return sum + proportionalPlatformFee;
                }, 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => {
                  let proportionalServiceTax = item.serviceTax || 0;
                  if (item.isMultiService) {
                    const ratio = item.amount && item.totalAmount ? item.amount / item.totalAmount : 0;
                    proportionalServiceTax = (item.serviceTax || 0) * ratio;
                  }
                  return sum + proportionalServiceTax;
                }, 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedAppointments.reduce((sum: number, item: any) => {
                  let proportionalFinalAmount = item.finalAmount || item.totalAmount || 0;
                  if (item.isMultiService) {
                    const ratio = item.amount && item.totalAmount ? item.amount / item.totalAmount : 0;
                    const proportionalPlatformFee = (item.platformFee || 0) * ratio;
                    const proportionalServiceTax = (item.serviceTax || 0) * ratio;
                    proportionalFinalAmount = (item.amount || 0) + proportionalPlatformFee + proportionalServiceTax;
                  }
                  return sum + proportionalFinalAmount;
                }, 0).toFixed(2)}
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
