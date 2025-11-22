"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, FileDown, X, IndianRupee, Percent, Users, FileText, Plus, Search, Mail, Phone, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";

import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { closeModal, openModal } from '../../../../../packages/store/src/slices/modalSlice.js';
import {
  setCustomerFilter,
  setCurrentCustomerPage,
  setCustomerItemsPerPage,
  clearCustomerFilters,
} from '@repo/store/slices/customerSlice';
import {
  setSalonFilter,
  setCurrentSalonPage,
  setSalonItemsPerPage,
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
    
    // Add a loading state to demonstrate skeleton
    const [isLoading, setIsLoading] = useState(true);
    
    // Simulate loading - in real app this would be from API query
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    
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

    // Fetch all online users data using the new hook
    const { data: onlineUsers = [], isLoading: isOnlineUsersLoading, error: onlineUsersError } = useGetAdminUsersQuery({});

    // Memoized filtering and pagination logic
    const filteredOrders = useMemo(() => {
        return orders.filter((order: Order) => {
            return (
                (customerFilters.orderType ? order.orderType === customerFilters.orderType : true) &&
                (customerFilters.paymentMode ? order.paymentMode === customerFilters.paymentMode : true) &&
                (customerFilters.orderStatus ? order.orderStatus === customerFilters.orderStatus : true) &&
                (customerFilters.appointmentDate ? order.appointmentDate === customerFilters.appointmentDate : true)
            );
        });
    }, [orders, customerFilters]);

    const currentOrders = useMemo(() => {
        const firstItemIndex = (customerPagination.currentPage - 1) * customerPagination.itemsPerPage;
        const lastItemIndex = firstItemIndex + customerPagination.itemsPerPage;
        return filteredOrders.slice(firstItemIndex, lastItemIndex);
    }, [filteredOrders, customerPagination]);
    
    const filteredSalons = useMemo(() => {
        return salons.filter((salon: Salon) => {
             return (
                (salonFilters.salonName ? salon.salonName.toLowerCase().includes(salonFilters.salonName.toLowerCase()) : true) &&
                (salonFilters.vendorOwner ? salon.vendorOwner.toLowerCase().includes(salonFilters.vendorOwner.toLowerCase()) : true)
            );
        });
    }, [salons, salonFilters]);
    
    const currentSalons = useMemo(() => {
        const firstItemIndex = (salonPagination.currentPage - 1) * salonPagination.itemsPerPage;
        const lastItemIndex = firstItemIndex + salonPagination.itemsPerPage;
        return filteredSalons.slice(firstItemIndex, lastItemIndex);
    }, [filteredSalons, salonPagination]);
    
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
    
    const handleViewCustomersClick = (salon: Salon) => {
        setSelectedSalon(salon);
    };

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Customer Management</h1>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[...Array(16)].map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-5 w-full" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(16)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
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
                        <CardDescription>List of all online clients who have booked appointments.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export List
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isOnlineUsersLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto no-scrollbar">
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
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span className="text-sm">{user.emailAddress || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span className="text-sm">{user.mobileNo || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{user.status || 'New'}</Badge>
                                            </TableCell>
                                            <TableCell>{user.totalBookings || 0}</TableCell>
                                            <TableCell className="text-right">₹{user.totalSpent?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell className="text-right">
                                                {user.vendors && user.vendors.length > 0 ? (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => setViewVendorsClient(user)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span>No bookings</span>
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
                                </TableBody>
                            </Table>
                        </div>
                        <Pagination
                            className="mt-4"
                            currentPage={onlineClientsPagination.currentPage}
                            totalPages={totalOnlineClientsPages}
                            onPageChange={handleOnlineClientsPageChange}
                            itemsPerPage={onlineClientsPagination.itemsPerPage}
                            onItemsPerPageChange={handleOnlineClientsItemsPerPageChange}
                            totalItems={onlineUsers.length}
                        />
                    </>
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
        </>
      )}
    </div>
  );
}