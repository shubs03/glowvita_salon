import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Package, ShoppingCart, User, Mail, MapPin, Truck, XCircle, Calendar, Building } from 'lucide-react';
import Image from 'next/image';

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderId?: string; // Make orderId optional since ClientOrder doesn't have it
  items: OrderItem[];
  customerName?: string; 
  customerEmail?: string;
  vendorId?: string;
  supplierId?: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
  cancellationReason?: string; // Add cancellation reason field
  // For ClientOrder specific fields
  userId?: string; // To identify online orders
};

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
}

export function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  selectedOrder 
}: OrderDetailsModalProps) {
  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
        <style jsx>{`
          .modal-content::-webkit-scrollbar {
            display: none;
          }
          .modal-content {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          /* Indicate status icons are not clickable */
          .status-timeline div div {
            cursor: default;
          }
        `}</style>
        <DialogHeader className="p-6 pb-4 bg-muted">
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription>
            Order ID: #{selectedOrder.orderId || `ONLINE-${selectedOrder._id.substring(0, 8).toUpperCase()}`}
          </DialogDescription>
        </DialogHeader>
        <div className="modal-content overflow-y-auto max-h-[calc(80vh-6rem)] p-6 pt-4">
          <div className="space-y-6">
            {/* Order Progress */}
            <div className="status-timeline rounded-lg p-4 bg-muted">
              <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Order Progress
              </h3>
              <OrderStatusTimeline currentStatus={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items - Sticky */}
              <div className="lg:col-span-2 sticky top-0">
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Items Ordered ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div 
                        key={item.productId} 
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                      >
                        <Image 
                          src={item.productImage || 'https://placehold.co/60x60.png'} 
                          alt={item.productName} 
                          width={60} 
                          height={60} 
                          className="rounded-md object-cover border" 
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-md">{item.productName}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package className="h-3 w-3" />
                              Qty: {item.quantity}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>₹{(item.price || 0).toFixed(2)} each</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-md font-bold text-primary">₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Total */}
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex justify-between items-center">
                        <span className="text-md font-semibold">Total Amount</span>
                        <span className="text-xl font-bold text-primary">₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Customer Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{selectedOrder.customerName || `Vendor ID: ${selectedOrder.vendorId || ''}`}</span>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedOrder.shippingAddress || 'No shipping address provided'}</p>
                  </div>
                </div>

                {/* Cancellation Reason */}
                {selectedOrder.status === 'Cancelled' && selectedOrder.cancellationReason && (
                  <div className="rounded-lg p-4 border">
                    <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-primary" />
                      Cancellation Reason
                    </h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed">{selectedOrder.cancellationReason}</p>
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                {selectedOrder.trackingNumber && (
                  <div className="rounded-lg p-4 border">
                    <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Tracking Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">Courier</p>
                          <p className="text-xs text-muted-foreground">{selectedOrder.courier || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">Tracking Number</p>
                          <p className="text-xs font-mono text-primary">{selectedOrder.trackingNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Timeline */}
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Order Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.createdAt ? 
                            new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            'Date not available'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}