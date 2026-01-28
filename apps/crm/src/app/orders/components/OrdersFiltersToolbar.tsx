import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ExportButtons } from '@/components/ExportButtons';
import { Order, OrderStatus } from '../types';

interface OrdersFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  exportData?: Order[];
  role: string;
  activeTab: string;
}

const OrdersFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  exportData,
  role,
  activeTab
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