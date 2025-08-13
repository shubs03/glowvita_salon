
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, FileDown, X, IndianRupee, Percent, Users, FileText, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';

const customerOrdersData = [
  {
    id: 1,
    orderId: "ORD-001",
    customerId: "CUST-101",
    vendorName: "Glamour Salon",
    customerName: "Alice Johnson",
    orderType: "Online",
    appointmentDate: "2024-08-15",
    fees: 50,
    subTotal: 45,
    discount: 5,
    taxes: 8.1,
    couponApplied: "SUMMER10",
    paymentMode: "Credit Card",
    platformFees: 7.5,
    serviceTax: 0.6,
    orderStatus: "Completed",
  },
  {
    id: 2,
    orderId: "ORD-002",
    customerId: "CUST-102",
    vendorName: "Modern Cuts",
    customerName: "Bob Williams",
    orderType: "Offline",
    appointmentDate: "2024-08-16",
    fees: 30,
    subTotal: 30,
    discount: 0,
    taxes: 5.4,
    couponApplied: "N/A",
    paymentMode: "Cash",
    platformFees: 4.5,
    serviceTax: 0,
    orderStatus: "Confirmed",
  },
  {
    id: 3,
    orderId: "ORD-003",
    customerId: "CUST-103",
    vendorName: "Style Hub",
    customerName: "Charlie Brown",
    orderType: "Online",
    appointmentDate: "2024-08-17",
    fees: 75,
    subTotal: 70,
    discount: 5,
    taxes: 12.6,
    couponApplied: "NEW5",
    paymentMode: "PayPal",
    platformFees: 11.25,
    serviceTax: 1.35,
    orderStatus: "Pending",
  },
];

const salonListData = [
    {
        id: 1,
        salonName: "Glamour Salon",
        vendorContact: "vendor1@example.com",
        vendorOwner: "Ms. Glamour",
        adminReservation: 100,
        adminPay: 85,
        settlementAmount: 15,
    },
    {
        id: 2,
        salonName: "Modern Cuts",
        vendorContact: "vendor2@example.com",
        vendorOwner: "Mr. Modern",
        adminReservation: 150,
        adminPay: 127.5,
        settlementAmount: 22.5,
    },
    {
        id: 3,
        salonName: "Style Hub",
        vendorContact: "vendor3@example.com",
        vendorOwner: "Mx. Style",
        adminReservation: 200,
        adminPay: 170,
        settlementAmount: 30,
    }
]

export default function CustomerManagementPage() {
    const [currentPageOrders, setCurrentPageOrders] = useState(1);
    const [itemsPerPageOrders, setItemsPerPageOrders] = useState(10);
    const [currentPageSalons, setCurrentPageSalons] = useState(1);
    const [itemsPerPageSalons, setItemsPerPageSalons] = useState(10);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

    // Orders Pagination Logic
    const lastItemIndexOrders = currentPageOrders * itemsPerPageOrders;
    const firstItemIndexOrders = lastItemIndexOrders - itemsPerPageOrders;
    const currentOrders = customerOrdersData.slice(firstItemIndexOrders, lastItemIndexOrders);
    const totalPagesOrders = Math.ceil(customerOrdersData.length / itemsPerPageOrders);
    
    // Salons Pagination Logic
    const lastItemIndexSalons = currentPageSalons * itemsPerPageSalons;
    const firstItemIndexSalons = lastItemIndexSalons - itemsPerPageSalons;
    const currentSalons = salonListData.slice(firstItemIndexSalons, lastItemIndexSalons);
    const totalPagesSalons = Math.ceil(salonListData.length / itemsPerPageSalons);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Customer Management</h1>

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
                                <Button onClick={() => setIsNewCustomerModalOpen(true)}>
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
                                <Button variant="ghost" size="sm">
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Order Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Payment Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credit-card">Credit Card</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Order Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="date" placeholder="Appointment Date" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
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
                                    {currentOrders.map((order) => (
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
                            currentPage={currentPageOrders}
                            totalPages={totalPagesOrders}
                            onPageChange={setCurrentPageOrders}
                            itemsPerPage={itemsPerPageOrders}
                            onItemsPerPageChange={setItemsPerPageOrders}
                            totalItems={customerOrdersData.length}
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
                                <Button variant="ghost" size="sm">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input type="text" placeholder="Filter by Salon Name..." />
                                <Input type="text" placeholder="Filter by Vendor Owner..." />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
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
                                    {currentSalons.map((salon) => (
                                        <TableRow key={salon.id}>
                                            <TableCell>{salon.id}</TableCell>
                                            <TableCell>{salon.salonName}</TableCell>
                                            <TableCell>{salon.vendorContact}</TableCell>
                                            <TableCell>{salon.vendorOwner}</TableCell>
                                            <TableCell>${salon.adminReservation.toFixed(2)}</TableCell>
                                            <TableCell>${salon.adminPay.toFixed(2)}</TableCell>
                                            <TableCell>${salon.settlementAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <Pagination
                            className="mt-4"
                            currentPage={currentPageSalons}
                            totalPages={totalPagesSalons}
                            onPageChange={setCurrentPageSalons}
                            itemsPerPage={itemsPerPageSalons}
                            onItemsPerPageChange={setItemsPerPageSalons}
                            totalItems={salonListData.length}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
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
                    <Button type="button" variant="secondary" onClick={() => setIsNewCustomerModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
