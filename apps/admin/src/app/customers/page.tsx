
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, FileDown, X, IndianRupee, Percent, Users, FileText, Plus, Search } from 'lucide-react';
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
    const [isViewCustomersModalOpen, setIsViewCustomersModalOpen] = useState(false);
    const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
    const [salonCustomerSearch, setSalonCustomerSearch] = useState('');
    const [salonCustomerTypeFilter, setSalonCustomerTypeFilter] = useState('all');

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
    
    const handleViewCustomersClick = (salon: Salon) => {
        setSelectedSalon(salon);
        setIsViewCustomersModalOpen(true);
    };

    const clearSalonCustomerFilters = () => {
        setSalonCustomerSearch('');
        setSalonCustomerTypeFilter('all');
    };

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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Applied</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">Across 500 orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Taxes Applied</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,315.50</div>
            <p className="text-xs text-muted-foreground">GST and other taxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850.75</div>
            <p className="text-xs text-muted-foreground">From all transactions</p>
          </CardContent>
        </Card>
      </div>
      
        <Tabs defaultValue="all-customers">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="all-customers">All Customers</TabsTrigger>
                <TabsTrigger value="salon-list">Salon List</TabsTrigger>
            </TabsList>
            <TabsContent value="all-customers">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>All Customer Orders</CardTitle>
                                <CardDescription>A list of all customer transactions.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => dispatch(openModal({ modalType: 'newCustomer' }))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Customer
                                </Button>
                                <Button>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export List
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 p-4 rounded-lg bg-secondary">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Filters</h3>
                                <Button variant="ghost" size="sm" onClick={() => dispatch(clearCustomerFilters())}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Select value={customerFilters.orderType} onValueChange={value => dispatch(setCustomerFilter({ filterName: 'orderType', value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Order Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={customerFilters.paymentMode} onValueChange={value => dispatch(setCustomerFilter({ filterName: 'paymentMode', value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Payment Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                                        <SelectItem value="PayPal">PayPal</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={customerFilters.orderStatus} onValueChange={value => dispatch(setCustomerFilter({ filterName: 'orderStatus', value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Order Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="date" 
                                    placeholder="Appointment Date" 
                                    value={customerFilters.appointmentDate} 
                                    onChange={e => dispatch(setCustomerFilter({ filterName: 'appointmentDate', value: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sr. No</TableHead>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer ID</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Order Type</TableHead>
                                        <TableHead>Appt. Date</TableHead>
                                        <TableHead>Fees</TableHead>
                                        <TableHead>Sub Total</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Taxes</TableHead>
                                        <TableHead>Coupon</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Platform Fee</TableHead>
                                        <TableHead>Service Tax</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentOrders.map((order: Order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.orderId}</TableCell>
                                            <TableCell>{order.customerId}</TableCell>
                                            <TableCell>{order.vendorName}</TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{order.orderType}</TableCell>
                                            <TableCell>{order.appointmentDate}</TableCell>
                                            <TableCell>${order.fees.toFixed(2)}</TableCell>
                                            <TableCell>${order.subTotal.toFixed(2)}</TableCell>
                                            <TableCell>${order.discount.toFixed(2)}</TableCell>
                                            <TableCell>${order.taxes.toFixed(2)}</TableCell>
                                            <TableCell>{order.couponApplied}</TableCell>
                                            <TableCell>{order.paymentMode}</TableCell>
                                            <TableCell>${order.platformFees.toFixed(2)}</TableCell>
                                            <TableCell>${order.serviceTax.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    order.orderStatus === "Completed" ? "bg-green-100 text-green-800" :
                                                    order.orderStatus === "Confirmed" ? "bg-blue-100 text-blue-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Pagination
                            className="mt-4"
                            currentPage={customerPagination.currentPage}
                            totalPages={Math.ceil(filteredOrders.length / customerPagination.itemsPerPage)}
                            onPageChange={(page) => dispatch(setCurrentCustomerPage(page))}
                            itemsPerPage={customerPagination.itemsPerPage}
                            onItemsPerPageChange={(size) => dispatch(setCustomerItemsPerPage(size))}
                            totalItems={filteredOrders.length}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="salon-list">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Salon List</CardTitle>
                                <CardDescription>List of all affiliated salons and their details.</CardDescription>
                            </div>
                            <Button>
                               <FileDown className="mr-2 h-4 w-4" />
                                Export List
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 p-4 rounded-lg bg-secondary">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Filters</h3>
                                <Button variant="ghost" size="sm" onClick={() => dispatch(clearSalonFilters())}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input 
                                    type="text" 
                                    placeholder="Filter by Salon Name..."
                                    value={salonFilters.salonName}
                                    onChange={e => dispatch(setSalonFilter({ filterName: 'salonName', value: e.target.value }))}
                                />
                                <Input 
                                    type="text" 
                                    placeholder="Filter by Vendor Owner..."
                                    value={salonFilters.vendorOwner}
                                    onChange={e => dispatch(setSalonFilter({ filterName: 'vendorOwner', value: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sr. No</TableHead>
                                        <TableHead>Salon Name</TableHead>
                                        <TableHead>Vendor Contact</TableHead>
                                        <TableHead>Vendor Owner</TableHead>
                                        <TableHead>Admin Reservation</TableHead>
                                        <TableHead>Admin Pay</TableHead>
                                        <TableHead>Settlement Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentSalons.map((salon: Salon) => (
                                        <TableRow key={salon.id}>
                                            <TableCell>{salon.id}</TableCell>
                                            <TableCell>{salon.salonName}</TableCell>
                                            <TableCell>{salon.vendorContact}</TableCell>
                                            <TableCell>{salon.vendorOwner}</TableCell>
                                            <TableCell>${salon.adminReservation.toFixed(2)}</TableCell>
                                            <TableCell>${salon.adminPay.toFixed(2)}</TableCell>
                                            <TableCell>${salon.settlementAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" onClick={() => handleViewCustomersClick(salon)}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Customers</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <Pagination
                            className="mt-4"
                            currentPage={salonPagination.currentPage}
                            totalPages={Math.ceil(filteredSalons.length / salonPagination.itemsPerPage)}
                            onPageChange={(page) => dispatch(setCurrentSalonPage(page))}
                            itemsPerPage={salonPagination.itemsPerPage}
                            onItemsPerPageChange={(size) => dispatch(setSalonItemsPerPage(size))}
                            totalItems={filteredSalons.length}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

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
        
        <Dialog open={isViewCustomersModalOpen} onOpenChange={setIsViewCustomersModalOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Customers at {selectedSalon?.salonName}</DialogTitle>
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
                    <Button variant="secondary" onClick={() => setIsViewCustomersModalOpen(false)}>
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
