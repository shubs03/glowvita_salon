"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { useGetAllAppointmentsReportQuery } from '@repo/store/api';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from './exportUtils';

export const AllAppointmentsByStaffTable = ({ startDate, endDate, client, service, staff, status, bookingType, onFiltersChange, triggerRefresh }: any) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

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
    setCurrentPage(1);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel': exportToExcel(tableRef, 'all_appointments_by_staff'); break;
      case 'csv': exportToCSV(tableRef, 'all_appointments_by_staff'); break;
      case 'pdf': exportToPDF(tableRef, 'all_appointments_by_staff'); break;
      case 'copy': copyToClipboard(tableRef); break;
      case 'print': printTable(tableRef); break;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, client, service, staff, status, bookingType, triggerRefresh]);

  const staffSummary = useMemo(() => {
    if (!data || !data.data || !data.data.allAppointments || !Array.isArray(data.data.allAppointments.appointments)) return [];

    const staffMap = new Map();

    data.data.allAppointments.appointments.forEach((appointment: any) => {
      const staffName = appointment.staffName || 'Unassigned';

      if (!staffMap.has(staffName)) {
        staffMap.set(staffName, {
          staffName,
          totalAppointments: 0,
          totalDuration: 0,
          totalSale: 0
        });
      }

      const staffEntry = staffMap.get(staffName);
      staffEntry.totalAppointments += 1;

      if (appointment.duration) {
        staffEntry.totalDuration += appointment.duration;
      }

      const saleAmount = appointment.finalAmount || appointment.totalAmount || appointment.amount || 0;
      staffEntry.totalSale += saleAmount;
    });

    return Array.from(staffMap.values());
  }, [data]);

  const searchedStaff = useMemo(() => {
    if (!searchTerm) return staffSummary;
    return staffSummary.filter((staff: any) =>
      staff.staffName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffSummary, searchTerm]);

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
            <Input type="search" placeholder="Search staff..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
            <Input type="search" placeholder="Search staff..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button><Download className="mr-2 h-4 w-4" />Export</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('copy')}><Copy className="mr-2 h-4 w-4" />Copy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="mr-2 h-4 w-4" />CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}><Printer className="mr-2 h-4 w-4" />PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="text-center py-10">
          <div className="text-red-500 font-semibold">Error loading data</div>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
        <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showStatusFilter={true} />
      </div>
    );
  }

  return (
    <div ref={tableRef}>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search staff..." className="pl-8" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
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
                    {staff.totalDuration >= 60
                      ? `${Math.floor(staff.totalDuration / 60)} hr ${staff.totalDuration % 60} min`
                      : `${staff.totalDuration} min`}
                  </TableCell>
                  <TableCell>₹{staff.totalSale.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No appointments by staff data available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={totalItems} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterChange} cities={[]} initialFilters={filters} showStatusFilter={true} />
    </div>
  );
};
