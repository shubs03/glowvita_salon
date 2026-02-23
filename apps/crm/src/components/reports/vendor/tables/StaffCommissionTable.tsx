"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Badge } from "@repo/ui/badge";
import { Download, Search, FileText, FileSpreadsheet, Printer, Copy, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pagination } from "@repo/ui/pagination";

interface Transaction {
    transactionId: string;
    transactionDate: string;
    appointmentId: string;
    client: string;
    serviceName: string;
    appointmentAmount: number;
    commissionRate: number;
    commissionEarned: number;
    type: 'CREDIT' | 'DEBIT';
    notes: string;
}

interface StaffCommissionData {
    staffName: string;
    commissionRate: string;
    totalCommissionEarned: number;
    totalPaidOut: number;
    netCommissionBalance: number;
    commissionCount: number;
    lastTransactionDate: string;
    transactions: Transaction[];
}

interface StaffCommissionTableProps {
    startDate?: string;
    endDate?: string;
    staff?: string;
    onFiltersChange?: (filters: any) => void;
    triggerRefresh?: any;
}

export const StaffCommissionTable = ({ startDate, endDate, staff, onFiltersChange, triggerRefresh }: StaffCommissionTableProps) => {
    const [staffData, setStaffData] = useState<StaffCommissionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaffName, setSelectedStaffName] = useState<string | null>(null); // Track selected staff by name for modal
    const tableRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [summarySearch, setSummarySearch] = useState('');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const summaryTableRef = useRef<HTMLDivElement>(null);
    const historyTableRef = useRef<HTMLDivElement>(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                if (staff) params.append('staff', staff);

                const response = await fetch(`/api/crm/reports/vendor/staff-commission?${params.toString()}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch staff commission data (${response.status})`);
                }
                const data = await response.json();
                setStaffData(data);

                // If a staff was selected and data refreshed, ensure we still have valid selection or reset if staff not found
                if (selectedStaffName) {
                    const stillExists = data.find((s: StaffCommissionData) => s.staffName === selectedStaffName);
                    if (!stillExists && data.length > 0) {
                        // selected staff disappeared from list (e.g. filter change), maybe close modal or select first?
                        // For now, keep as is or close modal if open.
                        if (isHistoryModalOpen) setIsHistoryModalOpen(false);
                    }
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, staff, triggerRefresh]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [summarySearch]);

    const activeStaffData = useMemo(() => {
        if (!staffData || staffData.length === 0) return null;
        return staffData.find(s => s.staffName === selectedStaffName) || staffData[0];
    }, [staffData, selectedStaffName]);

    const filteredSummary = useMemo(() => {
        if (!staffData) return [];
        if (!summarySearch) return staffData;
        return staffData.filter(s =>
            s.staffName.toLowerCase().includes(summarySearch.toLowerCase())
        );
    }, [staffData, summarySearch]);

    // Pagination logic
    const totalItems = filteredSummary.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSummary = filteredSummary.slice(startIndex, endIndex);

    const filteredTransactions = useMemo(() => {
        if (!activeStaffData) return [];
        if (!searchTerm) return activeStaffData.transactions;
        return activeStaffData.transactions.filter(t =>
            t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeStaffData, searchTerm]);

    const handleViewHistory = (staffName: string) => {
        setSelectedStaffName(staffName);
        setIsHistoryModalOpen(true);
    };

    // Export functions
    const handleExport = (format: string, type: 'summary' | 'history' = 'history') => {
        const ref = type === 'summary' ? summaryTableRef : historyTableRef;
        if (!ref.current) return;

        if (type === 'history' && !activeStaffData) return;

        const fileName = type === 'summary'
            ? 'staff_commission_summary'
            : `staff_commission_${activeStaffData?.staffName.toLowerCase().replace(' ', '_')}`;

        const table = ref.current.querySelector('table');
        if (!table) return;

        if (format === 'excel') {
            const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
            XLSX.writeFile(wb, `${fileName}.xlsx`);
        } else if (format === 'csv') {
            const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
            XLSX.writeFile(wb, `${fileName}.csv`);
        } else if (format === 'pdf') {
            html2canvas(table).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const imgWidth = pdf.internal.pageSize.getWidth() - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save(`${fileName}.pdf`);
            });
        } else if (format === 'copy') {
            const range = document.createRange();
            range.selectNode(table);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            document.execCommand('copy');
            window.getSelection()?.removeAllRanges();
            alert('Table copied to clipboard!');
        } else if (format === 'print') {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${type === 'summary' ? 'Staff Summary' : 'Staff Commission - ' + activeStaffData?.staffName}</title></head><body>`);
                printWindow.document.write(ref.current.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    if (loading && staffData.length === 0) {
        return <div className="p-8 text-center">Loading commission data...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div ref={summaryTableRef}>
            <div className="flex justify-between items-center mb-4 gap-2">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search staff..."
                        className="pl-8"
                        value={summarySearch}
                        onChange={(e) => setSummarySearch(e.target.value)}
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
                            <DropdownMenuItem onClick={() => handleExport('copy', 'summary')}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('excel', 'summary')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv', 'summary')}>
                                <FileText className="mr-2 h-4 w-4" />
                                CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf', 'summary')}>
                                <FileText className="mr-2 h-4 w-4" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('print', 'summary')}>
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
                            <TableHead>Commission Rate</TableHead>
                            <TableHead className="text-right">Total Earned</TableHead>
                            <TableHead className="text-right">Total Paid Out</TableHead>
                            <TableHead className="text-right">Net Balance</TableHead>
                            <TableHead className="text-center">Commission Count</TableHead>
                            <TableHead>Last Transaction</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSummary.length > 0 ? (
                            paginatedSummary.map((s) => (
                                <TableRow key={s.staffName}>
                                    <TableCell className="font-medium">{s.staffName}</TableCell>
                                    <TableCell>{s.commissionRate}</TableCell>
                                    <TableCell className="text-right">₹{s.totalCommissionEarned.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₹{s.totalPaidOut.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">₹{s.netCommissionBalance.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{s.commissionCount}</TableCell>
                                    <TableCell>{s.lastTransactionDate}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewHistory(s.staffName)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No staff commission data available.
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

            {activeStaffData && (
                <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                    <DialogContent className="max-w-7xl w-full max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Commission History - {activeStaffData.staffName}</DialogTitle>
                            <DialogDescription>
                                Detailed breakdown of earned commissions and payouts.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Summary Cards in Modal */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                            <div className="p-4 rounded-lg bg-secondary/20 border">
                                <div className="text-sm font-medium text-muted-foreground">Total Earned</div>
                                <div className="text-2xl font-bold text-green-600">₹{activeStaffData.totalCommissionEarned.toFixed(2)}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border">
                                <div className="text-sm font-medium text-muted-foreground">Total Paid Out</div>
                                <div className="text-2xl font-bold text-red-600">₹{activeStaffData.totalPaidOut.toFixed(2)}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border">
                                <div className="text-sm font-medium text-muted-foreground">Net Balance</div>
                                <div className="text-2xl font-bold">₹{activeStaffData.netCommissionBalance.toFixed(2)}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border">
                                <div className="text-sm font-medium text-muted-foreground">Current Rate</div>
                                <div className="text-2xl font-bold">{activeStaffData.commissionRate}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search transactions..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('copy', 'history')}>Copy</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('excel', 'history')}>Excel</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv', 'history')}>CSV</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf', 'history')}>PDF</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('print', 'history')}>Print</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div ref={historyTableRef} className="flex-1 overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead className="text-right">Appt Amount</TableHead>
                                        <TableHead className="text-right">Commission Rate</TableHead>
                                        <TableHead className="text-right">Commission Earned</TableHead>
                                        <TableHead className="text-center">Transaction Type</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((tx) => (
                                            <TableRow key={tx.transactionId}>
                                                <TableCell className="font-mono text-xs">{tx.transactionDate}</TableCell>
                                                <TableCell>{tx.client}</TableCell>
                                                <TableCell>{tx.serviceName}</TableCell>
                                                <TableCell className="text-right">₹{tx.appointmentAmount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{tx.commissionRate}%</TableCell>
                                                <TableCell className={`text-right font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{tx.commissionEarned.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={tx.type === 'CREDIT' ? 'outline' : 'destructive'}>
                                                        {tx.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs" title={tx.notes}>
                                                    {tx.notes}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No transaction records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>Close</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
