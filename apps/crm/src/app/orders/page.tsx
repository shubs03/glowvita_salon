"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Tabs } from "@repo/ui/tabs";
import { useGetCrmOrdersQuery, useUpdateCrmOrderMutation, useGetCrmClientOrdersQuery, useUpdateCrmClientOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { CheckCircle, Truck, Package, Clock, XCircle } from 'lucide-react';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { ShipOrderModal } from './components/ShipOrderModal';

// Import new components
import OrdersStatsCards from './components/OrdersStatsCards';
import OrdersFiltersToolbar from './components/OrdersFiltersToolbar';
import OrdersTable from './components/OrdersTable';
import OrdersPaginationControls from './components/OrdersPaginationControls';

import { Order, OrderItem } from './types';

export default function OrdersPage() {
  const { user, role } = useCrmAuth();
  const defaultTab = role === 'supplier' ? 'received-orders' : (role === 'vendor' ? 'customer-orders' : 'my-purchases');
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const { data: ordersData = [], isLoading, isError, refetch } = useGetCrmOrdersQuery(
    undefined, 
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
  const [viewMode, setViewMode] = useState<'orders' | 'purchases'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updateOrder, { isLoading: isUpdatingStatus }] = useUpdateCrmOrderMutation();
  const [updateClientOrder] = useUpdateCrmClientOrderMutation();
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState<Order | null>(null);


  const { customerOrders, myPurchases, receivedOrders, onlineCustomerOrders } = useMemo(() => {
    if (!ordersData) return { customerOrders: [], myPurchases: [], receivedOrders: [], onlineCustomerOrders: [] };
    
    const customerOrders = ordersData.filter((o: Order) => o.vendorId?.toString() === user?._id && o.customerName);
    const myPurchases = ordersData.filter((o: Order) => o.vendorId?.toString() === user?._id && o.supplierId);
    const receivedOrders = ordersData.filter((o: Order) => o.supplierId?.toString() === user?._id);
    
    const transformedOnlineOrders = (clientOrdersData || [])
      .map((clientOrder: any) => {
        const transformedItems = (clientOrder.items || []).map((item: any) => ({
          productId: item.productId || '',
          productName: item.name || 'Unknown Product',
          productImage: item.image || 'https://placehold.co/80x80.png',
          quantity: item.quantity || 0,
          price: item.price || 0
        }));
        
        if (!clientOrder._id) {
          return null;
        }
        
        return {
          _id: clientOrder._id,
          orderId: undefined,
          items: transformedItems,
          customerName: 'Online Customer',
          customerEmail: undefined,
          vendorId: clientOrder.vendorId || '',
          supplierId: undefined,
          totalAmount: clientOrder.totalAmount || 0,
          status: clientOrder.status || 'Pending',
          shippingAddress: clientOrder.shippingAddress || '',
          createdAt: clientOrder.createdAt || new Date().toISOString(),
          trackingNumber: clientOrder.trackingNumber,
          courier: undefined,
          cancellationReason: clientOrder.cancellationReason,
          userId: clientOrder.userId
        };
      })
      .filter((order: any) => order !== null);
    
    return { 
      customerOrders, 
      myPurchases, 
      receivedOrders, 
      onlineCustomerOrders: transformedOnlineOrders 
    };
  }, [ordersData, clientOrdersData, user]);

  const filteredOrders = useMemo(() => {
    let dataToFilter: Order[] = [];
    
    // Determine data to filter based on viewMode first, then fall back to activeTab
    // Suppliers should never see purchases view
    if (viewMode === 'purchases' && role !== 'supplier') {
      dataToFilter = myPurchases;
    } else {
      // Default to activeTab logic when not in purchases view
      if (activeTab === 'customer-orders') dataToFilter = [...customerOrders, ...onlineCustomerOrders];
      if (activeTab === 'my-purchases' && role !== 'supplier') dataToFilter = myPurchases;
      // For received-orders: Suppliers see both B2B orders (from vendors) and B2C orders (from online customers)
      if (activeTab === 'received-orders') {
        if (role === 'supplier') {
          dataToFilter = [...receivedOrders, ...onlineCustomerOrders];
        } else {
          dataToFilter = receivedOrders;
        }
      }
    }
    
    return dataToFilter.filter((order: Order) =>
      ((order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.items && order.items.some((item: OrderItem) => 
        item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ))) &&
      (statusFilter === 'all' || (order.status && order.status === statusFilter))
    );
  }, [searchTerm, statusFilter, activeTab, viewMode, customerOrders, myPurchases, receivedOrders, onlineCustomerOrders]);

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
    const orderExists = [...receivedOrders, ...customerOrders, ...myPurchases, ...onlineCustomerOrders].some(
      (o: Order) => o._id === orderId
    );
    
    if (!orderExists) {
      toast.error("Order not found. Please refresh the page and try again.");
      refetch();
      return;
    }
    
    const isOnlineOrder = onlineCustomerOrders.some((o: Order) => o._id === orderId);
    
    if (status === 'Shipped') {
        const order = [...receivedOrders, ...customerOrders, ...myPurchases, ...onlineCustomerOrders].find(
            (o: Order) => o._id === orderId
        );
        setOrderToShip(order || null);
        setIsShipModalOpen(true);
    } else {
        try {
            if (isOnlineOrder) {
                await updateClientOrder({ orderId, status }).unwrap();
            } else {
                await updateOrder({ orderId, status }).unwrap();
            }
            toast.success(`Order status updated to ${status}.`);
            refetch();
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    }
  };

  const handleShipOrder = async (trackingInfo: { trackingNumber: string; courier: string }) => {
    if (!orderToShip) return;
    
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
    
    const isOnlineOrder = onlineCustomerOrders.some((o: Order) => o._id === orderToShip._id);
    
    try {
        if (isOnlineOrder) {
            await updateClientOrder({ 
                orderId: orderToShip._id, 
                status: 'Shipped',
                trackingNumber: trackingInfo.trackingNumber,
                courier: trackingInfo.courier
            }).unwrap();
        } else {
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
    } catch (error) {
        toast.error("Failed to ship order.");
    }
  };

  const isLoadingAll = isLoading || isClientOrdersLoading;
  const isErrorAny = isError || isClientOrdersError;

  const isOnlineOrder = (order: Order) => {
    return !!order.userId;
  };

  const getNextStatus = (currentStatus: Order['status'], order: Order) => {
    const vendorOrderStatuses: Order['status'][] = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const clientOrderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    const statuses = isOnlineOrder(order) ? clientOrderStatuses : vendorOrderStatuses;
    const currentIndex = statuses.indexOf(currentStatus);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Track and manage all your orders in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Orders Stats Cards */}
        <OrdersStatsCards orders={filteredOrders} />

        {/* Filters Toolbar */}
        <OrdersFiltersToolbar
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          exportData={filteredOrders}
          role={role}
          activeTab={activeTab}
          onViewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Orders Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <OrdersTable
              currentItems={currentItems}
              searchTerm={searchTerm}
              role={role}
              activeTab={activeTab}
              viewMode={viewMode}
              handleViewDetails={handleViewDetails}
              handleUpdateStatus={handleUpdateStatus}
              isUpdatingStatus={isUpdatingStatus}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getNextStatus={getNextStatus}
              isOnlineOrder={isOnlineOrder}
            />
          </div>
        </div>

        {/* Pagination Controls */}
        <OrdersPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredOrders.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Modals */}
        <OrderDetailsModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          selectedOrder={selectedOrder}
        />
        
        <ShipOrderModal
          isOpen={isShipModalOpen}
          onClose={() => setIsShipModalOpen(false)}
          onConfirm={handleShipOrder}
          orderToShip={orderToShip}
          isUpdatingStatus={isUpdatingStatus}
        />
      </div>
    </div>
  );
}