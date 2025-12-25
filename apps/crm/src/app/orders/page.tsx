
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Badge } from "@repo/ui/badge";
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, FileDown, Truck, Package, ShoppingCart, User, CheckCircle, Clock, Eye, Edit, XCircle, MapPin, Calendar, Mail, Phone, Building } from 'lucide-react';
import Image from 'next/image';
import { useGetCrmOrdersQuery, useUpdateCrmOrderMutation, useGetCrmClientOrdersQuery, useUpdateCrmClientOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { toast } from 'sonner';
import { Label } from 'recharts';

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderId?: string; // Make orderId optional since ClientOrder doesn't have it
  items: OrderItem[];
  customerName?: string; 
  customerEmail?: string;
  vendorId?: string;
  supplierId?: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
  cancellationReason?: string; // Add cancellation reason field
  // For ClientOrder specific fields
  userId?: string; // To identify online orders
};

export default function OrdersPage() {
  const { user, role } = useCrmAuth();
  const defaultTab = role === 'supplier' ? 'received-orders' : (role === 'vendor' ? 'customer-orders' : 'my-purchases');
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // For suppliers, we need to fetch different types of orders based on the active tab
  const orderQueryParams = useMemo(() => {
    if (role === 'supplier') {
      return { type: activeTab === 'customer-orders' ? 'customer-orders' : 'received-orders' };
    }
    return {};
  }, [role, activeTab]);
  
  const { data: ordersData = [], isLoading, isError, refetch } = useGetCrmOrdersQuery(
    user?._id, 
    { 
      skip: !user,
      refetchOnMountOrArgChange: true
    }
  );
  
  const { data: clientOrdersData = [], isLoading: isClientOrdersLoading, isError: isClientOrdersError } = useGetCrmClientOrdersQuery(
    undefined, 
    { 
      skip: role !== 'vendor' && role !== 'supplier',
      refetchOnMountOrArgChange: true
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updateOrder, { isLoading: isUpdatingStatus }] = useUpdateCrmOrderMutation();
  const [updateClientOrder] = useUpdateCrmClientOrderMutation();
  const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: '', courier: '' });
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState<Order | null>(null);


  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const { customerOrders, myPurchases, receivedOrders, onlineCustomerOrders } = useMemo(() => {
    if (!ordersData) return { customerOrders: [], myPurchases: [], receivedOrders: [], onlineCustomerOrders: [] };
    
    const customerOrders = ordersData.filter((o: Order) => o.vendorId?.toString() === user?._id && o.customerName);
    const myPurchases = ordersData.filter((o: Order) => o.vendorId?.toString() === user?._id && o.supplierId);
    const receivedOrders = ordersData.filter((o: Order) => o.supplierId?.toString() === user?._id);
    
    // Transform ClientOrder data to match our Order type
    const transformedOnlineOrders = (clientOrdersData || [])
      .map((clientOrder: any) => {
        // Transform items from ClientOrder format to OrderItem format
        const transformedItems = (clientOrder.items || []).map((item: any) => ({
          productId: item.productId || '',
          productName: item.name || 'Unknown Product',
          productImage: item.image || 'https://placehold.co/80x80.png',
          quantity: item.quantity || 0,
          price: item.price || 0
        }));
        
        // Create an Order object from ClientOrder data
        // Skip orders without a valid _id to prevent phantom orders
        if (!clientOrder._id) {
          return null;
        }
        
        return {
          _id: clientOrder._id,
          orderId: undefined, // ClientOrder doesn't have this field
          items: transformedItems,
          customerName: 'Online Customer', // ClientOrder has userId but not customer name
          customerEmail: undefined,
          vendorId: clientOrder.vendorId || '',
          supplierId: undefined,
          totalAmount: clientOrder.totalAmount || 0,
          status: clientOrder.status || 'Pending',
          shippingAddress: clientOrder.shippingAddress || '',
          createdAt: clientOrder.createdAt || new Date().toISOString(),
          trackingNumber: clientOrder.trackingNumber,
          courier: undefined,
          cancellationReason: clientOrder.cancellationReason, // Add cancellation reason
          userId: clientOrder.userId // To identify as online order
        };
      })
      .filter((order: any) => order !== null); // Filter out null values
    
    return { 
      customerOrders, 
      myPurchases, 
      receivedOrders, 
      onlineCustomerOrders: transformedOnlineOrders 
    };
  }, [ordersData, clientOrdersData, user]);

  const filteredOrders = useMemo(() => {
    let dataToFilter: Order[] = [];
    if (activeTab === 'customer-orders') dataToFilter = [...customerOrders, ...onlineCustomerOrders];
    if (activeTab === 'my-purchases') dataToFilter = myPurchases;
    if (activeTab === 'received-orders') dataToFilter = receivedOrders;

    return dataToFilter.filter((order: Order) =>
      ((order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.items && order.items.some((item: OrderItem) => 
        item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ))) &&
      (statusFilter === 'all' || (order.status && order.status === statusFilter))
    );
  }, [searchTerm, statusFilter, activeTab, customerOrders, myPurchases, receivedOrders, onlineCustomerOrders]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'Shipped': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'Packed': return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case 'Processing': return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300';
      case 'Pending': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'Cancelled': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-4 w-4" />;
      case 'Shipped': return <Truck className="h-4 w-4" />;
      case 'Packed': return <Package className="h-4 w-4" />;
      case 'Processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    // Validate that the order exists before trying to update it
    const orderExists = [...receivedOrders, ...customerOrders, ...myPurchases, ...onlineCustomerOrders].some(
      (o: Order) => o._id === orderId
    );
    
    if (!orderExists) {
      toast.error("Order not found. Please refresh the page and try again.");
      refetch();
      return;
    }
    
    // Check if this is an online customer order (has userId field)
    const isOnlineOrder = onlineCustomerOrders.some((o: Order) => o._id === orderId);
    
    if (status === 'Shipped') {
        // Look for the order in all collections
        const order = [...receivedOrders, ...customerOrders, ...myPurchases, ...onlineCustomerOrders].find(
            (o: Order) => o._id === orderId
        );
        setOrderToShip(order || null);
        setIsShipModalOpen(true);
    } else {
        try {
            if (isOnlineOrder) {
                // Use client order update mutation for online orders
                await updateClientOrder({ orderId, status }).unwrap();
            } else {
                // Use regular order update mutation for vendor orders
                await updateOrder({ orderId, status }).unwrap();
            }
            toast.success(`Order status updated to ${status}.`);
            refetch();
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    }
  };

  const handleShipOrder = async () => {
    if (!orderToShip) return;
    
    // Validate that the order exists before trying to update it
    const orderExists = [...receivedOrders, ...customerOrders, ...myPurchases, ...onlineCustomerOrders].some(
      (o: Order) => o._id === orderToShip._id
    );
    
    if (!orderExists) {
      toast.error("Order not found. Please refresh the page and try again.");
      refetch();
      setIsShipModalOpen(false);
      setOrderToShip(null);
      return;
    }
    
    // Check if this is an online customer order (has userId field)
    const isOnlineOrder = onlineCustomerOrders.some((o: Order) => o._id === orderToShip._id);
    
    try {
        if (isOnlineOrder) {
            // Use client order update mutation for online orders
            await updateClientOrder({ 
                orderId: orderToShip._id, 
                status: 'Shipped',
                trackingNumber: trackingInfo.trackingNumber,
                courier: trackingInfo.courier
            }).unwrap();
        } else {
            // Use regular order update mutation for vendor orders
            await updateOrder({ 
                orderId: orderToShip._id, 
                status: 'Shipped',
                trackingNumber: trackingInfo.trackingNumber,
                courier: trackingInfo.courier
            }).unwrap();
        }
        toast.success(`Order ${orderToShip.orderId} marked as shipped.`);
        refetch();
        setIsShipModalOpen(false);
        setOrderToShip(null);
        setTrackingInfo({ trackingNumber: '', courier: '' });
    } catch (error) {
        toast.error("Failed to ship order.");
    }
  };

  const isLoadingAll = isLoading || isClientOrdersLoading;
  const isErrorAny = isError || isClientOrdersError;

  const isOnlineOrder = (order: Order) => {
    // Online orders from ClientOrder model will have a userId field
    return !!order.userId;
  };

  const getNextStatus = (currentStatus: Order['status'], order: Order) => {
    // Different status flows for different order types
    const vendorOrderStatuses: Order['status'][] = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const clientOrderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    // Use appropriate status flow based on order type
    const statuses = isOnlineOrder(order) ? clientOrderStatuses : vendorOrderStatuses;
    const currentIndex = statuses.indexOf(currentStatus);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };

  const renderOrderTable = (orders: Order[]) => (
    <>
      {isLoadingAll ? (
        // Loading state with skeleton loaders
        <div className="space-y-4">
          {/* Desktop Skeleton View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <Table>
                <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="font-semibold">Order Details</TableHead>
                    <TableHead className="font-semibold">Products</TableHead>
                    <TableHead className="font-semibold">{role === 'supplier' ? 'Vendor' : 'Customer'}</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index} className="border-border/30">
                      <TableCell>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Skeleton className="h-8 w-16 rounded-lg" />
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Skeleton View */}
          <div className="lg:hidden space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="overflow-hidden border-border/50">
                <CardContent className="p-0">
                  <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border/20">
                      <div>
                        <Skeleton className="h-6 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isErrorAny ? (
        // Show "No orders found" when there's an error
        <div className="text-center py-16">
          <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground">There was a problem loading your orders. Please try again later.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <Table>
                <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="font-semibold">Order Details</TableHead>
                    <TableHead className="font-semibold">Products</TableHead>
                    <TableHead className="font-semibold">{role === 'supplier' ? 'Vendor' : 'Customer'}</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow 
                      key={order._id} 
                      className="hover:bg-muted/30 transition-colors border-border/30"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-bold text-primary">
                              #{order.orderId || `ONLINE-${order._id.substring(0, 8).toUpperCase()}`}
                            </p>
                            {isOnlineOrder(order) ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-0.5 rounded-full">
                                Online
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-0.5 rounded-full">
                                Offline
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {order.items && order.items.map((item: OrderItem, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="relative">
                                <Image 
                                  src={item.productImage || 'https://placehold.co/50x50.png'} 
                                  alt={item.productName} 
                                  width={50} 
                                  height={50} 
                                  className="rounded-lg object-cover border border-border/30" 
                                />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-medium text-xs">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.customerName || order.vendorId || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-lg text-primary">₹{(order.totalAmount || 0).toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border-2 font-medium px-2 py-1 rounded-full flex items-center gap-1 w-fit text-xs`}>
                          {getStatusIcon(order.status)}
                          <span className="hidden sm:inline">{order.status || 'Unknown'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(order)}
                            className="rounded-lg hover:bg-primary/10 hover:border-primary/30 h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {role === 'supplier' && order.status && getNextStatus(order.status, order) && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status, order)!)} 
                              disabled={isUpdatingStatus}
                              className="rounded-lg bg-gradient-to-r from-primary to-primary/80 h-8 px-2 text-xs"
                            >
                              {isUpdatingStatus ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-background border-t-transparent"></div>
                              ) : (
                                <>
                                  <Edit className="mr-1 h-3 w-3" />
                                  <span className="hidden sm:inline">
                                    {`Mark as ${getNextStatus(order.status, order)}`}
                                  </span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.map((order, index) => (
              <Card 
                key={order._id} 
                className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-bold text-primary">
                            #{order.orderId || `ONLINE-${order._id.substring(0, 8).toUpperCase()}`}
                          </p>
                          {isOnlineOrder(order) ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-0.5 rounded-full">
                              Online
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-0.5 rounded-full">
                              Offline
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border-2 font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        <span className="text-xs">{order.status || 'Unknown'}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-4">
                    {/* Products */}
                    <div className="space-y-3">
                      {order.items && order.items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="relative">
                            <Image 
                              src={item.productImage || 'https://placehold.co/60x60.png'} 
                              alt={item.productName} 
                              width={60} 
                              height={60} 
                              className="rounded-lg object-cover border border-border/30" 
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {order.customerName || order.vendorId || 'N/A'}
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/20">
                      <div>
                        <p className="text-xl font-bold text-primary">₹{(order.totalAmount || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(order)}
                          className="rounded-lg h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === 'supplier' && order.status && getNextStatus(order.status, order) && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status, order)!)} 
                            disabled={isUpdatingStatus}
                            className="rounded-lg bg-gradient-to-r from-primary to-primary/80 h-8 px-2 text-xs"
                          >
                            {isUpdatingStatus ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-background border-t-transparent"></div>
                            ) : (
                              <>
                                <Edit className="mr-1 h-3 w-3" />
                                <span className="hidden sm:inline">
                                  {`Mark as ${getNextStatus(order.status, order)}`}
                                </span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {orders.length > 0 && (
        <Pagination
          className="mt-8"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filteredOrders.length}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Track and manage all your orders in one place
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }} className="w-full">
          {/* Enhanced Tab List */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-muted/50 backdrop-blur-sm">
              {(role === 'vendor' || role === 'supplier') && (
                <TabsTrigger 
                  value="customer-orders" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 font-medium transition-all"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Customer Orders
                </TabsTrigger>
              )}
              {role === 'vendor' && (
                <TabsTrigger 
                  value="my-purchases" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 font-medium transition-all"
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Purchases
                </TabsTrigger>
              )}
              {role === 'supplier' && (
                <TabsTrigger 
                  value="received-orders" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 font-medium transition-all"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Received Orders
                </TabsTrigger>
              )}
            </TabsList>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 rounded-full border border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {filteredOrders.filter(o => o.status === 'Delivered').length} Delivered
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full border border-yellow-300">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {filteredOrders.filter(o => o.status === 'Pending').length} Pending
                </span>
              </div>
            </div>
          </div>

          <Card className="backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {activeTab === 'customer-orders' && 'Customer Orders'}
                    {activeTab === 'my-purchases' && 'My Purchases'}
                    {activeTab === 'received-orders' && 'Received Orders'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {activeTab === 'customer-orders' && 'Orders from your customers for your products'}
                    {activeTab === 'my-purchases' && 'Your orders from suppliers'}
                    {activeTab === 'received-orders' && 'Orders you received from vendors'}
                  </CardDescription>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search orders, products..."
                      className="w-full lg:w-80 pl-12 pr-4 h-12 rounded-2xl border-border/30 focus:border-primary focus:ring-primary/20 bg-background/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-[200px] h-12 rounded-xl border-border/30">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-border/30">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderOrderTable(currentItems)}
            </CardContent>
          </Card>
        </Tabs>
      
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
            <DialogDescription>
              Order ID: #{selectedOrder?.orderId || `ONLINE-${selectedOrder?._id?.substring(0, 8).toUpperCase()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(80vh-6rem)] p-6 pt-4">
            {selectedOrder && (
              <div className="space-y-6">
                {/* Enhanced Status Timeline */}
                <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Order Progress
                  </h3>
                  <OrderStatusTimeline currentStatus={selectedOrder.status} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                      <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Items Ordered ({selectedOrder?.items?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder?.items?.map((item: OrderItem, index: number) => (
                          <div 
                            key={item.productId} 
                            className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/10"
                          >
                            <Image 
                              src={item.productImage || 'https://placehold.co/60x60.png'} 
                              alt={item.productName} 
                              width={60} 
                              height={60} 
                              className="rounded-md object-cover border border-border/10" 
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-md">{item.productName}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Package className="h-3 w-3" />
                                  Qty: {item.quantity}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>₹{(item.price || 0).toFixed(2)} each</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-md font-bold text-primary">₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Order Total */}
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/10">
                          <div className="flex justify-between items-center">
                            <span className="text-md font-semibold">Total Amount</span>
                            <span className="text-xl font-bold text-primary">₹{(selectedOrder?.totalAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                      <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Customer Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{selectedOrder?.customerName || `Vendor ID: ${selectedOrder?.vendorId || ''}`}</span>
                        </div>
                        {selectedOrder?.customerEmail && (
                          <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedOrder.customerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                      <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Shipping Address
                      </h3>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedOrder?.shippingAddress || 'No shipping address provided'}</p>
                      </div>
                    </div>

                    {/* Cancellation Reason */}
                    {selectedOrder?.status === 'Cancelled' && selectedOrder?.cancellationReason && (
                      <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                        <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-primary" />
                          Cancellation Reason
                        </h3>
                        <div className="p-3 bg-muted/10 rounded-lg">
                          <p className="text-sm leading-relaxed">{selectedOrder.cancellationReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Tracking Information */}
                    {selectedOrder?.trackingNumber && (
                      <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                        <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          Tracking Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs font-medium">Courier</p>
                              <p className="text-xs text-muted-foreground">{selectedOrder.courier || 'Not specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs font-medium">Tracking Number</p>
                              <p className="text-xs font-mono text-primary">{selectedOrder.trackingNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Timeline */}
                    <div className="bg-gradient-to-r from-background to-muted/10 rounded-xl p-4 border border-border/20">
                      <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Order Timeline
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">Order Placed</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedOrder?.createdAt ? 
                                new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                'Date not available'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isShipModalOpen} onOpenChange={setIsShipModalOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Ship Order
                </DialogTitle>
                <DialogDescription>
                  Enter tracking information for order #{orderToShip?.orderId || `ONLINE-${orderToShip?._id?.substring(0, 8).toUpperCase()}`}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Tracking Number</Label>
                  <Input 
                    placeholder="Enter tracking number" 
                    value={trackingInfo.trackingNumber} 
                    onChange={e => setTrackingInfo(prev => ({...prev, trackingNumber: e.target.value}))}
                    className="h-12 rounded-xl border-border/30 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Courier Service</Label>
                  <Input 
                    placeholder="Enter courier name (e.g., FedEx, DHL)" 
                    value={trackingInfo.courier} 
                    onChange={e => setTrackingInfo(prev => ({...prev, courier: e.target.value}))}
                    className="h-12 rounded-xl border-border/30 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                
                {/* Order Preview */}
                {orderToShip && (
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono">
                          #{orderToShip.orderId || `ONLINE-${orderToShip._id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-primary">₹{(orderToShip.totalAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span>{(orderToShip.items?.length || 0)} product{(orderToShip.items?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setIsShipModalOpen(false)} className="px-6">
                  Cancel
                </Button>
                <Button 
                  onClick={handleShipOrder} 
                  disabled={isUpdatingStatus || !trackingInfo.trackingNumber.trim() || !trackingInfo.courier.trim()}
                  className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
                      Shipping...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Confirm Shipment
                    </>
                  )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
