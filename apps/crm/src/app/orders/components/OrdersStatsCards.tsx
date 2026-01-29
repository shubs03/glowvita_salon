import { Card, CardContent } from "@repo/ui/card";
import { Package, ShoppingCart, Truck, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface OrdersStatsCardsProps {
  orders: Order[];
}

const OrdersStatsCards = ({ orders }: OrdersStatsCardsProps) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{totalOrders}</p>
              <p className="text-xs text-primary/70 mt-1">All orders</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-secondary-foreground">{pendingOrders}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Awaiting processing</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <ShoppingCart className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Shipped</p>
              <p className="text-2xl font-bold text-secondary-foreground">{shippedOrders}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">In transit</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Truck className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Delivered</p>
              <p className="text-2xl font-bold text-secondary-foreground">{deliveredOrders}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Successfully delivered</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CheckCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersStatsCards;