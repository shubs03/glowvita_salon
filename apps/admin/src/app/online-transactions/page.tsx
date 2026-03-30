"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, Search, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";

import { useAppSelector } from '@repo/store/hooks';
import { selectSelectedRegion } from '@repo/store/slices/adminAuthSlice';
import { glowvitaApi } from '../../../../../packages/store/src/services/api';

export default function OnlineTransactionsPage() {
    const tableRef = useRef<HTMLDivElement>(null);
    const selectedRegion = useAppSelector(selectSelectedRegion);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vendorFilter, setVendorFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });

    // To handle view details dialog
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

    // Call API using injected hook or direct api from glowvitaApi
    const { data: response, isLoading, error } = glowvitaApi.endpoints.getAdminOnlineTransactions.useQuery({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        regionId: selectedRegion,
        search: debouncedSearch,
        status: statusFilter,
        vendorId: vendorFilter,
        serviceName: serviceFilter
    });

    const transactions = response?.data || [];
    const vendorsList = response?.vendorsList || [];
    const servicesList = response?.servicesList || [];
    const summary = response?.summary || {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalAmountPaid: 0
    };
    const totalTransactions = response?.pagination?.total || 0;
    const totalPages = response?.pagination?.totalPages || 0;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Simple debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (size: number) => {
        setPagination({ currentPage: 1, itemsPerPage: size });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Online Transactions</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalAppointments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium ">Completed Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold ">{summary.completedAppointments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Cancelled Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold ">{summary.cancelledAppointments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium ">Total Amount Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold ">₹{(summary.totalAmountPaid || 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>
                                List of all appointments where the customer paid online.
                                {selectedRegion && selectedRegion !== 'all' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Region Filtered
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap md:flex-nowrap">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search invoice or name"
                                    className="w-full sm:w-[200px] pl-8"
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Select value={vendorFilter} onValueChange={setVendorFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {vendorsList.map((v: any) => (
                                        <SelectItem key={v._id} value={v._id}>{v.businessName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    {servicesList.map((s: string, idx: number) => (
                                        <SelectItem key={idx} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div ref={tableRef} className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice / ID</TableHead>
                                    <TableHead>Date / Time</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Appt Status</TableHead>
                                    <TableHead className="text-center">Pay Status</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32 mb-2" />
                                                <Skeleton className="h-3 w-20" />
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <>
                                        {transactions.map((tx: any) => (
                                            <TableRow key={tx._id}>
                                                <TableCell className="font-medium">
                                                    {tx.invoiceNumber || tx._id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {tx.startTime} - {tx.endTime}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{tx.clientName || 'N/A'}</div>
                                                    {tx.clientPhone && <div className="text-xs text-muted-foreground">{tx.clientPhone}</div>}
                                                </TableCell>
                                                <TableCell>
                                                    {tx.vendorId?.businessName || 'Unknown Vendor'}
                                                </TableCell>
                                                <TableCell>
                                                    {tx.isMultiService ? (
                                                        <span className="text-sm">{tx.serviceItems?.length || 0} services</span>
                                                    ) : (
                                                        <span className="text-sm truncate max-w-[150px] inline-block" title={tx.serviceName}>
                                                            {tx.serviceName || 'N/A'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ₹{(tx.finalAmount || tx.totalAmount || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-medium uppercase">
                                                    {tx.status}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={
                                                        tx.paymentStatus === 'completed' ? 'success' :
                                                            tx.paymentStatus === 'failed' ? 'destructive' :
                                                                'secondary'
                                                    }>
                                                        {tx.paymentStatus || 'unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(tx)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {error && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center text-destructive py-6">
                                                    Error loading transactions.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!error && transactions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                                                    No online transactions found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {!isLoading && transactions.length > 0 && (
                        <Pagination
                            className="mt-4"
                            currentPage={pagination.currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={pagination.itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            totalItems={totalTransactions}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>
                            Invoice: {selectedTransaction?.invoiceNumber || selectedTransaction?._id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Client Name</p>
                                <p className="font-medium">{selectedTransaction?.clientName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vendor</p>
                                <p className="font-medium">{selectedTransaction?.vendorId?.businessName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium text-green-600">₹{(selectedTransaction?.finalAmount || selectedTransaction?.totalAmount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Status</p>
                                <Badge variant="outline">{selectedTransaction?.paymentStatus}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date & Time</p>
                                <p className="text-sm">
                                    {selectedTransaction?.date ? new Date(selectedTransaction.date).toLocaleDateString() : 'N/A'} <br />
                                    {selectedTransaction?.startTime} - {selectedTransaction?.endTime}
                                </p>
                            </div>
                        </div>

                        {selectedTransaction?.isMultiService && selectedTransaction?.serviceItems?.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                                <p className="font-medium mb-2">Services Provided:</p>
                                <ul className="space-y-2 text-sm">
                                    {selectedTransaction.serviceItems.map((s: any, i: number) => (
                                        <li key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                            <span>{s.serviceName}</span>
                                            <span className="font-medium">₹{s.amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {!selectedTransaction?.isMultiService && selectedTransaction?.serviceName && (
                            <div className="mt-4 border-t pt-4">
                                <p className="font-medium mb-2">Service Provided:</p>
                                <div className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                                    <span>{selectedTransaction.serviceName}</span>
                                    <span className="font-medium">₹{selectedTransaction.amount}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedTransaction(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
