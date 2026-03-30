"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, X, IndianRupee, Users, FileText, Search, TrendingUp, Download, Copy, FileSpreadsheet, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Skeleton } from "@repo/ui/skeleton";

// Export functionality imports
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { closeModal } from '../../../../../packages/store/src/slices/modalSlice.js';
import { selectSelectedRegion } from '@repo/store/slices/adminAuthSlice';
import {
    clearCustomerFilters,
} from '@repo/store/slices/customerSlice';
import {
    clearSalonFilters
} from '@repo/store/slices/salonSlice';

// Use a relative import for the API service
import { useGetAdminUsersQuery } from '../../../../../packages/store/src/services/api';

type Salon = {
    id: number;
    salonName: string;
    vendorContact: string;
    vendorOwner: string;
    adminReservation: number;
    adminPay: number;
    settlementAmount: number;
};

type Order = {
    id: number;
    orderId: string;
    customerId: string;
    vendorName: string;
    customerName: string;
    orderType: string;
    appointmentDate: string;
    fees: number;
    subTotal: number;
    discount: number;
    taxes: number;
    couponApplied: string;
    paymentMode: string;
    platformFees: number;
    serviceTax: number;
    orderStatus: string;
}

const salonCustomers = [
    { id: 'CUST-01', name: 'Ravi Kumar', type: 'Online', contact: '9876543210', email: 'ravi@example.com' },
    { id: 'CUST-02', name: 'Sunita Sharma', type: 'Offline', contact: '8765432109', email: 'sunita@example.com' },
    { id: 'CUST-03', name: 'Amit Patel', type: 'Online', contact: '7654321098', email: '' },
];


