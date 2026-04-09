import { Input } from '@repo/ui/input';
import { Search, ShoppingCart, Package, RefreshCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ExportButtons } from '@/components/ExportButtons';
import { Order, OrderStatus } from '../types';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';

interface OrdersFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  exportData?: Order[];
  role: string;
  activeTab: string;
  onViewMode: string;
  onViewModeChange: (mode: string) => void;
  orderLabel?: string;
  purchasesLabel?: string;
  onRefetch?: () => void;
  isRefreshing?: boolean;
}

const OrdersFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  exportData,
  role,
  activeTab,
  onViewMode,
  onViewModeChange,
  orderLabel = "Orders",
  purchasesLabel = "Purchases",
  onRefetch,
  isRefreshing
}: OrdersFiltersToolbarProps) => {
  const getExportColumns = () => {
    if (activeTab === 'customer-orders' || activeTab === 'online-orders') {
      return [
        { header: 'Order ID', key: 'orderId' },
        { header: 'Customer Name', key: 'customerName' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Created At', key: 'createdAt' }
      ];
    } else if (activeTab === 'my-purchases' || activeTab === 'marketplace-orders') {
      return [
        { header: 'Order ID', key: 'orderId' },
        { header: 'Vendor ID', key: 'vendorId' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Created At', key: 'createdAt' }
      ];
    } else {
      return [
        { header: 'Order ID', key: 'orderId' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Created At', key: 'createdAt' }
      ];
    }
  };

  const getExportTitle = () => {
    if (activeTab === 'customer-orders' || activeTab === 'online-orders') return 'Online Orders Report';
    if (activeTab === 'my-purchases') return 'My Purchases Report';
    if (activeTab === 'marketplace-orders') return 'Marketplace Orders Report';
    return 'Received Orders Report';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders, products..."
            className="pl-10 h-11 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px] h-11 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Packed">Packed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {onRefetch && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefetch}
              disabled={isRefreshing}
              className="h-11 w-11 rounded-lg shrink-0"
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}

          {exportData && (
            <ExportButtons
              data={exportData}
              filename={`${activeTab}_export`}
              title={getExportTitle()}
              columns={getExportColumns()}
              className="h-11"
            />
          )}
        </div>
      </div>

      <div className="flex justify-start">
        <div className="inline-flex p-1 bg-muted/30 rounded-xl border border-border/40 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('orders')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              onViewMode === 'orders' 
                ? "bg-background text-foreground shadow-md ring-1 ring-border/20" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{orderLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('purchases')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              onViewMode === 'purchases' 
                ? "bg-background text-foreground shadow-md ring-1 ring-border/20" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Package className="h-4 w-4" />
            <span>{purchasesLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersFiltersToolbar;