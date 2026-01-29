import React from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Skeleton } from "@repo/ui/skeleton";
import { Badge } from "@repo/ui/badge";
import { User, CheckCircle, Clock, Eye, Edit, Package, Calendar, Truck, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Order, OrdersTableContentProps, MobileOrdersViewProps } from '../types';

export function OrdersTableContent({
  orders,
  role,
  isLoadingAll,
  isErrorAny,
  handleViewDetails,
  handleUpdateStatus,
  isUpdatingStatus,
  getStatusColor,
  getStatusIcon,
  getNextStatus,
  isOnlineOrder
}: OrdersTableContentProps) {
  if (isLoadingAll) {
    return (
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
    );
  }

  if (isErrorAny) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
        <p className="text-muted-foreground">There was a problem loading your orders. Please try again later.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
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
                      {order.items && order.items.map((item, idx: number) => (
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
                      {(role === 'supplier' || role === 'vendor') && order.status && getNextStatus(order.status, order) && (
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
      <MobileOrdersView
        orders={orders}
        handleViewDetails={handleViewDetails}
        handleUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isUpdatingStatus}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getNextStatus={getNextStatus}
        isOnlineOrder={isOnlineOrder}
        role={role}
      />
    </div>
  );
}

function MobileOrdersView({
  orders,
  handleViewDetails,
  handleUpdateStatus,
  isUpdatingStatus,
  getStatusColor,
  getStatusIcon,
  getNextStatus,
  isOnlineOrder,
  role
}: MobileOrdersViewProps) {
  return (
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
                {order.items && order.items.map((item, idx: number) => (
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
                  {(role === 'supplier' || role === 'vendor') && order.status && getNextStatus(order.status, order) && (
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
  );
}