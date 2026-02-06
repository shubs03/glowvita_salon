"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Download, Search, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
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

  if (isLoading) return <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (isError) return <div className="text-center py-4 text-red-500 font-medium">Failed to load financial records.</div>;

  return (
    <div className="space-y-8">
      {/* 1. High-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50/30 border-blue-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Owed from Admin</p>
            <p className="text-2xl font-bold text-blue-900">₹{totals.totalAdminOwesVendor?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-blue-500 mt-1">From Online Bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50/30 border-orange-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">Payable to Admin</p>
            <p className="text-2xl font-bold text-orange-900">₹{totals.totalVendorOwesAdmin?.toFixed(2) || '0.00'}</p>
            <div className="flex gap-2 mt-1">
              <p className="text-[10px] text-orange-500 font-medium tracking-tight">Fee: ₹{totals.totalPlatformFee?.toFixed(1)}</p>
              <p className="text-[10px] text-orange-500 font-medium tracking-tight">Tax: ₹{totals.totalTaxAmount?.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/30 border-green-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Total Net Transfers</p>
            <p className="text-2xl font-bold text-green-900">₹{Math.abs(totals.totalTransferredToVendor - totals.totalTransferredToAdmin || 0).toFixed(2)}</p>
            <p className="text-xs text-green-500 mt-1">Actual Money Moved</p>
          </CardContent>
        </Card>

        <Card className={`${(totals.finalBalance || 0) >= 0 ? "bg-primary/10 border-primary/20" : "bg-red-50 border-red-100"} shadow-md`}>
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase mb-2 tracking-tight">Net Outstanding Balance</p>
            <p className={`text-2xl font-black ${(totals.finalBalance || 0) >= 0 ? "text-primary" : "text-red-700"}`}>
              ₹{Math.abs(totals.finalBalance || 0).toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`h-2 w-2 rounded-full ${(totals.finalBalance || 0) >= 0 ? "bg-primary" : "bg-red-500"}`}></span>
              <p className="text-xs font-semibold opacity-90">
                {(totals.finalBalance || 0) >= 0 ? "Admin owes Vendor" : "Vendor owes Admin"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Ledger (Actual Transfers) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            Actual Money Transfers
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Execution Date</TableHead>
                <TableHead className="font-bold">Transaction Type</TableHead>
                <TableHead className="font-bold">Payment Method</TableHead>
                <TableHead className="font-bold">Transaction Reference</TableHead>
                <TableHead className="text-right font-bold">Transfer Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                    No bank transfers found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((t: any) => (
                  <TableRow key={t._id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="text-sm">{new Date(t.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold px-2 ${t.type === "Payment to Vendor" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                      >
                        {t.type === "Payment to Vendor" ? "IN: FROM ADMIN" : "OUT: TO ADMIN"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{t.paymentMethod}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground font-mono">{t.transactionId || '—'}</TableCell>
                    <TableCell className={`text-right text-sm font-black ${t.type === "Payment to Vendor" ? "text-green-600" : "text-red-600"}`}>
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

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="text-[11px] uppercase font-bold">Date</TableHead>
                    <TableHead className="text-[11px] uppercase font-bold">Client & Service</TableHead>
                    <TableHead className="text-[11px] uppercase font-bold">Mode</TableHead>
                    <TableHead className="text-right text-[11px] uppercase font-bold">Owed from Admin</TableHead>
                    <TableHead className="text-right text-[11px] uppercase font-bold">Payable to Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSettlements.map((s: any) => (
                    <TableRow key={s.settlementId} className="text-xs">
                      <TableCell className="whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-bold">{s.clientName}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{s.serviceName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{s.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-bold">
                        ₹{s.adminOwesVendor?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-orange-600 font-bold">₹{s.vendorOwesAdmin?.toFixed(2)}</div>
                        {s.vendorOwesAdmin > 0 && (
                          <div className="text-[8px] text-muted-foreground leading-none mt-0.5">
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
