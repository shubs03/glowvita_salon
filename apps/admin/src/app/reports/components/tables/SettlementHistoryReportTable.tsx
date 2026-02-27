"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { useGetSettlementHistoryReportQuery } from '@repo/store/api';
import { SettlementHistoryData, FilterParams } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';
import { FilterModal } from '../common';
import { useReport } from '../hooks/useReport';

export const SettlementHistoryReportTable = () => {
    const {
        filters,
        isFilterModalOpen,
        currentPage,
        itemsPerPage,
        searchTerm,
        tableRef,
        setFilters,
        setIsFilterModalOpen,
        setCurrentPage,
        setItemsPerPage,
        setSearchTerm,
        handleFilterChange,
        filterAndPaginateData,
        apiFilters
    } = useReport<SettlementHistoryData>(5);

    const { data: response, isLoading, isError, error } = useGetSettlementHistoryReportQuery(apiFilters);

    const historyData = response?.data || [];
    const vendorNames = response?.vendorNames || [];
    const aggregatedTotals = response?.aggregatedTotals;

    const {
        paginatedData,
        totalItems,
        totalPages,
        startIndex
    } = filterAndPaginateData(historyData, (item) => [
        item.vendorName,
        item.type,
        item.method,
        item.transactionId,
        item.notes,
        `${item.amount}`
    ]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-24 w-64" />
                    <Skeleton className="h-24 w-64" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
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
                        placeholder="Search history..."
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
                            <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'settlement_history_report')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'settlement_history_report')}>
                                <FileText className="mr-2 h-4 w-4" />
                                CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'settlement_history_report')}>
                                <FileText className="mr-2 h-4 w-4" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => printTable(tableRef)}>
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
                vendors={vendorNames}
                initialFilters={filters}
                showVendorFilter={true}
                showBookingTypeFilter={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center text-green-600">
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            Total Payouts to Vendors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold text-green-700">₹{aggregatedTotals?.totalPaidToVendor?.toFixed(2) || '0.00'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center text-blue-600">
                            <ArrowDownCircle className="mr-2 h-4 w-4" />
                            Total Collections from Vendors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold text-blue-700">₹{aggregatedTotals?.totalPaidToAdmin?.toFixed(2) || '0.00'}</div>
                    </CardContent>
                </Card>
            </div>

            <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Vendor Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Ref ID</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No payment history found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{item.vendorName}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === 'Payment to Vendor'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.method}</TableCell>
                                    <TableCell className="font-bold">₹{item.amount.toFixed(2)}</TableCell>
                                    <TableCell>{item.transactionId}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{item.notes}</TableCell>
                                </TableRow>
                            ))
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
        </div>
    );
};
