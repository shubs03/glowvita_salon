
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Trash, ShoppingCart, TrendingUp, Package, Search, Eye, Calendar, DollarSign, MapPin, CreditCard, Mail, Phone, User } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import Image from 'next/image';

const initialOrderHistory = [
  { 
    id: "ORD-001", 
    date: "2024-08-01T10:00:00Z", 
    total: 120, 
    items: [
      { name: "Aura Serum", quantity: 1, price: 68.00, image: 'https://picsum.photos/seed/cart1/200/200' },
      { name: "Chroma Balm", quantity: 1, price: 24.00, image: 'https://picsum.photos/seed/cart2/200/200' },
      { name: "Zen Mist", quantity: 1, price: 28.00, image: 'https://picsum.photos/seed/product3/200/200' },
    ], 
    status: "Delivered",
    shippingAddress: "123 Ocean View, Apt 4B, Miami, FL 33101",
    paymentMethod: "Visa **** 4242",
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    customerPhone: '555-123-4567'
  },
  { 
    id: "ORD-002", 
    date: "2024-07-15T15:30:00Z", 
    total: 75, 
    items: [
        { name: "Terra Scrub", quantity: 1, price: 48.00, image: 'https://picsum.photos/seed/product4/200/200' },
        { name: "Luxe Lip Oil", quantity: 1, price: 27.00, image: 'https://picsum.photos/seed/product5/200/200' },
    ], 
    status: "Processing",
    shippingAddress: "456 Downtown Ave, New York, NY 10001",
    paymentMethod: "PayPal",
    customerName: 'Bob Williams',
    customerEmail: 'bob@example.com',
    customerPhone: '555-987-6543'
  },
  { 
    id: "ORD-003", 
    date: "2024-06-10T11:00:00Z", 
    total: 210, 
    items: [
        { name: "Aura Serum", quantity: 2, price: 68.00, image: 'https://picsum.photos/seed/cart1/200/200' },
        { name: "Zen Mist", quantity: 1, price: 28.00, image: 'https://picsum.photos/seed/product3/200/200' },
        { name: "Bloom Perfume", quantity: 1, price: 46.00, image: 'https://picsum.photos/seed/product6/200/200' },
    ], 
    status: "Cancelled",
    shippingAddress: "789 Suburbia Lane, Chicago, IL 60611",
    paymentMethod: "Visa **** 1234",
    customerName: 'Charlie Brown',
    customerEmail: 'charlie@example.com',
    customerPhone: '555-555-5555'
  },
];

export default function OrdersPage() {
    const [orderHistory, setOrderHistory] = useState(initialOrderHistory);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = useMemo(() => {
        return orderHistory.filter(order =>
          (order.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (statusFilter === 'all' || order.status === statusFilter)
        );
    }, [orderHistory, searchTerm, statusFilter]);

    const handleCancelClick = (order) => {
        setOrderToCancel(order);
        setIsCancelModalOpen(true);
    };

    const handleViewClick = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const handleConfirmCancel = () => {
        console.log("Cancelling order:", orderToCancel?.id, "Reason:", cancellationReason);
        setOrderHistory(orderHistory.map(order => 
            order.id === orderToCancel.id ? { ...order, status: 'Cancelled' } : order
        ));
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        setCancellationReason('');
    };
    
    const isOrderCancellable = (status: string) => {
        return status === 'Processing';
    };

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={ShoppingCart} title="Total Orders" value={orderHistory.length} change="All time" />
                <StatCard icon={TrendingUp} title="Total Spent" value={`₹${orderHistory.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`} change="On products" />
                <StatCard icon={Package} title="Delivered" value={orderHistory.filter(o => o.status === 'Delivered').length} change="All time" />
            </div>
            <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle>My Orders</CardTitle>
                      <CardDescription>Your product order history.</CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search by Order ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.id}</TableCell>
                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell>{order.items.length}</TableCell>
                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewClick(order)}>
                                    <Eye className="h-4 w-4"/>
                                </Button>
                                {isOrderCancellable(order.status) ? (
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelClick(order)}>
                                        <Trash className="h-4 w-4"/>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" disabled className="text-gray-400">
                                        <Trash className="h-4 w-4"/>
                                    </Button>
                                )}
                            </TableCell>
                          </TableRow>
                        ))}
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
                    totalItems={filteredOrders.length}
                  />
                </CardContent>
              </Card>
            
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel order {orderToCancel?.id}? Please provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
                        <Textarea 
                          id="cancellation-reason"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="e.g., Ordered by mistake"
                          className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No, Keep It</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancellationReason.trim()}>Yes, Cancel Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold">Order Details: #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Placed on {selectedOrder ? new Date(selectedOrder.date).toLocaleDateString() : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                      <User className="h-5 w-5 text-primary" />
                                      Customer & Shipping
                                    </h3>
                                    <div className="p-4 bg-secondary rounded-lg space-y-3 text-sm">
                                      <div className="flex items-start gap-3">
                                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <p className="font-medium">{selectedOrder.customerName}</p>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                                      </div>
                                      <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <p className="text-muted-foreground">{selectedOrder.shippingAddress}</p>
                                      </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                      <DollarSign className="h-5 w-5 text-primary" />
                                      Payment Summary
                                    </h3>
                                    <div className="space-y-2 text-sm p-4 bg-secondary rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span>₹{selectedOrder.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping:</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                            <span>Total:</span>
                                            <span className="text-primary">₹{selectedOrder.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs pt-2 border-t">
                                            <span className="text-muted-foreground">Payment Method:</span>
                                            <div className="flex items-center gap-1.5">
                                              <CreditCard className="h-3 w-3"/>
                                              <span>{selectedOrder.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                  <ShoppingCart className="h-5 w-5 text-primary" />
                                  Items Ordered ({selectedOrder.items.length})
                                </h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                                            <Image 
                                                src={item.image} 
                                                alt={item.name} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-md object-cover" 
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-6 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
