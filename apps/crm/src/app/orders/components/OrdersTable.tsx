import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, ChevronDown } from "lucide-react";
import { Order, OrderStatus } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/cn";

interface OrdersTableProps {
  currentItems: Order[];
  searchTerm: string;
  role: string;
  activeTab: string;
  viewMode: 'orders' | 'purchases';
  handleViewDetails: (order: Order) => void;
  handleUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
  getStatusColor: (status: OrderStatus) => string;
  getStatusIcon: (status: OrderStatus) => React.ReactNode;
  getNextStatus: (
    currentStatus: OrderStatus,
    order: Order
  ) => OrderStatus | null;
  isOnlineOrder: (order: Order) => boolean;
}

const OrdersTable = ({
  currentItems,
  searchTerm,
  role,
  activeTab,
  viewMode,
  handleViewDetails,
  handleUpdateStatus,
  isUpdatingStatus,
  getStatusColor,
  getStatusIcon,
  getNextStatus,
  isOnlineOrder,
}: OrdersTableProps) => {
  const allStatuses: OrderStatus[] = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Order ID</TableHead>
                <TableHead className="min-w-[150px]">Customer</TableHead>
                <TableHead className="min-w-[120px]">Items</TableHead>
                <TableHead className="min-w-[120px]">Count</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No orders found matching your criteria"
                      : "No orders found"}
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold truncate max-w-[80px]">
                          #
                          {order.orderId ||
                            `ONLINE-${order._id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px] max-w-[180px] truncate">
                      {order.customerName ||
                        (role === "supplier" && order.vendorId) ||
                        "N/A"}
                    </TableCell>
                    <TableCell className="min-w-[120px] max-w-[150px] truncate">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-xs">
                          {item.productName}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm",
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="h-8 gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>

                        {(role === "supplier" || role === "vendor") && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdatingStatus}
                                className="h-8 gap-1 border-primary/20 hover:border-primary/50 text-primary"
                              >
                                <span>Update</span>
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {allStatuses
                                .filter(s => s !== order.status)
                                .map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleUpdateStatus(order._id, status)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(status)}
                                      <span>{status}</span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;

