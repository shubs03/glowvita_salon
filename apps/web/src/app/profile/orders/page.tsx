
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Trash, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';

const orderHistory = [
  { id: "ORD-001", date: "2024-08-01T10:00:00Z", total: 120, items: 3, status: "Delivered" },
  { id: "ORD-002", date: "2024-07-15T15:30:00Z", total: 75, items: 2, status: "Processing" },
  { id: "ORD-003", date: "2024-06-10T11:00:00Z", total: 210, items: 5, status: "Cancelled" },
  { id: "ORD-004", date: "2024-05-25T09:00:00Z", total: 95, items: 1, status: "Delivered" },
  { id: "ORD-005", date: "2024-05-10T18:00:00Z", total: 150, items: 4, status: "Delivered" },
  { id: "ORD-006", date: "2024-04-20T12:00:00Z", total: 50, items: 1, status: "Delivered" },
];

export default function OrdersPage() {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const handleCancelClick = (order) => {
        setOrderToCancel(order);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        console.log("Cancelling order:", orderToCancel?.id);
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
    };
    
    const isOrderCancellable = (orderDate: string) => {
        const now = new Date();
        const ordDate = new Date(orderDate);
        const hoursDifference = (now.getTime() - ordDate.getTime()) / (1000 * 60 * 60);
        return hoursDifference < 1;
    };

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = orderHistory.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(orderHistory.length / itemsPerPage);
    
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={ShoppingCart} title="Total Orders" value={orderHistory.length} change="All time" />
                <StatCard icon={TrendingUp} title="Total Spent" value={`₹${orderHistory.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`} change="On products" />
                <StatCard icon={Package} title="Delivered" value={orderHistory.filter(o => o.status === 'Delivered').length} change="All time" />
            </div>
            <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>Your product order history.</CardDescription>
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
                                {isOrderCancellable(order.date) && order.status === 'Processing' ? (
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
                    totalItems={orderHistory.length}
                  />
                </CardContent>
              </Card>
            
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel order {orderToCancel?.id}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel}>Yes, Cancel Order</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
