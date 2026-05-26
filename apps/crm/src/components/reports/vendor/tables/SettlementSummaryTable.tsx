"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Download, Search, ChevronUp, ChevronDown, Loader2, Copy, FileText, FileSpreadsheet, Printer, Wallet, ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Badge } from "@repo/ui/badge";
import { Skeleton } from "@repo/ui/skeleton";
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
  const table = tableRef.current.querySelector('.settlements-table table') || 
                tableRef.current.querySelector('.transfers-table table') || 
                tableRef.current.querySelector('table');
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('.settlements-table table') || 
                tableRef.current.querySelector('.transfers-table table') || 
                tableRef.current.querySelector('table');
  if (!table) return;
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.csv`);
};

const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('.settlements-table table') || 
                tableRef.current.querySelector('.transfers-table table') || 
                tableRef.current.querySelector('table');
  if (!table) return;
  const canvas = await html2canvas(table as HTMLElement);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgWidth = pdf.internal.pageSize.getWidth() - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  pdf.save(`${fileName}.pdf`);
};

const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;
  const table = tableRef.current.querySelector('.settlements-table table') || 
                tableRef.current.querySelector('.transfers-table table') || 
                tableRef.current.querySelector('table');
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
  const table = tableRef.current.querySelector('.settlements-table table') || 
                tableRef.current.querySelector('.transfers-table table') || 
                tableRef.current.querySelector('table');
  if (!table) return;
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Settlement Report</title>');
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

  useEffect(() => { refetch(); }, [refetch, startDate, endDate, triggerRefresh]);

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
  const paginatedSettlements = filteredSettlements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = (format: string) => {
    const fileName = 'settlement_report';
    switch (format) {
      case 'copy': copyToClipboard(tableRef); break;
      case 'excel': exportToExcel(tableRef, fileName); break;
      case 'csv': exportToCSV(tableRef, fileName); break;
      case 'pdf': exportToPDF(tableRef, fileName); break;
      case 'print': printTable(tableRef); break;
    }
  };

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
    return <div className="text-center py-4 text-red-500">Failed to load financial records.</div>;
  }

  return (
    <div className="space-y-6" ref={tableRef}>
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

      {/* Formula Display */}
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
        <p className="text-sm font-medium text-primary">
          Formula: <span className="text-muted-foreground italic">Net Balance = (Owed from Admin) - (Payable to Admin) + (Net Transfers)</span>
        </p>
      </div>

      {/* High-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Owed from Admin</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totals.totalAdminOwesVendor?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">From Online Bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payable to Admin</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totals.totalVendorOwesAdmin?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">Fee: ₹{totals.totalPlatformFee?.toFixed(1)} | Tax: ₹{totals.totalTaxAmount?.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Transfers</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{Math.abs(totals.totalTransferredToVendor - totals.totalTransferredToAdmin || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Actual Money Moved</p>
          </CardContent>
        </Card>

        <Card className={(totals.finalBalance || 0) >= 0 ? "bg-green-50/50" : "bg-red-50/50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
            <Scale className={`h-4 w-4 ${(totals.finalBalance || 0) >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totals.finalBalance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{Math.abs(totals.finalBalance || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(totals.finalBalance || 0) >= 0 ? "Admin owes Vendor" : "Vendor owes Admin"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Money Transfers
        </h3>
        <div className="rounded-md border transfers-table overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No bank transfers found.</TableCell>
                </TableRow>
              ) : (
                transfers.map((t: any) => (
                  <TableRow key={t._id}>
                    <TableCell className="text-xs">{new Date(t.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.type === "Payment to Vendor" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {t.type === "Payment to Vendor" ? "INCOMING" : "OUTGOING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{t.paymentMethod}</TableCell>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">{t.transactionId || '—'}</TableCell>
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

      {/* Detailed Breakdown */}
      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center group py-4 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAppointmentDetails(!showAppointmentDetails)}
        >
          <span className="font-bold">Detailed Appointment Settlements ({settlements.length})</span>
          {showAppointmentDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showAppointmentDetails && (
          <div className="mt-4 space-y-4 settlements-table animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Date</TableHead>
                    <TableHead>Client & Service</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Owed from Admin</TableHead>
                    <TableHead className="text-right">Payable to Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSettlements.map((s: any) => (
                    <TableRow key={s.settlementId}>
                      <TableCell className="text-xs">{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium text-xs">{s.clientName}</div>
                        <div className="text-[10px] text-muted-foreground">{s.serviceName}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{s.paymentMethod}</Badge></TableCell>
                      <TableCell className="text-right text-green-600 font-bold text-xs">₹{s.adminOwesVendor?.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-orange-600 font-bold text-xs">
                        ₹{s.vendorOwesAdmin?.toFixed(2)}
                        {s.vendorOwesAdmin > 0 && <div className="text-[8px] text-muted-foreground font-normal">(Fee: {s.platformFee?.toFixed(1)} + Tax: {s.serviceTax?.toFixed(1)})</div>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-2">
              <p className="text-xs text-muted-foreground">Showing {paginatedSettlements.length} of {totalItems} records</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
