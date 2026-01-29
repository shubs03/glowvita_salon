import React from 'react';
import { TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ShoppingCart, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Badge } from "@repo/ui/badge";
import { Order, OrdersTabsProps } from './types';

export function OrdersTabs({ 
  role, 
  activeTab, 
  setActiveTab, 
  setCurrentPage,
  filteredOrders
}: OrdersTabsProps) {
  return (
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
  );
}