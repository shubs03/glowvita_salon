"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, ShoppingBag, TrendingUp, ShieldCheck, Percent } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { useGetPlatformCollectionsReportQuery } from '@repo/store/api';
import { PlatformCollectionOrder, FilterParams } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';
import { FilterModal } from '../common';
import { useReport } from '../hooks/useReport';

export const PlatformCollectionsReportTable = () => {
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
    } = useReport<PlatformCollectionOrder>(5);

    const { data: response, isLoading, isError, error } = useGetPlatformCollectionsReportQuery(apiFilters);

    const orders = response?.orders || [];
    const summary = response?.summary;

    const {
        paginatedData,
        totalItems,
        totalPages,
        startIndex
    } = filterAndPaginateData(orders, (item) => [
        item.orderId,
        item.vendorName,
        item.supplierName,
        item.orderStatus,
        `${item.orderTotal}`,
        `${item.platformFeeTotal}`,
        `${item.gstTotal}`
    ]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
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
                        placeholder="Search orders..."
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
                            <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'platform_collections_report')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'platform_collections_report')}>
                                <FileText className="mr-2 h-4 w-4" />
                                CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'platform_collections_report')}>
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
                initialFilters={filters}
                showVendorFilter={false} // Currently searching by order text, adding specific filters if needed later
                showBookingTypeFilter={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <ShoppingBag className="mr-2 h-4 w-4 text-purple-600" />
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold">{summary?.totalOrders || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold text-green-600">₹{summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
                            Total Platform Fees
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold text-blue-600">₹{summary?.totalPlatformFeesCollected?.toFixed(2) || '0.00'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Percent className="mr-2 h-4 w-4 text-orange-600" />
                            Total GST
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-2xl font-bold text-orange-600">₹{summary?.totalGSTCollected?.toFixed(2) || '0.00'}</div>
                    </CardContent>
                </Card>
            </div>

            <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Platform Fee</TableHead>
                            <TableHead>GST</TableHead>
                            <TableHead>Order Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No product orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item) => (
                                <TableRow key={item.orderId}>
                                    <TableCell className="font-medium">#{item.orderId}</TableCell>
                                    <TableCell>{new Date(item.orderDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{item.vendorName}</TableCell>
                                    <TableCell>{item.supplierName}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.orderStatus === 'delivered'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.orderStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>₹{item.platformFeeTotal.toFixed(2)}</TableCell>
                                    <TableCell>₹{item.gstTotal.toFixed(2)}</TableCell>
                                    <TableCell className="font-bold">₹{item.orderTotal.toFixed(2)}</TableCell>
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
