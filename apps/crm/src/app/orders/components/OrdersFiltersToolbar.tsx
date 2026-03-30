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
  onViewMode: 'orders' | 'purchases';
  onViewModeChange: (mode: 'orders' | 'purchases') => void;
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
  onRefetch,
  isRefreshing
}: OrdersFiltersToolbarProps) => {
  const getExportColumns = () => {
    if (activeTab === 'customer-orders') {
      return [
        { header: 'Order ID', key: 'orderId' },
        { header: 'Customer Name', key: 'customerName' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Created At', key: 'createdAt' }
      ];
    } else if (activeTab === 'my-purchases') {
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
    if (activeTab === 'customer-orders') return 'Customer Orders Report';
    if (activeTab === 'my-purchases') return 'My Purchases Report';
    return 'Received Orders Report';
  };

  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders, products..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {onRefetch && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefetch}
              disabled={isRefreshing}
              className="h-12 w-12 rounded-lg shrink-0"
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}

          {/* Tab Switcher Button - Only show for vendors, not suppliers */}
          {role !== 'supplier' && (
            <div className="">
              <div className="flex items-center rounded-md border border-border/20 overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => onViewModeChange('orders')}
                  className={`h-12 px-4 sm:px-6 flex items-center transition-colors ${onViewMode === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Orders</span>
                  <span className="sm:hidden">O</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('purchases')}
                  className={`h-12 px-4 sm:px-6 flex items-center transition-colors ${onViewMode === 'purchases' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
                >
                  <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Purchases</span>
                  <span className="sm:hidden">P</span>
                </button>
              </div>
            </div>
          )}

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Filter by status" />
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
          {exportData && (
            <ExportButtons
              data={exportData}
              filename={`${activeTab}_export`}
              title={getExportTitle()}
              columns={getExportColumns()}
              className="h-12"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersFiltersToolbar;