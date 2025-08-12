
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, FileDown } from 'lucide-react';

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
    const [itemsPerPageOrders, setItemsPerPageOrders] = useState(5);
    const [currentPageSalons, setCurrentPageSalons] = useState(1);
    const [itemsPerPageSalons, setItemsPerPageSalons] = useState(5);

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
                            <Button>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export List
                            </Button>
                        </div>
                         <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                           <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Order Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit-card">Credit Card</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Order Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                             <Input type="date" placeholder="Appointment Date" className="w-full md:w-auto"/>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                         <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                            <Input type="text" placeholder="Filter by Salon Name..." className="w-full md:w-[240px]" />
                            <Input type="text" placeholder="Filter by Vendor Owner..." className="w-full md:w-[240px]" />
                        </div>
                    </CardHeader>
                    <CardContent>
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
    </div>
  );
}
