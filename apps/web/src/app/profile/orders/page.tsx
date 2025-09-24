
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Trash, ShoppingCart, TrendingUp, Package, Search } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';

const initialOrderHistory = [
  { id: "ORD-001", date: "2024-08-01T10:00:00Z", total: 120, items: 3, status: "Delivered" },
  { id: "ORD-002", date: "2024-07-15T15:30:00Z", total: 75, items: 2, status: "Processing" },
  { id: "ORD-003", date: "2024-06-10T11:00:00Z", total: 210, items: 5, status: "Cancelled" },
  { id: "ORD-004", date: "2024-05-25T09:00:00Z", total: 95, items: 1, status: "Delivered" },
  { id: "ORD-005", date: "2024-05-10T18:00:00Z", total: 150, items: 4, status: "Delivered" },
  { id: "ORD-006", date: "2024-04-20T12:00:00Z", total: 50, items: 1, status: "Delivered" },
];

export default function OrdersPage() {
    const [orderHistory, setOrderHistory] = useState(initialOrderHistory);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
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
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell>{order.items}</TableCell>
                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </TableCell>
                             <TableCell className="text-right">
                                {isOrderCancellable(order.status) ? (
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelClick(order)}>
                                        <Trash className="h-4 w-4 mr-1"/>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" disabled className="text-gray-400">
                                        <Trash className="h-4 w-4 mr-1"/>
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
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancellationReason.trim()}>Yes, Cancel Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
