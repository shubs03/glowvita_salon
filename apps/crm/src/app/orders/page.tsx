"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, FileDown, Truck, Package, ShoppingCart, User, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { useGetCrmOrdersQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { toast } from 'sonner';

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderId: string;
  items: OrderItem[];
  customerName?: string; // For B2C
  customerEmail?: string;
  vendorId?: string; // For B2B, the vendor who purchased
  supplierId?: string; // For B2B, the supplier who is selling
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
};

export default function OrdersPage() {
  const { user, role } = useCrmAuth();
  const [activeTab, setActiveTab] = useState(role === 'supplier' ? 'received-orders' : 'customer-orders');
  
  const { data: ordersData, isLoading, isError, refetch } = useGetCrmOrdersQuery(user?._id, { skip: !user });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const { customerOrders, myPurchases, receivedOrders } = useMemo(() => {
    if (!ordersData) return { customerOrders: [], myPurchases: [], receivedOrders: [] };
    
    // Vendor's orders from customers (B2C)
    const customerOrders = ordersData.filter((o: any) => o.vendorId === user?._id && o.customerName);
    
    // Vendor's purchases from suppliers (B2B)
    const myPurchases = ordersData.filter((o: any) => o.vendorId === user?._id && o.supplierId);
    
    // Supplier's received orders from vendors (B2B)
    const receivedOrders = ordersData.filter((o: any) => o.supplierId === user?._id);

    return { customerOrders, myPurchases, receivedOrders };
  }, [ordersData, user]);

  const filteredOrders = useMemo(() => {
    let dataToFilter = [];
    if (activeTab === 'customer-orders') dataToFilter = customerOrders;
    if (activeTab === 'my-purchases') dataToFilter = myPurchases;
    if (activeTab === 'received-orders') dataToFilter = receivedOrders;

    return dataToFilter.filter(order =>
      (order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
       order.items.some((item: any) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter === 'all' || order.status === statusFilter)
    );
  }, [searchTerm, statusFilter, activeTab, customerOrders, myPurchases, receivedOrders]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Packed':
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  
  const renderOrderTable = (orders: Order[]) => (
    <>
      <div className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product(s)</TableHead>
              <TableHead>{role === 'supplier' ? 'Vendor' : 'Customer'}</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image src={order.items[0].productImage || 'https://placehold.co/40x40.png'} alt={order.items[0].productName} width={40} height={40} className="rounded-md" />
                    <div>
                      <span className="font-medium">{order.items[0].productName}</span>
                      {order.items.length > 1 && <span className="text-xs text-muted-foreground"> +{order.items.length - 1} more</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{order.customerName || order.vendorId || 'N/A'}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>View Details</Button>
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
    </>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Orders</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }} className="w-full">
        <TabsList>
          {role === 'vendor' && <TabsTrigger value="customer-orders">Customer Orders</TabsTrigger>}
          {role === 'vendor' && <TabsTrigger value="my-purchases">My Purchases</TabsTrigger>}
          {role === 'supplier' && <TabsTrigger value="received-orders">Received Orders</TabsTrigger>}
        </TabsList>
        <Card className="mt-4">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>
                  {activeTab === 'customer-orders' && 'Your Customer Orders'}
                  {activeTab === 'my-purchases' && 'Your Purchases from Suppliers'}
                  {activeTab === 'received-orders' && 'Orders Received from Vendors'}
                </CardTitle>
                <CardDescription>Track and manage your orders.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="w-full md:w-64 pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
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
                <Button variant="outline">
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
      
      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.orderId}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {selectedOrder && (
              <>
                <OrderStatusTimeline currentStatus={selectedOrder.status} />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    {selectedOrder.items.map(item => (
                      <div key={item.productId} className="flex items-center gap-4 mb-4">
                        <Image src={item.productImage || 'https://placehold.co/64x64.png'} alt={item.productName} width={64} height={64} className="rounded-md" />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} x ₹{item.price.toFixed(2)}</p>
                        </div>
                        <p className="ml-auto font-medium">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <p className="text-sm">{selectedOrder.shippingAddress}</p>
                    
                    <h3 className="font-semibold mb-2 mt-4">Customer Information</h3>
                    <p className="text-sm">{selectedOrder.customerName || selectedOrder.vendorId}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail || 'No email provided'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
