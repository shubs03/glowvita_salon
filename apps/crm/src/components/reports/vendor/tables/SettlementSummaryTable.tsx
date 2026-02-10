"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Download, Search, ChevronUp, ChevronDown, Loader2, Copy, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Badge } from "@repo/ui/badge";
import { useGetSettlementSummaryReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SettlementSummaryTableProps {
  startDate?: string;
  endDate?: string;
  triggerRefresh?: number;
}

// Export functionality functions
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

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const SettlementSummaryTable = ({ startDate, endDate, triggerRefresh }: SettlementSummaryTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetSettlementSummaryReportQuery({
    period: 'custom',
    startDate: startDate,
    endDate: endDate
  });

  useEffect(() => {
    refetch();
  }, [refetch, startDate, endDate, triggerRefresh]);

  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const totals = data?.data?.settlementSummary?.totals || {};
  const settlements = data?.data?.settlementSummary?.appointments || [];
  const transfers = data?.data?.settlementSummary?.transfers || [];

  const filteredSettlements = useMemo(() => {
    if (!searchTerm) return settlements;
    return settlements.filter((s: any) =>
      (s.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [settlements, searchTerm]);

  const totalItems = filteredSettlements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSettlements = filteredSettlements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = (format: string) => {
    switch (format) {
      case 'copy': copyToClipboard(tableRef); break;
      case 'excel': exportToExcel(tableRef, 'settlement_report.xlsx'); break;
      case 'csv': exportToCSV(tableRef, 'settlement_report.csv'); break;
      case 'pdf': exportToPDF(tableRef, 'settlement_report.pdf'); break;
      case 'print': printTable(tableRef); break;
    }
  };

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
          <div className="flex gap-2">
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
        <div className="text-center py-4 text-red-500">
          Failed to load financial records. Please try again.
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

      {/* High-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg p-4 bg-primary/10">
          <p className="text-sm text-gray-600">Owed from Admin</p>
          <p className="text-2xl font-bold">₹{totals.totalAdminOwesVendor?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">From Online Bookings</p>
        </div>

        <div className="border rounded-lg p-4 bg-primary/5">
          <p className="text-sm text-gray-600">Payable to Admin</p>
          <p className="text-2xl font-bold">₹{totals.totalVendorOwesAdmin?.toFixed(2) || '0.00'}</p>
          <div className="flex gap-2 mt-1">
            <p className="text-xs text-gray-500">Fee: ₹{totals.totalPlatformFee?.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Tax: ₹{totals.totalTaxAmount?.toFixed(1)}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-secondary/20">
          <p className="text-sm text-gray-600">Total Net Transfers</p>
          <p className="text-2xl font-bold">₹{Math.abs(totals.totalTransferredToVendor - totals.totalTransferredToAdmin || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Actual Money Moved</p>
        </div>

        <div className="border rounded-lg p-4 bg-secondary/10">
          <p className="text-sm text-gray-600">Net Outstanding Balance</p>
          <p className={`text-2xl font-bold ${(totals.finalBalance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            ₹{Math.abs(totals.finalBalance || 0).toFixed(2)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`h-2 w-2 rounded-full ${(totals.finalBalance || 0) >= 0 ? "bg-green-600" : "bg-red-600"}`}></span>
            <p className="text-xs text-gray-500">
              {(totals.finalBalance || 0) >= 0 ? "Admin owes Vendor" : "Vendor owes Admin"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Ledger (Actual Transfers) */}
      <div className="space-y-4">
        <div className="text-lg font-medium">
          Actual Money Transfers
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Execution Date</TableHead>
                <TableHead>Transaction Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction Reference</TableHead>
                <TableHead className="text-right">Transfer Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500 italic">
                    No bank transfers found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((t: any) => (
                  <TableRow key={t._id}>
                    <TableCell>{new Date(t.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={t.type === "Payment to Vendor" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                      >
                        {t.type === "Payment to Vendor" ? "IN: FROM ADMIN" : "OUT: TO ADMIN"}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.paymentMethod}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{t.transactionId || '—'}</TableCell>
                    <TableCell className={`text-right font-bold ${t.type === "Payment to Vendor" ? "text-green-600" : "text-red-600"}`}>
                      ₹{t.amount?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Collapsible Appointment Breakdown */}
      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center group py-6 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAppointmentDetails(!showAppointmentDetails)}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">Detailed Appointment Settlements</span>
            <Badge variant="outline" className="text-[10px]">{settlements.length} Records</Badge>
          </div>
          {showAppointmentDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />}
        </Button>

        {showAppointmentDetails && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by Client or Service..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client & Service</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Owed from Admin</TableHead>
                    <TableHead className="text-right">Payable to Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSettlements.map((s: any) => (
                    <TableRow key={s.settlementId}>
                      <TableCell className="whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{s.clientName}</div>
                        <div className="text-xs text-gray-500">{s.serviceName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{s.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-bold">
                        ₹{s.adminOwesVendor?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-orange-600 font-bold">₹{s.vendorOwesAdmin?.toFixed(2)}</div>
                        {s.vendorOwesAdmin > 0 && (
                          <div className="text-xs text-gray-500">
                            (Fee: {s.platformFee?.toFixed(1)}, Tax: {s.serviceTax?.toFixed(1)})
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-4 py-2">
                <p className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