export default function CustomerManagementPage() {
    const dispatch = useAppDispatch();
    const tableRef = useRef<HTMLDivElement>(null);

    // Read selected region from Redux (same pattern as payout/reports)
    const selectedRegion = useAppSelector(selectSelectedRegion);

    // State for the "Add New Customer" modal
    const { isOpen, modalType } = useAppSelector((state: any) => state.modal);
    const isNewCustomerModalOpen = isOpen && modalType === 'newCustomer';

    // State for viewing salon customers
    const [isViewCustomersModalOpen, setSelectedSalon] = useState<Salon | null>(null);
    const [salonCustomerSearch, setSalonCustomerSearch] = useState('');
    const [salonCustomerTypeFilter, setSalonCustomerTypeFilter] = useState('all');

    // State for online clients pagination
    const [onlineClientsPagination, setOnlineClientsPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });

    // Customer Orders State from Redux
    const {
        orders,
        filters: customerFilters,
        pagination: customerPagination
    } = useAppSelector((state: any) => state.customer);

    // Salon List State from Redux
    const {
        salons,
        filters: salonFilters,
        pagination: salonPagination
    } = useAppSelector((state: any) => state.salon);

    // Fetch all online users data using the new hook – re-fetches when region changes
    const { data: onlineUsers = [], isLoading: isOnlineUsersLoading, error: onlineUsersError } = useGetAdminUsersQuery(
        selectedRegion && selectedRegion !== 'all'
            ? { regionId: selectedRegion }
            : {}
    );

    const filteredSalonCustomers = useMemo(() => {
        return salonCustomers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(salonCustomerSearch.toLowerCase()) ||
                customer.contact.includes(salonCustomerSearch) ||
                (customer.email && customer.email.toLowerCase().includes(salonCustomerSearch.toLowerCase()));
            const matchesType = salonCustomerTypeFilter === 'all' || customer.type === salonCustomerTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [salonCustomerSearch, salonCustomerTypeFilter]);

    // Pagination logic for online clients
    const currentOnlineUsers = useMemo(() => {
        const firstItemIndex = (onlineClientsPagination.currentPage - 1) * onlineClientsPagination.itemsPerPage;
        const lastItemIndex = firstItemIndex + onlineClientsPagination.itemsPerPage;
        return onlineUsers.slice(firstItemIndex, lastItemIndex);
    }, [onlineUsers, onlineClientsPagination]);

    const clearSalonCustomerFilters = () => {
        setSalonCustomerSearch('');
        setSalonCustomerTypeFilter('all');
    };

    const handleOnlineClientsPageChange = (page: number) => {
        setOnlineClientsPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    };

    const handleOnlineClientsItemsPerPageChange = (size: number) => {
        setOnlineClientsPagination(prev => ({
            currentPage: 1,
            itemsPerPage: size
        }));
    };

    const totalOnlineClientsPages = Math.ceil(onlineUsers.length / onlineClientsPagination.itemsPerPage);

    // Calculate dynamic data for the cards
    const totalClients = onlineUsers.length;
    const newClientsThisMonth = useMemo(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        return onlineUsers.filter((user: any) => {
            if (!user.createdAt) return false;
            const userCreationDate = new Date(user.createdAt);
            return userCreationDate >= oneMonthAgo;
        }).length;
    }, [onlineUsers]);

    const totalRevenue = useMemo(() => {
        return onlineUsers.reduce((sum: number, user: any) => {
            return sum + (user.totalSpent || 0);
        }, 0);
    }, [onlineUsers]);

    const totalAppointments = useMemo(() => {
        return onlineUsers.reduce((sum: number, user: any) => {
            return sum + (user.totalBookings || 0);
        }, 0);
    }, [onlineUsers]);

    const totalVendors = useMemo(() => {
        const vendorSet = new Set();
        onlineUsers.forEach((user: any) => {
            if (user.vendors && Array.isArray(user.vendors)) {
                user.vendors.forEach((vendor: string) => vendorSet.add(vendor));
            }
        });
        return vendorSet.size;
    }, [onlineUsers]);

    // State for viewing client vendors
    const [viewVendorsClient, setViewVendorsClient] = useState<any | null>(null);

    // Export functionality functions
    const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
        if (!tableRef.current) return;

        const table = tableRef.current.querySelector('table');
        if (!table) return;

        const tableClone = table.cloneNode(true) as HTMLTableElement;

        // Remove Status column (4th column)
        tableClone.querySelectorAll('th:nth-child(4), td:nth-child(4)').forEach(cell => cell.remove());

        tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
            cell.textContent = cell.getAttribute('data-export-value');
        });

        const wb = XLSX.utils.table_to_book(tableClone, { sheet: 'Sheet1' });
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
        if (!tableRef.current) return;

        const table = tableRef.current.querySelector('table');
        if (!table) return;

        const tableClone = table.cloneNode(true) as HTMLTableElement;

        // Remove Status column (4th column)
        tableClone.querySelectorAll('th:nth-child(4), td:nth-child(4)').forEach(cell => cell.remove());

        tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
            cell.textContent = cell.getAttribute('data-export-value');
        });

        const wb = XLSX.utils.table_to_book(tableClone, { sheet: 'Sheet1' });
        XLSX.writeFile(wb, `${fileName}.csv`);
    };

    const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
        if (!tableRef.current) return;

        const table = tableRef.current.querySelector('table');
        if (!table) return;

        // Create a clone to show actual vendor names instead of button
        const tableClone = table.cloneNode(true) as HTMLTableElement;

        // Remove Status column (4th column)
        tableClone.querySelectorAll('th:nth-child(4), td:nth-child(4)').forEach(cell => cell.remove());

        tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
            cell.textContent = cell.getAttribute('data-export-value');
        });

        // Temporarily append to body to capture it
        tableClone.style.position = 'absolute';
        tableClone.style.left = '-9999px';
        tableClone.style.width = 'auto';
        document.body.appendChild(tableClone);

        const canvas = await html2canvas(tableClone, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        document.body.removeChild(tableClone);

        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If height exceeds page height, scale it down
        let finalImgHeight = imgHeight;
        let finalImgWidth = imgWidth;
        if (imgHeight > (pdfHeight - (margin * 2))) {
            finalImgHeight = pdfHeight - (margin * 2);
            finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
        }

        pdf.addImage(imgData, 'PNG', margin, margin, finalImgWidth, finalImgHeight);
        pdf.save(`${fileName}.pdf`);
    };

    const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
        if (!tableRef.current) return;

        const table = tableRef.current.querySelector('table');
        if (!table) return;

        const tableClone = table.cloneNode(true) as HTMLTableElement;

        // Remove Status column (4th column)
        tableClone.querySelectorAll('th:nth-child(4), td:nth-child(4)').forEach(cell => cell.remove());

        tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
            cell.textContent = cell.getAttribute('data-export-value');
        });

        // Temporarily append to body to select it
        tableClone.style.position = 'absolute';
        tableClone.style.left = '-9999px';
        document.body.appendChild(tableClone);

        const range = document.createRange();
        range.selectNode(tableClone);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();

        document.body.removeChild(tableClone);

        alert('Table copied to clipboard!');
    };

    const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
        if (!tableRef.current) return;

        const table = tableRef.current.querySelector('table');
        if (!table) return;

        // Create a clone to show actual vendor names instead of button
        const tableClone = table.cloneNode(true) as HTMLTableElement;

        // Remove Status column (4th column)
        tableClone.querySelectorAll('th:nth-child(4), td:nth-child(4)').forEach(cell => cell.remove());

        tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
            cell.textContent = cell.getAttribute('data-export-value');
        });

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Report</title>');
            printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(tableClone.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Customer Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">+{newClientsThisMonth} new this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVendors}</div>
                        <p className="text-xs text-muted-foreground">Active vendors</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>Online Clients</CardTitle>
                            <CardDescription>
                                List of all online clients who have booked appointments.
                                {selectedRegion && selectedRegion !== 'all' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Region Filtered
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export List
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'online_clients_report')}>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'online_clients_report')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'online_clients_report')}>
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
                </CardHeader>
                <CardContent>
                    <div ref={tableRef} className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr. No</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Bookings</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                    <TableHead className="text-right">Vendors</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isOnlineUsersLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32 mb-2" />
                                                <Skeleton className="h-3 w-20" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-3 w-40 mb-2" />
                                                <Skeleton className="h-3 w-24" />
                                            </TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <>
                                        {currentOnlineUsers.map((user: any, index: number) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{(onlineClientsPagination.currentPage - 1) * onlineClientsPagination.itemsPerPage + index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{user.emailAddress || 'N/A'}</span>
                                                        <span className="text-sm">{user.mobileNo || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{user.status || 'New'}</Badge>
                                                </TableCell>
                                                <TableCell>{user.totalBookings || 0}</TableCell>
                                                <TableCell className="text-right">₹{user.totalSpent?.toFixed(2) || '0.00'}</TableCell>
                                                <TableCell
                                                    className="text-right"
                                                    data-export-value={user.vendors && user.vendors.length > 0 ? user.vendors.join(', ') : 'No bookings'}
                                                >
                                                    {user.vendors && user.vendors.length > 0 ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setViewVendorsClient(user)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No bookings</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {onlineUsersError && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-destructive">
                                                    Error loading online clients: {JSON.stringify(onlineUsersError)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!onlineUsersError && onlineUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                    No online clients found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {!isOnlineUsersLoading && (
                        <Pagination
                            className="mt-4"
                            currentPage={onlineClientsPagination.currentPage}
                            totalPages={totalOnlineClientsPages}
                            onPageChange={handleOnlineClientsPageChange}
                            itemsPerPage={onlineClientsPagination.itemsPerPage}
                            onItemsPerPageChange={handleOnlineClientsItemsPerPageChange}
                            totalItems={onlineUsers.length}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Vendor List Dialog */}
            <Dialog open={!!viewVendorsClient} onOpenChange={() => setViewVendorsClient(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Vendors for {viewVendorsClient?.firstName} {viewVendorsClient?.lastName}</DialogTitle>
                        <DialogDescription>
                            List of all vendors this client has booked appointments with.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {viewVendorsClient?.vendors && viewVendorsClient.vendors.length > 0 ? (
                            <div className="space-y-3">
                                {viewVendorsClient.vendors.map((vendor: string, index: number) => (
                                    <div key={index} className="flex items-center p-3 border rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{vendor}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                No vendors found for this client.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setViewVendorsClient(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isNewCustomerModalOpen} onOpenChange={(open) => !open && dispatch(closeModal())}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new customer. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" placeholder="John Doe" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input id="phone" type="tel" placeholder="+1 234 567 890" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => dispatch(closeModal())}>Cancel</Button>
                        <Button type="submit">Save Customer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!isViewCustomersModalOpen} onOpenChange={() => setSelectedSalon(null)}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Customers at {isViewCustomersModalOpen?.salonName}</DialogTitle>
                        <DialogDescription>
                            A list of all customers who have visited this salon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, contact, or email..."
                                    className="w-full pl-8"
                                    value={salonCustomerSearch}
                                    onChange={(e) => setSalonCustomerSearch(e.target.value)}
                                />
                            </div>
                            <Select value={salonCustomerTypeFilter} onValueChange={setSalonCustomerTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="Offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" onClick={clearSalonCustomerFilters}>
                                <X className="mr-2 h-4 w-4" /> Clear
                            </Button>
                        </div>
                        <div className="overflow-x-auto no-scrollbar rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Contact No.</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSalonCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell>{customer.type}</TableCell>
                                            <TableCell>{customer.contact}</TableCell>
                                            <TableCell>{customer.email || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSalonCustomers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No customers found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setSelectedSalon(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}