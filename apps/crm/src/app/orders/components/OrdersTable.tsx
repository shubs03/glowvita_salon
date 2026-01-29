import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, Edit } from "lucide-react";
import { Order, OrderStatus } from "../types";

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
                    colSpan={6}
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
                        <div key={idx}>
                          {item.productName}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="min-w-[120px] max-w-[150px] truncate">
                      {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                    </TableCell>
                    <TableCell>
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(role === "supplier" || role === "vendor") &&
                          order.status &&
                          getNextStatus(order.status, order) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(
                                  order._id,
                                  getNextStatus(order.status, order)!
                                )
                              }
                              disabled={isUpdatingStatus}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
