"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  X,
  ShoppingCart,
  TrendingUp,
  Package,
  Search,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { StatCard } from "../../../components/profile/StatCard";
import { Pagination } from "@repo/ui/pagination";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import Image from "next/image";
import { useGetClientOrdersQuery } from "@repo/store/src/services/api";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  origin?: string;
}

interface Order {
  _id: string;
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAmount?: number;
  taxAmount?: number;
  gstAmount?: number;
  platformFeeAmount?: number;
  status: string;
  shippingAddress: string;
  paymentMethod?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vendorId?: string;
  cancellationReason?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const {
    data: ordersData,
    isLoading,
    isError,
  } = useGetClientOrdersQuery(undefined, {
    skip: !user,
  });

  console.log("Orders Data on orders page : ", ordersData)

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all"); // Origin filter
  const [dateFromFilter, setDateFromFilter] = useState(""); // Date from filter
  const [dateToFilter, setDateToFilter] = useState(""); // Date to filter
  const [itemsCountFilter, setItemsCountFilter] = useState(""); // Items count filter

  const orderHistory: Order[] = ordersData?.data || [];

  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      const status = order?.status || "";
      // Determine the origin of items in the order
            const getOrderOrigin = (items: OrderItem[]) => {
              const origins = items.map(item => item.origin || 'Vendor');
              // Use filter to get unique values instead of Set
              const uniqueOrigins = origins.filter((value, index, self) => self.indexOf(value) === index);
              
              if (uniqueOrigins.length === 1) {
                return uniqueOrigins[0] === 'Supplier' ? 'Supplier' : 'Salon';
              } else {
                return 'Mixed';
              }
            };
            
            const origin = getOrderOrigin(order.items);
      const date = new Date(order?.createdAt);
      const itemsCount = order?.items?.length || 0;

      const isStatusMatch = statusFilter === "all" || status === statusFilter;
      const isOriginMatch = originFilter === "all" || origin === originFilter;
      const isDateFromMatch = !dateFromFilter || date >= new Date(dateFromFilter);
      const isDateToMatch = !dateToFilter || date <= new Date(dateToFilter);
      const isItemsCountMatch = !itemsCountFilter || itemsCount === parseInt(itemsCountFilter);

      return (
        isStatusMatch &&
        isOriginMatch &&
        isDateFromMatch &&
        isDateToMatch &&
        isItemsCountMatch
      );
    });
  }, [orderHistory, statusFilter, originFilter, dateFromFilter, dateToFilter, itemsCountFilter]);

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleViewClick = (order: Order) => {
    console.log('Viewing order:', order);
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !cancellationReason.trim()) return;

    try {
      console.log('Sending cancellation request for order:', orderToCancel._id, 'with reason:', cancellationReason);
      const response = await fetch('/api/client/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderToCancel._id,
          cancellationReason: cancellationReason,
        }),
      });

      const result = await response.json();
      console.log('Cancellation response:', result);
      
      if (result.success) {
        // Close the modal
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        setCancellationReason("");
        // Trigger a refetch of the orders
        window.location.reload();
      } else {
        console.error('Failed to cancel order:', result.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const isOrderCancellable = (status: string) => {
    return status === "Processing" || status === "Pending";
  };

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={orderHistory.length}
          change="All time"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Spent"
          value={`₹${orderHistory.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}`}
          change="On products"
        />
        <StatCard
          icon={Package}
          title="Delivered"
          value={orderHistory.filter((o) => o.status === "Delivered").length}
          change="All time"
        />
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Your product order history.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  <SelectItem value="Salon">Salon</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="From date"
                className="w-[150px]"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
              <Input
                type="date"
                placeholder="To date"
                className="w-[150px]"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Items count"
                className="w-[120px]"
                value={itemsCountFilter}
                onChange={(e) => setItemsCountFilter(e.target.value)}
              />
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
                  <TableHead>Origin</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-destructive"
                    >
                      Failed to load orders.
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((order) => {
                    // Determine the origin of items in the order
                    const getOrderOrigin = (items: OrderItem[]) => {
                      const origins = items.map(item => item.origin || 'Vendor');
                      // Use filter to get unique values instead of Set
                      const uniqueOrigins = origins.filter((value, index, self) => self.indexOf(value) === index);
                      
                      if (uniqueOrigins.length === 1) {
                        return uniqueOrigins[0] === 'Supplier' ? 'Supplier' : 'Salon';
                      } else {
                        return 'Mixed';
                      }
                    };

                    const orderOrigin = getOrderOrigin(order.items);
                    
                    // Get product names for the order
                    const productNames = order.items.map(item => item.name).join(', ');

                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono">
                          {order._id.slice(-6)}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.items.length} items</span>
                            <span className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]" title={productNames}>
                              {productNames}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              orderOrigin === 'Supplier' ? 'default' : 
                              orderOrigin === 'Salon' ? 'secondary' : 'outline'
                            }
                          >
                            {orderOrigin}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-2 text-sm" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </div>
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "default"
                                : order.status === "Cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isOrderCancellable(order.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelClick(order)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No orders found.
                    </TableCell>
                  </TableRow>
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
            totalItems={filteredOrders.length}
          />
        </CardContent>
      </Card>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{orderToCancel?._id.slice(-6)}? Please
              provide a reason for cancellation.
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
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!cancellationReason.trim()}
            >
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              Order Details: #{selectedOrder?._id.slice(-6)}
            </DialogTitle>
            <DialogDescription>
              Placed on{" "}
              {selectedOrder
                ? new Date(selectedOrder.createdAt).toLocaleDateString()
                : ""}
              {selectedOrder?.status && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {selectedOrder.status}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer & Shipping
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Shipping Address</p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                    {selectedOrder.status === 'Cancelled' && selectedOrder.cancellationReason && (
                      <div className="flex items-start gap-3">
                        <X className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Cancellation Reason</p>
                          <p className="text-muted-foreground">{selectedOrder.cancellationReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm p-4 bg-secondary rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>₹{(typeof selectedOrder.shippingAmount === 'number' ? selectedOrder.shippingAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span>₹{(typeof selectedOrder.gstAmount === 'number' ? selectedOrder.gstAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee (10%)</span>
                        <span>₹{(typeof selectedOrder.platformFeeAmount === 'number' ? selectedOrder.platformFeeAmount : 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span className="text-primary">
                        ₹{selectedOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t">
                      <span className="text-muted-foreground">
                        Payment Method:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3" />
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
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                          <Badge 
                            variant={
                              item.origin === 'Supplier' ? 'default' : 
                              item.origin === 'Vendor' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {item.origin === 'Supplier' ? 'Supplier' : 'Salon'}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
